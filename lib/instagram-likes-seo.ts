/**
 * Technische SEO- und Struktur-Helfer nur für /product/instagram-likes-kaufen.
 * Content-Block: Markup, Anker, Tabellen, FAQ und Preise aus derselben Datenquelle.
 */
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const INSTAGRAM_LIKES_SLUG = "instagram-likes-kaufen";

export const INSTAGRAM_LIKES_TITLE = "Instagram Likes kaufen ab 0,85 € | Followerbase";

export const INSTAGRAM_LIKES_DESCRIPTION =
  "Instagram Likes ab 0,85 € bestellen. Flexible Pakete für Posts, Reels und Karussells. Ohne Passwort und mit transparenter Lieferung.";

export const INSTAGRAM_LIKES_IMAGE_ALT = "Instagram Likes kaufen";

export const INSTAGRAM_LIKES_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fblikes-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
${SCOPE} .fblikes-table-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  -webkit-overflow-scrolling: touch;
}
${SCOPE} .fblikes-table-wrap table { width: 100%; min-width: 680px; border-collapse: collapse; }
${SCOPE} .fblikes-faq summary { list-style: none; }
${SCOPE} .fblikes-faq summary::-webkit-details-marker { display: none; }
${SCOPE} .fblikes-button:focus-visible,
${SCOPE} .fblikes-faq summary:focus-visible,
${SCOPE} .fblikes-nav a:focus-visible,
${SCOPE} .fblikes-mini-link:focus-visible,
${SCOPE} .fblikes-table-wrap:focus-visible {
  outline: 3px solid rgba(138, 85, 238, .42);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  ${SCOPE} .fblikes-button { transition: none; }
  ${SCOPE} .fblikes-button:hover { transform: none; }
}
`;

export function isInstagramLikesProduct(slug: string): boolean {
  return slug === INSTAGRAM_LIKES_SLUG;
}

export { isInstagramMediaUrl } from "@/lib/instagram-url";

type PriceSource = {
  quantities?: number[];
  pricesCents?: number[];
};

function slugifyHeading(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "abschnitt";
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function scopeCss(css: string): string {
  return css.replace(/(^|\{|\})\s*([^{}@][^{}]*?)\{/g, (full, brace: string, selectors: string) => {
    const trimmed = selectors.trim();
    if (!trimmed || trimmed.startsWith("@") || trimmed.startsWith("from") || trimmed.startsWith("to")) {
      return full;
    }
    const scoped = trimmed
      .split(",")
      .map((selector) => {
        const s = selector.trim();
        if (!s) return s;
        if (s.startsWith(SCOPE_ROOT)) return s;
        if (s.startsWith(".fblikes-copy")) return `${SCOPE_ROOT} ${s}`;
        if (s === ":root" || s === "*") return SCOPE;
        if (s === "body" || s === "html") return SCOPE;
        return `${SCOPE} ${s}`;
      })
      .join(", ");
    return `${brace}${scoped}{`;
  });
}

function extractStyleAndBody(html: string): { css: string; body: string } {
  const styleMatch = html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  const css = styleMatch ? styleMatch[1] : "";
  let body = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?html\b[^>]*>/gi, "")
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<\/?body\b[^>]*>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\sonclick="[^"]*"/gi, "")
    .trim();
  return { css, body };
}

function decorateHeadings(html: string): string {
  const used = new Set<string>();
  const idRe = /\sid=["']([^"']+)["']/gi;
  let idMatch: RegExpExecArray | null;
  while ((idMatch = idRe.exec(html)) !== null) {
    used.add(idMatch[1]);
  }
  return html.replace(/<(h[23])(\b[^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag: string, attrs: string, inner: string) => {
    if (/\sid\s*=/i.test(attrs)) return full;
    const id = slugifyHeading(htmlToPlainText(inner), used);
    return `<${tag} id="${id}"${attrs}>${inner}</${tag}>`;
  });
}

function rewriteCtas(html: string): string {
  const target = `#${INSTAGRAM_LIKES_ORDER_ID}`;
  return html.replace(
    /(<a\b[^>]*(?:fblikes-button|fblikes-mini-link|cta-button)[^>]*\bhref=["'])[^"']*(["'])/gi,
    `$1${target}$2`
  );
}

function perHundredLabel(quantity: number, priceCents: number): string {
  const raw = (priceCents / quantity) * 100;
  const rounded = Math.round(raw);
  const prefix = Math.abs(raw - rounded) < 0.05 ? "" : "ca. ";
  return `${prefix}${formatEuroFromCents(rounded)}`;
}

function buildPackageRows(quantities: number[], pricesCents: number[]): string {
  const target = `#${INSTAGRAM_LIKES_ORDER_ID}`;
  return quantities
    .map((qty, i) => {
      const cents = pricesCents[i];
      if (typeof cents !== "number" || !Number.isFinite(cents)) return "";
      return `<tr><th scope="row">${formatQuantity(qty)} Likes</th><td class="fblikes-price">${formatEuroFromCents(cents)}</td><td>${perHundredLabel(qty, cents)}</td><td><a class="fblikes-mini-link" href="${target}">Zur Auswahl</a></td></tr>`;
    })
    .join("");
}

function injectPackagePrices(html: string, source: PriceSource): string {
  const quantities = Array.isArray(source.quantities) ? source.quantities : [];
  const pricesCents = Array.isArray(source.pricesCents) ? source.pricesCents : [];
  if (!quantities.length || quantities.length !== pricesCents.length) return html;

  const minCents = Math.min(...pricesCents);
  const maxCents = Math.max(...pricesCents);
  const minQty = quantities[pricesCents.indexOf(minCents)] ?? quantities[0];
  const maxQty = quantities[pricesCents.indexOf(maxCents)] ?? quantities[quantities.length - 1];
  const fromPrice = `ab ${formatEuroFromCents(minCents)}`;

  let next = html.replace(
    /<tbody([^>]*data-fblikes-packages[^>]*)>[\s\S]*?<\/tbody>/i,
    `<tbody$1>${buildPackageRows(quantities, pricesCents)}</tbody>`
  );
  next = next.replace(/data-fblikes-from-price(?:="")?/gi, "data-fblikes-from-price");
  next = next.replace(
    /(<[^>]*data-fblikes-from-price[^>]*>)[\s\S]*?(<\/(?:span|strong)>)/gi,
    `$1${fromPrice}$2`
  );
  next = next.replace(
    /(<[^>]*data-fblikes-qty-range[^>]*>)[\s\S]*?(<\/span>)/gi,
    `$1${formatQuantity(minQty)} und ${formatQuantity(maxQty)} Likes$2`
  );
  next = next.replace(
    /(<p[^>]*data-fblikes-price-lead[^>]*>)[\s\S]*?(<\/p>)/i,
    `$1Die kleinste Standardmenge umfasst ${formatQuantity(minQty)} Likes für ${formatEuroFromCents(minCents)}. Das größte Paket enthält ${formatQuantity(maxQty)} Likes für ${formatEuroFromCents(maxCents)}. Der rechnerische Preis je 100 Likes sinkt bei größeren Mengen. Diese Angabe erleichtert den Preisvergleich, sagt aber nichts über die Wirkung auf deinen Account aus.$2`
  );
  next = next.replace(/<span data-fblikes-price="(\d+)">[\s\S]*?<\/span>/gi, (_m, qtyRaw: string) => {
    const qty = Number(qtyRaw);
    const index = quantities.indexOf(qty);
    const cents = index >= 0 ? pricesCents[index] : undefined;
    const label = typeof cents === "number" ? formatEuroFromCents(cents) : "";
    return `<span data-fblikes-price="${qty}">${label}</span>`;
  });
  return next;
}

function enhanceFaqs(html: string): string {
  if (html.includes("instagram-likes-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `instagram-likes-faq-answer-${n}`;
      return `<details class="fblikes-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><div id="${answerId}">${answer}</div></details>`;
    }
  );
}

function firstColumnRowHeaders(html: string): string {
  return html.replace(/<tbody([^>]*)>([\s\S]*?)<\/tbody>/gi, (_m, attrs: string, body: string) => {
    const nextBody = body.replace(
      /<tr(\b[^>]*)>\s*<td\b([^>]*)>([\s\S]*?)<\/td>/gi,
      '<tr$1><th scope="row"$2>$3</th>'
    );
    return `<tbody${attrs}>${nextBody}</tbody>`;
  });
}

/**
 * Scoping, Preiszeilen aus Produktdaten, eindeutige FAQ-IDs, CTA-Anker.
 */
export function prepareInstagramLikesDescriptionHtml(
  html: string | undefined,
  product?: PriceSource
): string {
  if (!html) return "";
  let { css, body } = extractStyleAndBody(html);
  css = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\n)\s*\*\s*\{[^}]*\}/g, "$1")
    .replace(/(^|\n)\s*body\s*\{[^}]*\}/g, "$1")
    .replace(/(^|\n)\s*h1\s*\{[^}]*\}/g, "$1");
  body = injectPackagePrices(body, product ?? {});
  body = decorateHeadings(body);
  body = firstColumnRowHeaders(body);
  body = enhanceFaqs(body);
  body = rewriteCtas(body);
  return `<style>${scopeCss(css)}\n${EXTRA_CSS}</style>${body}`;
}
