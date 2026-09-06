/**
 * SEO- und Content-Helfer nur für /product/instagram-follower-deutsch-kaufen.
 *
 * PRODUKTDEFINITION FC-003 (geprüft 2026-09-06)
 * Quellen: content/products.json, Supabase-Produktzeile, ProductOrderBlock.
 * Keine Lieferanten-API und keine Servicekonfiguration mit Herkunftsmerkmalen.
 *
 * 1. Sind Profile laut Lieferant Deutschland zugeordnet? Nicht hinterlegt.
 * 2. Nur Deutschland, DACH oder deutschsprachig? Nicht hinterlegt.
 * 3. Zuordnungskriterium (Standort, Sprache, Name, Bio, Inhalte): nicht hinterlegt.
 * 4. Echte Personen, aktive Nutzer oder spätere Interaktionen: nicht als Leistung hinterlegt.
 * 5. Nicht garantiert: Herkunft, Sprache, Aktivität, Likes, Kommentare, Reichweite, Käufe,
 *    Algorithmuswirkung. Nachfüllung für FC-003 nicht hinterlegt (FC-001 hat eigene Bullets).
 * 6. Kontotypen/Sichtbarkeit: Formular verlangt Nutzername oder Profillink, keine
 *    Sichtbarkeitspflicht im Code.
 *
 * Veröffentlicht wird der redaktionelle Block mit der Formulierung
 * „deutschsprachiger beziehungsweise DACH-naher Profil-Schwerpunkt“,
 * ausdrücklich ohne Wohnort-, Sprach- oder Aktivitätsgarantie.
 */
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const INSTAGRAM_FOLLOWER_DEUTSCH_SLUG = "instagram-follower-deutsch-kaufen";

export const INSTAGRAM_FOLLOWER_DEUTSCH_TITLE = "Deutsche Instagram Follower kaufen ab 7,90 € | Followerbase";

export const INSTAGRAM_FOLLOWER_DEUTSCH_DESCRIPTION =
  "Deutsche Instagram Follower ab 7,90 € bestellen. Sechs Pakete, kein Passwort und klare Produktdetails bei Followerbase.";

export const INSTAGRAM_FOLLOWER_DEUTSCH_H1 = "Instagram Follower Deutsch kaufen";

export const INSTAGRAM_FOLLOWER_DEUTSCH_IMAGE_ALT = "Instagram Follower Deutsch kaufen";

export const INSTAGRAM_FOLLOWER_DEUTSCH_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

export const INSTAGRAM_FOLLOWER_DEUTSCH_BULLETS = [
  "Kein Instagram-Passwort",
  "Sechs Pakete ab 7,90 €",
  "Einmalzahlung",
] as const;

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fbdef-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
${SCOPE} .fbdef-table-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  -webkit-overflow-scrolling: touch;
}
${SCOPE} .fbdef-table-wrap table { width: 100%; min-width: 700px; border-collapse: collapse; }
${SCOPE} tbody th {
  background: #fff;
  color: var(--fbdef-heading, #342d4d);
  font-size: 1em;
  font-weight: 700;
}
${SCOPE} tbody tr.fbdef-current td,
${SCOPE} tbody tr.fbdef-current th { background: #f3edff; }
${SCOPE} .fbdef-faq summary { list-style: none; }
${SCOPE} .fbdef-faq summary::-webkit-details-marker { display: none; }
${SCOPE} .fbdef-button:focus-visible,
${SCOPE} .fbdef-faq summary:focus-visible,
${SCOPE} .fbdef-nav a:focus-visible,
${SCOPE} .fbdef-mini-link:focus-visible,
${SCOPE} .fbdef-table-wrap:focus-visible {
  outline: 3px solid rgba(138, 85, 238, .42);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  ${SCOPE} .fbdef-button { transition: none; }
  ${SCOPE} .fbdef-button:hover { transform: none; }
}
`;

export function isInstagramFollowerDeutschProduct(slug: string): boolean {
  return slug === INSTAGRAM_FOLLOWER_DEUTSCH_SLUG;
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
        if (s.startsWith(".fbdef-copy")) return `${SCOPE_ROOT} ${s}`;
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
  const target = `#${INSTAGRAM_FOLLOWER_DEUTSCH_ORDER_ID}`;
  return html.replace(
    /(<a\b[^>]*(?:fbdef-button|fbdef-mini-link)[^>]*\bhref=["'])[^"']*(["'])/gi,
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
  const target = `#${INSTAGRAM_FOLLOWER_DEUTSCH_ORDER_ID}`;
  return quantities
    .map((qty, i) => {
      const cents = pricesCents[i];
      if (typeof cents !== "number" || !Number.isFinite(cents)) return "";
      return `<tr><th scope="row">${formatQuantity(qty)} Follower</th><td class="fbdef-price">${formatEuroFromCents(cents)}</td><td>${perHundredLabel(qty, cents)}</td><td><a class="fbdef-mini-link" href="${target}">Paket wählen</a></td></tr>`;
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
    /<tbody([^>]*data-fbdef-packages[^>]*)>[\s\S]*?<\/tbody>/i,
    `<tbody$1>${buildPackageRows(quantities, pricesCents)}</tbody>`
  );
  next = next.replace(
    /(<[^>]*data-fbdef-from-price[^>]*>)[\s\S]*?(<\/(?:span|strong)>)/gi,
    `$1${fromPrice}$2`
  );
  next = next.replace(
    /(<span[^>]*data-fbdef-qty-range[^>]*>)[\s\S]*?(<\/span>)/gi,
    `$1${formatQuantity(minQty)} und ${formatQuantity(maxQty)} Followern$2`
  );
  next = next.replace(
    /(<span[^>]*data-fbdef-qty-span[^>]*>)[\s\S]*?(<\/span>)/gi,
    `$1${formatQuantity(minQty)} bis ${formatQuantity(maxQty)}$2`
  );
  next = next.replace(
    /(<span[^>]*data-fbdef-package-count[^>]*>)[\s\S]*?(<\/span>)/gi,
    `$1${quantities.length} Pakete$2`
  );
  next = next.replace(
    /(<strong[^>]*data-fbdef-package-count[^>]*>)[\s\S]*?(<\/strong>)/gi,
    `$1${quantities.length} Paketgrößen$2`
  );
  next = next.replace(
    /(<p[^>]*data-fbdef-price-lead[^>]*>)[\s\S]*?(<\/p>)/i,
    `$1Du kannst zwischen ${formatQuantity(minQty)} und ${formatQuantity(maxQty)} Followern wählen. Das kleinste Paket kostet ${formatEuroFromCents(minCents)}, das größte ${formatEuroFromCents(maxCents)}. Kleine Mengen eignen sich für einen vorsichtigen Einstieg. Bei größeren Paketen sinkt der rechnerische Preis je 100 Follower. Die passende Menge sollte trotzdem zu deinem bisherigen Profil passen und nicht allein nach dem günstigsten Stückpreis gewählt werden.$2`
  );
  return next;
}

function enhanceFaqs(html: string): string {
  if (html.includes("instagram-follower-deutsch-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `instagram-follower-deutsch-faq-answer-${n}`;
      return `<details class="fbdef-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><div id="${answerId}">${answer}</div></details>`;
    }
  );
}

function firstColumnRowHeaders(html: string): string {
  return html.replace(/<tbody([^>]*)>([\s\S]*?)<\/tbody>/gi, (_m, attrs: string, body: string) => {
    const nextBody = body.replace(
      /<tr(\b[^>]*)>\s*<td\b([^>]*)>([\s\S]*?)<\/td>/gi,
      "<tr$1><th scope=\"row\"$2>$3</th>"
    );
    return `<tbody${attrs}>${nextBody}</tbody>`;
  });
}

/** Scoping, Preiszeilen aus Produktdaten, FAQ-IDs und CTA-Anker nur für diese Seite. */
export function prepareInstagramFollowerDeutschDescriptionHtml(
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
