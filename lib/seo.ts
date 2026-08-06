/**
 * SEO-Helfer: Basis-URL, Beschreibungslänge, Open Graph.
 * Titel: 50–60 Zeichen. Description: 150–160 Zeichen.
 */

const DESCRIPTION_MAX = 160;
const TITLE_MAX = 60;

/** Meta-Titel auf max. 60 Zeichen kürzen (SEO-empfohlen). */
export function truncateTitle(text: string | undefined, max = TITLE_MAX): string {
  if (!text || !text.trim()) return "";
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return t.slice(0, max - 3).trim() + "...";
}

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
 * Entfernt nur Viewport-Meta-Tags aus HTML (z. B. Blog-Inhalt aus Supabase),
 * damit nur eine Viewport-Angabe (die der App) existiert. Rest des HTML bleibt unverändert.
 */
export function stripViewportFromHtml(html: string): string {
  if (!html || !html.trim()) return html;
  return html.replace(/<meta\s+[^>]*name\s*=\s*["']viewport["'][^>]*\/?>/gi, "");
}

/**
 * Entfernt <title> aus eingebettetem Voll-Dokument-HTML (z. B. Supabase-Export).
 * Nur innerhalb von <head> sowie direkt unter <html> (ohne <head>), damit
 * z. B. <svg><title> im Body unangetastet bleibt.
 */
export function stripTitleTagsFromHtml(html: string): string {
  if (!html || !html.trim()) return html;
  let out = html.replace(/<head(\b[^>]*)>([\s\S]*?)<\/head>/gi, (_full, attrs: string, inner: string) => {
    const cleaned = inner.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "");
    return `<head${attrs}>${cleaned}</head>`;
  });
  // Seltene Exporte: <html><title>…</title> ohne umschließendes <head>
  out = out.replace(/<html(\b[^>]*)>\s*<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, "<html$1>");
  return out;
}

/**
 * Entfernt SEO-konfliktige Tags aus eingebettetem HTML-Dokument:
 * - canonical Links
 * - robots/description/og/twitter Meta-Tags
 * Nur im Head-Bereich bzw. als "verirrte" Einzel-Tags; Content-HTML bleibt erhalten.
 */
export function stripConflictingSeoTagsFromHtml(html: string): string {
  if (!html || !html.trim()) return html;

  const removeSeoTags = (input: string): string =>
    input
      .replace(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*\/?>/gi, "")
      .replace(/<meta\s+[^>]*name\s*=\s*["']robots["'][^>]*\/?>/gi, "")
      .replace(/<meta\s+[^>]*name\s*=\s*["']description["'][^>]*\/?>/gi, "")
      .replace(/<meta\s+[^>]*name\s*=\s*["']twitter:[^"']*["'][^>]*\/?>/gi, "")
      .replace(/<meta\s+[^>]*property\s*=\s*["']og:[^"']*["'][^>]*\/?>/gi, "");

  let out = html.replace(/<head(\b[^>]*)>([\s\S]*?)<\/head>/gi, (_full, attrs: string, inner: string) => {
    return `<head${attrs}>${removeSeoTags(inner)}</head>`;
  });

  // Falls Tags außerhalb von <head> im CMS-HTML stehen, ebenfalls entfernen.
  out = removeSeoTags(out);
  return out;
}

/**
 * Doppelte/konfliktige SEO-Tags aus CMS-HTML entfernen.
 * Den sichtbaren Seitentitel liefert Next.js über generateMetadata (z. B. metaTitle aus Supabase).
 */
export function stripEmbeddedDuplicateSeoFromHtml(html: string): string {
  if (!html || !html.trim()) return html;
  return stripConflictingSeoTagsFromHtml(stripViewportFromHtml(stripTitleTagsFromHtml(html))).trim();
}

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

/** Liest einen balancierten `{ ... }`-Block ab openIdx (Position der `{`). */
function readBalancedCssBlock(css: string, openIdx: number): { block: string; end: number } {
  let depth = 0;
  for (let j = openIdx; j < css.length; j++) {
    const ch = css[j];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { block: css.slice(openIdx, j + 1), end: j + 1 };
    }
  }
  return { block: css.slice(openIdx), end: css.length };
}

function prefixCssSelectorList(selectorList: string, scope: string): string {
  return selectorList
    .split(",")
    .map((s) => {
      const t = s.trim();
      if (!t) return "";
      // Keyframes-Schritte unangetastet lassen
      if (/^(\d+%|from|to)$/i.test(t)) return t;
      // html/body/:root → Scope-Container (CSS-Variablen & Basis)
      if (t === "body" || t === "html" || t === ":root") return scope;
      // Bereits gescoped
      if (t === scope || t.startsWith(`${scope} `) || t.startsWith(`${scope}:`) || t.startsWith(`${scope}.`) || t.startsWith(`${scope}[`)) {
        return t;
      }
      return `${scope} ${t}`;
    })
    .filter(Boolean)
    .join(", ");
}

/**
 * Begrenzt CSS auf einen Container-Selektor.
 * Wichtig: Selektoren dürfen keine `}` enthalten – sonst zerlegt die naive
 * `[^{]+\\{`-Regex Regelinhalte (z. B. rgba()-Kommas) und zerstört das Design.
 */
function scopeCssTo(css: string, scopeSelector: string): string {
  if (!css || !css.trim()) return css;
  const scope = scopeSelector.trim();
  let out = "";
  let i = 0;
  const n = css.length;

  while (i < n) {
    // Kommentare durchreichen
    if (css.startsWith("/*", i)) {
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      out += css.slice(i, stop);
      i = stop;
      continue;
    }

    // @-Regeln
    if (css[i] === "@") {
      const brace = css.indexOf("{", i);
      if (brace === -1) {
        out += css.slice(i);
        break;
      }
      const atHeader = css.slice(i, brace).trim();
      const { block, end } = readBalancedCssBlock(css, brace);

      // @keyframes / @font-face: innen nicht umschreiben
      if (/^@(keyframes|font-face|import|charset|namespace)\b/i.test(atHeader)) {
        out += atHeader + block;
        i = end;
        continue;
      }

      // @media / @supports: innere Regeln scopeden
      if (/^@(media|supports|document|layer)\b/i.test(atHeader)) {
        const inner = block.slice(1, -1);
        out += `${atHeader}{${scopeCssTo(inner, scope)}}`;
        i = end;
        continue;
      }

      out += atHeader + block;
      i = end;
      continue;
    }

    // Normale Regel: nur Selektor bis zur nächsten `{`, ohne `}` dazwischen
    const brace = css.indexOf("{", i);
    if (brace === -1) {
      out += css.slice(i);
      break;
    }

    const between = css.slice(i, brace);
    if (between.includes("}")) {
      const close = between.lastIndexOf("}");
      out += between.slice(0, close + 1);
      i = i + close + 1;
      continue;
    }

    const sel = between.trim();
    const { block, end } = readBalancedCssBlock(css, brace);

    if (!sel) {
      out += block;
      i = end;
      continue;
    }

    if (/^(\d+%|from|to)$/i.test(sel)) {
      out += sel + block;
    } else {
      out += prefixCssSelectorList(sel, scope) + block;
    }
    i = end;
  }

  return out;
}

/**
 * Begrenzt CSS aus der Produktbeschreibung auf den Container .product-description-html.
 * So behält der Button „In den Warenkorb“ auf allen Produktseiten dieselbe Farbe.
 */
function scopeDescriptionCss(css: string): string {
  return scopeCssTo(css, PRODUCT_DESC_SCOPE);
}

/**
 * JS-FAQ nutzt .faq-item.open; wir rendern natives <details open>.
 * Dupliziert Selektoren korrekt inkl. Folgeselektoren:
 * `.scope .faq-item.open .faq-answer` → zusätzlich `.scope .faq-item[open] .faq-answer`
 */
function remapFaqItemOpenToDetailsOpen(css: string, scopeSelector: string): string {
  if (!css) return css;
  const scopeEscaped = scopeSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.replace(
    new RegExp(`(${scopeEscaped}\\s+\\.faq-item)\\.open((?:\\s+[.#:\\[\\w-]+)*)`, "g"),
    (_m, before: string, after: string) => `${before}.open${after || ""}, ${before}[open]${after || ""}`
  );
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
  styleContent = remapFaqItemOpenToDetailsOpen(scopeDescriptionCss(styleContent.trim()), PRODUCT_DESC_SCOPE);

  let htmlContent = stripDocumentHeadAndViewport(html);
  // <style>-Tags aus dem Anzeige-Inhalt entfernen (bereits in styleContent), verhindert leere Blöcke / Dopplung
  htmlContent = stripStyleTags(htmlContent);
  htmlContent = transformFaqToDetailsSummary(htmlContent);
  htmlContent = fixBlogCtaLinks(htmlContent);

  return { styleContent, htmlContent };
}

/**
 * Minimal-Variante für Produktseiten:
 * - entfernt head/html/body + Viewport (damit Mobile nicht "kippt")
 * - extrahiert <style> und scoped es auf den gewünschten Container
 * - kein FAQ-Transform, keine CTA-Link-Fixes (minimaler Eingriff)
 */
export function prepareProductDescriptionHtmlMinimal(
  html: string,
  scopeSelector: string
): { styleContent: string; htmlContent: string } {
  if (!html || typeof html !== "string") return { styleContent: "", htmlContent: "" };
  html = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!html) return { styleContent: "", htmlContent: "" };

  let styleContent = "";
  let match: RegExpExecArray | null;
  STYLE_REGEX.lastIndex = 0;
  while ((match = STYLE_REGEX.exec(html)) !== null) {
    styleContent += match[1].trim() + "\n";
  }
  styleContent = remapFaqItemOpenToDetailsOpen(
    scopeCssTo(styleContent.trim(), scopeSelector),
    scopeSelector
  );

  let htmlContent = stripDocumentHeadAndViewport(html);
  htmlContent = stripStyleTags(htmlContent);

  return { styleContent, htmlContent };
}

/** FAQ: div+button → details+summary, damit Öffnen ohne JS funktioniert (z. B. Blog, Produktbeschreibung). */
export function transformFaqToDetailsSummary(html: string): string {
  if (!html || !html.trim()) return html;
  // Variante 1: class="faq-item" exakt / mit weiteren Klassen
  let out = html.replace(
    /<div\s+([^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*)>\s*<button\s+([^>]*class=["'][^"']*\bfaq-question\b[^"']*["'][^>]*)>([\s\S]*?)<\/button>\s*<div\s+([^>]*class=["'][^"']*\bfaq-answer\b[^"']*["'][^>]*)>([\s\S]*?)<\/div>\s*<\/div>/gi,
    (_m, _itemAttrs, _qAttrs, question, _aAttrs, answer) =>
      `<details class="faq-item"><summary class="faq-question">${question}</summary><div class="faq-answer">${answer}</div></details>`
  );
  return out;
}

/**
 * Ersetzt in Blog-HTML href="#" bei Links mit class="cta-btn" durch href="/products",
 * damit der Button „Jetzt entdecken“ zur Produktübersicht führt.
 */
export function fixBlogCtaLinks(html: string): string {
  if (!html || !html.trim()) return html;
  return html.replace(
    /<a\s+([^>]*?)href=["']#["']([^>]*?)>/gi,
    (match, before, after) => {
      if (/\bclass=["'][^"']*cta-btn[^"']*["']/.test(before + after)) {
        return `<a ${before}href="/products"${after}>`;
      }
      return match;
    }
  );
}
