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

export type BlogFaqItem = { question: string; answer: string };

const BLOG_SCOPE = ".blog-page-html";

function wrapInlineToc(tocHtml: string): string {
  if (!tocHtml.trim()) return "";
  let html = tocHtml
    .replace(/<div[^>]*class=["'][^"']*\bblog-toc-desktop\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i, "")
    .replace(/<details[^>]*class=["'][^"']*\bblog-inline-toc\b[^"']*["'][^>]*>[\s\S]*?<\/details>/i, "")
    .trim();
  if (!html) html = tocHtml.trim();
  if (/class=["'][^"']*\bblog-toc-toggle\b/i.test(html)) return html;

  html = html.replace(
    /<nav([^>]*class=["'][^"']*\btoc\b[^"']*["'][^>]*)>/i,
    (_full, attrs: string) => {
      let next = String(attrs)
        .replace(/\s+aria-labelledby=["'][^"']*["']/i, "")
        .replace(/\s+aria-label=["'][^"']*["']/i, "");
      return `<nav${next} aria-label="Inhaltsverzeichnis">`;
    }
  );

  if (!/class=["'][^"']*\bblog-toc-toggle\b/i.test(html)) {
    html = html.replace(
      /(<nav[^>]*class=["'][^"']*\btoc\b[^"']*["'][^>]*>)/i,
      `$1<input type="checkbox" id="blog-toc-toggle" class="blog-toc-toggle" /><label for="blog-toc-toggle" class="blog-toc-toggle-label"><span class="blog-toc-toggle-show">Inhaltsverzeichnis anzeigen</span><span class="blog-toc-toggle-hide">Inhaltsverzeichnis ausblenden</span></label>`
    );
  }
  return html;
}

/** Tabellen in einen horizontal scrollbareren Wrapper legen. */
export function enhanceBlogTables(html: string): string {
  if (!html) return html;
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (tableHtml) => {
    if (/class=["'][^"']*\bblog-table-(?:wrap|block)\b/i.test(tableHtml)) return tableHtml;
    return `<div class="blog-table-block"><p class="blog-table-hint">Tabelle seitlich scrollen →</p><div class="blog-table-wrap">${tableHtml}</div></div>`;
  });
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** FAQ-Paare aus transformiertem Blog-HTML (details.faq-item). */
export function extractBlogFaqItems(html: string): BlogFaqItem[] {
  if (!html) return [];
  const items: BlogFaqItem[] = [];
  const re =
    /<details[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const question = stripHtmlToText(m[1]);
    const answer = stripHtmlToText(m[2]);
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

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

/** Entfernt verschachtelte Listen, damit nur Hauptpunkte im Inhaltsverzeichnis bleiben. */
function stripNestedLists(html: string): string {
  let out = html;
  for (let i = 0; i < 10; i += 1) {
    const next = out.replace(
      /<(ol|ul)[^>]*>((?:(?!<(?:ol|ul)\b)[\s\S])*?)<\/\1>/gi,
      (full, _tag: string, _inner: string, offset: number) => {
        const before = out.slice(0, offset);
        const depth =
          (before.match(/<(ol|ul)\b/gi) || []).length - (before.match(/<\/(ol|ul)>/gi) || []).length;
        return depth > 0 ? "" : full;
      }
    );
    if (next === out) break;
    out = next;
  }
  return out;
}

/** TOC aus .toc-Links (nur Hauptebene) oder aus section[id] / h2. */
export function extractBlogToc(html: string): BlogTocItem[] {
  const fromToc: BlogTocItem[] = [];
  const tocBlock = html.match(/<nav[^>]*class=["'][^"']*\btoc\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i);
  if (tocBlock) {
    const tocInner = stripNestedLists(tocBlock[1]);
    const re = /<a[^>]*href=["']#([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(tocInner)) !== null) {
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
function reshapeBlogArticleHtml(html: string, keepInlineToc = false): string {
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
  const tocHtml = pull(/<(nav|div)[^>]*class=["'][^"']*\btoc\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/i);

  body = body.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (full, attrs: string, inner: string) => {
    if (/\bid\s*=/.test(attrs)) return full;
    const label = inner.replace(/<[^>]+>/g, "").trim();
    const id = slugifyHeading(label || "abschnitt");
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });

  const head = [image, h1, meta, lead, keepInlineToc ? wrapInlineToc(tocHtml) : ""]
    .filter(Boolean)
    .join("\n");
  return `<div class="article-container">${head}\n${body.trim()}</div>`;
}

export function prepareBlogArticleHtml(rawHtml: string): {
  styleContent: string;
  htmlContent: string;
  toc: BlogTocItem[];
  faqs: BlogFaqItem[];
  hasEmbeddedHero: boolean;
  heroHtml: string | null;
} {
  const cleaned = stripEmbeddedDuplicateSeoFromHtml(rawHtml || "");
  const prepared = prepareProductDescriptionHtmlMinimal(cleaned, BLOG_SCOPE);
  let htmlContent = transformFaqToDetailsSummary(prepared.htmlContent);
  htmlContent = fixBlogCtaLinks(htmlContent);

  const hasInlineToc = /<(nav|div)[^>]*class=["'][^"']*\btoc\b/i.test(htmlContent);
  const toc = hasInlineToc ? [] : extractBlogToc(htmlContent);
  htmlContent = reshapeBlogArticleHtml(htmlContent, hasInlineToc);

  // Hero aus dem Artikel ziehen und im Seiten-Chrome rendern (Reihenfolge wie seomuenchen)
  let heroHtml: string | null = null;
  const heroMatch = htmlContent.match(
    /<div[^>]*class=["'][^"']*\barticle-image\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i
  );
  if (heroMatch) {
    heroHtml = heroMatch[0];
    htmlContent = htmlContent.replace(heroMatch[0], "");
  }

  if (!hasInlineToc) {
    htmlContent = htmlContent.replace(
      /<(nav|div)[^>]*class=["'][^"']*\btoc\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi,
      ""
    );
  }

  htmlContent = enhanceBlogTables(htmlContent);

  const faqs = extractBlogFaqItems(htmlContent);

  // details/summary + Layout-Korrekturen gegen Supabase-Vollseiten-CSS
  const faqDetailsCss = `
${BLOG_SCOPE} { background: transparent !important; }
${BLOG_SCOPE} .article-container { max-width: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
${BLOG_SCOPE} details.faq-item > summary { list-style: none; cursor: pointer; }
${BLOG_SCOPE} details.faq-item > summary::-webkit-details-marker { display: none; }
${BLOG_SCOPE} details.faq-item[open] .faq-answer { max-height: 800px; }
`.trim();

  return {
    styleContent: `${prepared.styleContent}\n${faqDetailsCss}`,
    htmlContent,
    toc,
    faqs,
    hasEmbeddedHero: Boolean(heroHtml),
    heroHtml,
  };
}
