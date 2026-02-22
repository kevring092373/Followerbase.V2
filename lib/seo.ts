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
