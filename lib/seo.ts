/**
 * SEO-Helfer: Basis-URL, Beschreibungslänge, Open Graph.
 * Titel: 50–60 Zeichen. Description: 150–160 Zeichen.
 */

const DESCRIPTION_MAX = 158;

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
  const bodyClose = out.indexOf("</body>");
  if (bodyOpen && bodyClose > -1) {
    const start = bodyOpen.index + bodyOpen[0].length;
    out = out.slice(start, bodyClose).trim();
  }
  out = out.replace(/<body[^>]*>/gi, "").replace(/<\/body>/gi, "");
  return out.trim();
}

const STYLE_REGEX = /<style[^>]*>([\s\S]*?)<\/style>/gi;

/** Ersetzt alte Markenfarben (Indigo/Violett) in CSS durch die aktuelle Markenfarbe (Blau). */
function replaceLegacyBrandColorsInCss(css: string): string {
  if (!css || !css.trim()) return css;
  return css
    .replace(/#6366f1/gi, "#0284c7")
    .replace(/#4f46e5/gi, "#0284c7")
    .replace(/#5b21b6/gi, "#0369a1")
    .replace(/#7c3aed/gi, "#0284c7")
    .replace(/rgba\s*\(\s*99\s*,\s*102\s*,\s*241\s*,/gi, "rgba(2, 132, 199,")
    .replace(/rgba\s*\(\s*79\s*,\s*70\s*,\s*229\s*,/gi, "rgba(2, 132, 199,")
    .replace(/--accent\s*:\s*#?[0-9a-fA-F]{3,8}\s*;/g, "--accent: #0284c7;")
    .replace(/--primary\s*:\s*#?[0-9a-fA-F]{3,8}\s*;/g, "--primary: #0284c7;");
}

/**
 * Extrahiert aus vollständigem Dokument-HTML (z. B. Produktbeschreibung aus Supabase)
 * alle <style>-Inhalte und den sichtbaren Body-Inhalt. Alte Markenfarben werden durch
 * die aktuelle Markenfarbe (Blau) ersetzt.
 */
export function prepareProductDescriptionHtml(html: string): { styleContent: string; htmlContent: string } {
  if (!html || !html.trim()) return { styleContent: "", htmlContent: "" };
  let styleContent = "";
  let match: RegExpExecArray | null;
  STYLE_REGEX.lastIndex = 0;
  while ((match = STYLE_REGEX.exec(html)) !== null) {
    styleContent += match[1].trim() + "\n";
  }
  styleContent = replaceLegacyBrandColorsInCss(styleContent.trim());
  const htmlContent = stripDocumentHeadAndViewport(html);
  return { styleContent, htmlContent };
}
