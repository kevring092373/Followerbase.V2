/**
 * SEO- und Content-Helfer nur für /product/instagram-saves-kaufen.
 * Preise und Paketzeilen kommen aus derselben Produktdatenquelle wie das Kaufmodul.
 */
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const INSTAGRAM_SAVES_SLUG = "instagram-saves-kaufen";

export const INSTAGRAM_SAVES_TITLE = "Instagram Saves kaufen ab 0,85 € | Followerbase";

export const INSTAGRAM_SAVES_DESCRIPTION =
  "Instagram Saves kaufen ab 0,85 €. Paket wählen, Beitragslink eingeben und ohne Passwort bestellen. Einmalzahlung bei Followerbase.";

export const INSTAGRAM_SAVES_IMAGE_ALT = "Instagram Saves kaufen";

export const INSTAGRAM_SAVES_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fbsaves-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
${SCOPE} .fbsaves-table-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  -webkit-overflow-scrolling: touch;
}
${SCOPE} .fbsaves-table-wrap table { width: 100%; min-width: 680px; border-collapse: collapse; }
${SCOPE} tbody th {
  background: #fff;
  color: var(--fbs-heading, #332b4d);
  font-size: 1em;
  font-weight: 700;
}
${SCOPE} .fbsaves-faq summary { list-style: none; }
${SCOPE} .fbsaves-faq summary::-webkit-details-marker { display: none; }
${SCOPE} .fbsaves-button:focus-visible,
${SCOPE} .fbsaves-faq summary:focus-visible,
${SCOPE} .fbsaves-nav a:focus-visible,
${SCOPE} .fbsaves-mini-link:focus-visible,
${SCOPE} .fbsaves-table-wrap:focus-visible {
  outline: 3px solid rgba(138, 85, 238, .42);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  ${SCOPE} .fbsaves-button { transition: none; }
  ${SCOPE} .fbsaves-button:hover { transform: none; }
}
`;

export function isInstagramSavesProduct(slug: string): boolean {
  return slug === INSTAGRAM_SAVES_SLUG;
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
        if (s.startsWith(".fbsaves-copy")) return `${SCOPE_ROOT} ${s}`;
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
  const target = `#${INSTAGRAM_SAVES_ORDER_ID}`;
  return html.replace(
    /(<a\b[^>]*(?:fbsaves-button|fbsaves-mini-link)[^>]*\bhref=["'])[^"']*(["'])/gi,
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
  const target = `#${INSTAGRAM_SAVES_ORDER_ID}`;
  return quantities
    .map((qty, i) => {
      const cents = pricesCents[i];
      if (typeof cents !== "number" || !Number.isFinite(cents)) return "";
      return `<tr><th scope="row">${formatQuantity(qty)} Saves</th><td class="fbsaves-price">${formatEuroFromCents(cents)}</td><td>${perHundredLabel(qty, cents)}</td><td><a class="fbsaves-mini-link" href="${target}">Paket wählen</a></td></tr>`;
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
    /<tbody([^>]*data-fbsaves-packages[^>]*)>[\s\S]*?<\/tbody>/i,
    `<tbody$1>${buildPackageRows(quantities, pricesCents)}</tbody>`
  );
  next = next.replace(
    /(<[^>]*data-fbsaves-from-price[^>]*>)[\s\S]*?(<\/(?:span|strong)>)/gi,
    `$1${fromPrice}$2`
  );
  next = next.replace(
    /(<[^>]*data-fbsaves-qty-range[^>]*>)[\s\S]*?(<\/span>)/gi,
    `$1${formatQuantity(minQty)} und ${formatQuantity(maxQty)}$2`
  );
  next = next.replace(
    /(<[^>]*data-fbsaves-package-count[^>]*>)[\s\S]*?(<\/strong>)/gi,
    `$1${quantities.length} Paketgrößen$2`
  );
  next = next.replace(
    /(<p[^>]*data-fbsaves-price-lead[^>]*>)[\s\S]*?(<\/p>)/i,
    `$1Mit ${quantities.length} Mengen kannst du das Paket an deinen einzelnen Beitrag anpassen. Kleine Pakete eignen sich zum Einstieg. Größere Mengen senken den rechnerischen Preis je 100 Saves. Das Einstiegspaket umfasst ${formatQuantity(minQty)} Saves für ${formatEuroFromCents(minCents)}, das größte Standardpaket ${formatQuantity(maxQty)} Saves für ${formatEuroFromCents(maxCents)}. Entscheidend ist nicht, möglichst groß zu bestellen, sondern eine Menge zu wählen, die zu deinem Beitrag und deiner bisherigen Kontogröße passt.$2`
  );
  next = next.replace(/<span data-fbsaves-price="(\d+)">[\s\S]*?<\/span>/gi, (_m, qtyRaw: string) => {
    const qty = Number(qtyRaw);
    const index = quantities.indexOf(qty);
    const cents = index >= 0 ? pricesCents[index] : undefined;
    const label = typeof cents === "number" ? formatEuroFromCents(cents) : "";
    return `<span data-fbsaves-price="${qty}">${label}</span>`;
  });
  return next;
}

function enhanceFaqs(html: string): string {
  if (html.includes("instagram-saves-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `instagram-saves-faq-answer-${n}`;
      return `<details class="fbsaves-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><div id="${answerId}">${answer}</div></details>`;
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

/** Scoping, Preiszeilen, FAQ-IDs und CTA-Anker nur für Instagram Saves. */
export function prepareInstagramSavesDescriptionHtml(
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
