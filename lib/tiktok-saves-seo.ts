/**
 * SEO- und Content-Helfer nur für /product/tiktok-saves-kaufen.
 * Preise kommen aus derselben Produktdatenquelle wie das Kaufmodul.
 * Kaufprozess und Paketlogik bleiben unangetastet.
 */
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const TIKTOK_SAVES_SLUG = "tiktok-saves-kaufen";

export const TIKTOK_SAVES_TITLE = "TikTok Saves kaufen ab 0,90 € | Followerbase";

export const TIKTOK_SAVES_DESCRIPTION =
  "TikTok Saves kaufen ab 0,90 €. Sechs Pakete wählen, Videolink eingeben und ohne Passwort bestellen. Einmalzahlung bei Followerbase.";

export const TIKTOK_SAVES_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fbtsaves-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
${SCOPE} .fbtsaves-table-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  -webkit-overflow-scrolling: touch;
}
${SCOPE} .fbtsaves-table-wrap table { width: 100%; min-width: 680px; border-collapse: collapse; }
${SCOPE} thead th {
  background: var(--fbts-heading, #342d4b);
  color: #fff;
  font-size: .84rem;
}
${SCOPE} tbody th {
  background: #fff;
  color: var(--fbts-heading, #342d4b);
  font-size: 1em;
  font-weight: 700;
}
${SCOPE} .fbtsaves-faq summary { list-style: none; }
${SCOPE} .fbtsaves-faq summary::-webkit-details-marker { display: none; }
${SCOPE} .fbtsaves-button:focus-visible,
${SCOPE} .fbtsaves-faq summary:focus-visible,
${SCOPE} .fbtsaves-nav a:focus-visible,
${SCOPE} .fbtsaves-mini-link:focus-visible,
${SCOPE} .fbtsaves-table-wrap:focus-visible {
  outline: 3px solid rgba(138, 85, 238, .42);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  ${SCOPE} .fbtsaves-button { transition: none; }
  ${SCOPE} .fbtsaves-button:hover { transform: none; }
}
`;

export function isTiktokSavesProduct(slug: string): boolean {
  return slug === TIKTOK_SAVES_SLUG;
}

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
        if (s.startsWith(".fbtsaves-copy")) return `${SCOPE_ROOT} ${s}`;
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
  const body = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
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
  const target = `#${TIKTOK_SAVES_ORDER_ID}`;
  return html.replace(
    /(<a\b[^>]*(?:fbtsaves-button|fbtsaves-mini-link)[^>]*\bhref=["'])[^"']*(["'])/gi,
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
  const target = `#${TIKTOK_SAVES_ORDER_ID}`;
  return quantities
    .map((qty, i) => {
      const cents = pricesCents[i];
      if (typeof cents !== "number" || !Number.isFinite(cents)) return "";
      return `<tr><th scope="row">${formatQuantity(qty)} Saves</th><td class="fbtsaves-price">${formatEuroFromCents(cents)}</td><td>${perHundredLabel(qty, cents)}</td><td><a class="fbtsaves-mini-link" href="${target}">Paket wählen</a></td></tr>`;
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
  const extraTiers = Math.max(0, quantities.length - 1);

  let next = html.replace(
    /<tbody([^>]*data-fbtsaves-packages[^>]*)>[\s\S]*?<\/tbody>/i,
    `<tbody$1>${buildPackageRows(quantities, pricesCents)}</tbody>`
  );
  next = next.replace(
    /(<[^>]*data-fbtsaves-from-price[^>]*>)[\s\S]*?(<\/(?:span|strong)>)/gi,
    `$1${fromPrice}$2`
  );
  next = next.replace(
    /(<[^>]*data-fbtsaves-qty-range[^>]*>)[\s\S]*?(<\/span>)/gi,
    `$1${formatQuantity(minQty)} und ${formatQuantity(maxQty)}$2`
  );
  next = next.replace(
    /(<[^>]*data-fbtsaves-qty-span[^>]*>)[\s\S]*?(<\/strong>)/gi,
    `$1${formatQuantity(minQty)} bis ${formatQuantity(maxQty)} Saves$2`
  );
  next = next.replace(
    /(<[^>]*data-fbtsaves-package-count[^>]*>)[\s\S]*?(<\/span>)/gi,
    `$1${quantities.length} Pakete$2`
  );
  next = next.replace(
    /(<p[^>]*data-fbtsaves-price-lead[^>]*>)[\s\S]*?(<\/p>)/i,
    `$1Das kleinste Paket enthält ${formatQuantity(minQty)} Saves und kostet ${formatEuroFromCents(minCents)}. Für größere Mengen stehen ${extraTiers} weitere Stufen zur Verfügung. Der rechnerische Preis je 100 Saves sinkt mit zunehmender Paketgröße. Wähle trotzdem nicht allein nach dem Stückpreis, sondern auch danach, welche Größenordnung zu deinem Video und deinem bisherigen Profil passt.$2`
  );
  return next;
}

function enhanceFaqs(html: string): string {
  if (html.includes("tiktok-saves-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `tiktok-saves-faq-answer-${n}`;
      return `<details class="fbtsaves-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><div id="${answerId}">${answer}</div></details>`;
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

/** Scoping, Preiszeilen, FAQ-IDs und CTA-Anker nur für TikTok Saves. */
export function prepareTiktokSavesDescriptionHtml(
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
