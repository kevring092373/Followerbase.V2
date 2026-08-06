/**
 * Hilfen für Blog-Artikel-Layout (Aufbau analog seomuenchen.com/blog/…).
 */
import {
  prepareProductDescriptionHtmlMinimal,
  transformFaqToDetailsSummary,
  fixBlogCtaLinks,
  stripEmbeddedDuplicateSeoFromHtml,
} from "@/lib/seo";

export type BlogTocItem = { id: string; label: string };

const BLOG_SCOPE = ".blog-page-html";

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Lesezeit aus HTML (ca. 200 Wörter/Min.). */
export function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Deutsches Datum, z. B. „1. August 2026“. */
export function formatBlogDateDe(dateIso?: string): string | null {
  if (!dateIso) return null;
  const d = new Date(dateIso.includes("T") ? dateIso : `${dateIso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** TOC aus .toc-Links oder aus section[id] / h2. */
export function extractBlogToc(html: string): BlogTocItem[] {
  const fromToc: BlogTocItem[] = [];
  const tocBlock = html.match(/<nav[^>]*class=["'][^"']*\btoc\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i);
  if (tocBlock) {
    const re = /<a[^>]*href=["']#([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(tocBlock[1])) !== null) {
      const label = m[2].replace(/<[^>]+>/g, "").trim();
      if (m[1] && label) fromToc.push({ id: m[1], label });
    }
  }
  if (fromToc.length) return fromToc;

  const fromSections: BlogTocItem[] = [];
  const secRe = /<section[^>]*\sid=["']([^"']+)["'][^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let sm: RegExpExecArray | null;
  while ((sm = secRe.exec(html)) !== null) {
    const label = sm[2].replace(/<[^>]+>/g, "").trim();
    if (sm[1] && label) fromSections.push({ id: sm[1], label });
  }
  if (fromSections.length) return fromSections;

  const fromH2: BlogTocItem[] = [];
  const h2Re = /<h2([^>]*)>([\s\S]*?)<\/h2>/gi;
  let hm: RegExpExecArray | null;
  while ((hm = h2Re.exec(html)) !== null) {
    const label = hm[2].replace(/<[^>]+>/g, "").trim();
    if (!label) continue;
    const idAttr = /id=["']([^"']+)["']/i.exec(hm[1]);
    const id = idAttr?.[1] || slugifyHeading(label);
    fromH2.push({ id, label });
  }
  return fromH2;
}

/**
 * Stellt sicher, dass Ziel-IDs existieren (section oder h2),
 * und ordnet den Artikelkopf wie bei seomuenchen: Bild → H1 → Meta → Lead → TOC → Rest.
 */
function reshapeBlogArticleHtml(html: string): string {
  let body = html;

  // Äußeren article-container auspacken, falls vorhanden
  const container = body.match(
    /<div[^>]*class=["'][^"']*\barticle-container\b[^"']*["'][^>]*>([\s\S]*)<\/div>\s*$/i
  );
  if (container) body = container[1];

  const pull = (re: RegExp): string => {
    const m = body.match(re);
    if (!m) return "";
    body = body.replace(re, "");
    return m[0];
  };

  const h1 = pull(/<h1[^>]*>[\s\S]*?<\/h1>/i);
  const meta = pull(/<div[^>]*class=["'][^"']*\barticle-meta\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i);
  const lead =
    pull(/<p[^>]*class=["'][^"']*\barticle-lead\b[^"']*["'][^>]*>[\s\S]*?<\/p>/i) ||
    pull(/<div[^>]*class=["'][^"']*\barticle-lead\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i);
  const image = pull(/<div[^>]*class=["'][^"']*\barticle-image\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i);
  const toc = pull(/<nav[^>]*class=["'][^"']*\btoc\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);

  // h2 ohne id in section ohne id → id vergeben
  body = body.replace(/<h2(?![^>]*\bid=)([^>]*)>/gi, (_full, attrs: string) => {
    // id später aus Text – hier Platzhalter, wird unten gesetzt
    return `<h2${attrs}>`;
  });

  body = body.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (full, attrs: string, inner: string) => {
    if (/\bid\s*=/.test(attrs)) return full;
    const label = inner.replace(/<[^>]+>/g, "").trim();
    const id = slugifyHeading(label || "abschnitt");
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });

  const head = [image, h1, meta, lead, toc].filter(Boolean).join("\n");
  return `<div class="article-container">${head}\n${body.trim()}</div>`;
}

export function prepareBlogArticleHtml(rawHtml: string): {
  styleContent: string;
  htmlContent: string;
  toc: BlogTocItem[];
  hasEmbeddedHero: boolean;
  heroHtml: string | null;
} {
  const cleaned = stripEmbeddedDuplicateSeoFromHtml(rawHtml || "");
  const prepared = prepareProductDescriptionHtmlMinimal(cleaned, BLOG_SCOPE);
  let htmlContent = transformFaqToDetailsSummary(prepared.htmlContent);
  htmlContent = fixBlogCtaLinks(htmlContent);
  htmlContent = reshapeBlogArticleHtml(htmlContent);

  // Hero aus dem Artikel ziehen und im Seiten-Chrome rendern (Reihenfolge wie seomuenchen)
  let heroHtml: string | null = null;
  const heroMatch = htmlContent.match(
    /<div[^>]*class=["'][^"']*\barticle-image\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i
  );
  if (heroMatch) {
    heroHtml = heroMatch[0];
    htmlContent = htmlContent.replace(heroMatch[0], "");
  }

  const toc = extractBlogToc(htmlContent);

  return {
    styleContent: prepared.styleContent,
    htmlContent,
    toc,
    hasEmbeddedHero: Boolean(heroHtml),
    heroHtml,
  };
}
