/**
 * SEO-Helfer: Basis-URL, Beschreibungslänge, Open Graph.
 * Titel: 50–60 Zeichen. Description: 150–160 Zeichen.
 */

const DESCRIPTION_MAX = 160;

export function getBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "https://followerbase.de";
  return base.startsWith("http") ? base.replace(/\/$/, "") : `https://${base}`.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Meta-Description auf ~158 Zeichen kürzen (SEO-empfohlen). */
export function truncateDescription(text: string | undefined, max = DESCRIPTION_MAX): string {
  if (!text || !text.trim()) return "";
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return t.slice(0, max - 3).trim() + "...";
}

export const SITE_NAME = "Followerbase";
/** Optional: z. B. /opengraph.png (1200×630) für Social-Sharing. */
export const DEFAULT_OG_IMAGE_PATH = "/opengraph.png";

/**
 * Entfernt aus eingebettetem HTML (z. B. Produktbeschreibung) alle head-/viewport-Anteile,
 * damit nur eine Viewport-Angabe (die der App) existiert und SEO-Prüfer keine Duplikate melden.
 */
export function stripDocumentHeadAndViewport(html: string): string {
  if (!html || !html.trim()) return html;
  let out = html
    .replace(/<!DOCTYPE\s+[^>]*>/gi, "")
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<meta\s+[^>]*name\s*=\s*["']viewport["'][^>]*\/?>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  const bodyOpen = /<body[^>]*>/i.exec(out);
  const bodyCloseMatch = /<\/body\s*>/i.exec(out);
  const bodyClose = bodyCloseMatch ? bodyCloseMatch.index : -1;
  if (bodyOpen && bodyClose > -1 && bodyClose > bodyOpen.index) {
    const start = bodyOpen.index + bodyOpen[0].length;
    out = out.slice(start, bodyClose).trim();
  }
  out = out.replace(/<body[^>]*>/gi, "").replace(/<\/body\s*>/gi, "");
  return out.trim();
}

const STYLE_REGEX = /<style[^>]*>([\s\S]*?)<\/style>/gi;

const PRODUCT_DESC_SCOPE = ".product-description-html";

/**
 * Begrenzt CSS aus der Produktbeschreibung auf den Container .product-description-html.
 * So behält der Button „In den Warenkorb“ auf allen Produktseiten dieselbe Farbe.
 */
function scopeDescriptionCss(css: string): string {
  if (!css || !css.trim()) return css;
  return css.replace(/(\s*)([^{]+)\{/g, (_m, space, sel) => {
    const t = sel.trim();
    if (t.startsWith("@")) return space + sel + "{";
    if (/^\d+%$|^from$|^to$/i.test(t)) return space + sel + "{";
    const prefixed = t
      .split(",")
      .map((s: string) => `${PRODUCT_DESC_SCOPE} ${s.trim()}`)
      .join(", ");
    return space + prefixed + " {";
  });
}

/** Entfernt <style>...</style> aus dem HTML, damit sie nicht doppelt erscheinen (Inhalt ist schon in styleContent). */
function stripStyleTags(html: string): string {
  if (!html || !html.trim()) return html;
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();
}

/**
 * Extrahiert aus vollständigem Dokument-HTML (z. B. Produktbeschreibung aus Supabase)
 * alle <style>-Inhalte (nur innerhalb .product-description-html wirksam) und den Body-Inhalt.
 */
export function prepareProductDescriptionHtml(html: string): { styleContent: string; htmlContent: string } {
  if (!html || typeof html !== "string") return { styleContent: "", htmlContent: "" };
  // Einheitliche Zeilenumbrüche (z. B. aus Supabase/Editor)
  html = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!html) return { styleContent: "", htmlContent: "" };
  let styleContent = "";
  let match: RegExpExecArray | null;
  STYLE_REGEX.lastIndex = 0;
  while ((match = STYLE_REGEX.exec(html)) !== null) {
    styleContent += match[1].trim() + "\n";
  }
  styleContent = scopeDescriptionCss(styleContent.trim());
  // Damit .faq-item[open] (natives <details>) wie .faq-item.open aussieht
  const scopeEscaped = PRODUCT_DESC_SCOPE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  styleContent = styleContent.replace(
    new RegExp(`${scopeEscaped} \\.faq-item\\.open`, "g"),
    `${PRODUCT_DESC_SCOPE} .faq-item.open, ${PRODUCT_DESC_SCOPE} .faq-item[open]`
  );

  let htmlContent = stripDocumentHeadAndViewport(html);
  // <style>-Tags aus dem Anzeige-Inhalt entfernen (bereits in styleContent), verhindert leere Blöcke / Dopplung
  htmlContent = stripStyleTags(htmlContent);
  htmlContent = transformFaqToDetailsSummary(htmlContent);

  return { styleContent, htmlContent };
}

/** FAQ: div+button → details+summary, damit Öffnen ohne JS funktioniert (z. B. Blog, Produktbeschreibung). */
export function transformFaqToDetailsSummary(html: string): string {
  if (!html || !html.trim()) return html;
  return html.replace(
    /<div\s+class=["']faq-item["'][^>]*>\s*<button\s+class=["']faq-question["'][^>]*>([\s\S]*?)<\/button>\s*<div\s+class=["']faq-answer["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi,
    "<details class=\"faq-item\"><summary class=\"faq-question\">$1</summary><div class=\"faq-answer\">$2</div></details>"
  );
}
