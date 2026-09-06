/**
 * SEO- und Content-Helfer nur für /product/instagram-follower-tuerkisch-kaufen.
 *
 * PRODUKTDEFINITION FC-002 (geprüft 2026-09-06)
 * Quellen: content/products.json, Supabase-Produktzeile, ProductOrderBlock.
 * Keine Lieferanten-API und keine Servicekonfiguration mit Herkunftsmerkmalen.
 *
 * 1. Sind Profile laut Lieferant der Türkei zugeordnet? Nicht hinterlegt.
 * 2. Nur Türkei, türkischsprachig oder Türkei-nah? Nicht hinterlegt.
 * 3. Zuordnungskriterium (Standort, Sprache, Name, Bio, Inhalte): nicht hinterlegt.
 * 4. Echte Personen, aktive Nutzer oder spätere Interaktionen: nicht als Leistung hinterlegt.
 * 5. Nicht garantiert: Wohnort, Staatsangehörigkeit, Sprache, Aktivität, Likes, Kommentare,
 *    Reichweite, Käufe. Nachfüllung für FC-002 nicht hinterlegt (FC-001 hat eigene Bullets).
 * 6. Bestellangabe: Formular verlangt Nutzername oder Profillink, kein Passwort.
 *    Sichtbarkeit ist im Code keine Validierungspflicht; der Hinweis im Modul bleibt maßgeblich.
 *
 * Veröffentlicht wird der redaktionelle Block mit der Formulierung
 * „türkischsprachiger beziehungsweise Türkei-naher Profil-Schwerpunkt“,
 * ausdrücklich ohne Wohnort-, Staatsangehörigkeits- oder Aktivitätsgarantie.
 */
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const INSTAGRAM_FOLLOWER_TUERKISCH_SLUG = "instagram-follower-tuerkisch-kaufen";

export const INSTAGRAM_FOLLOWER_TUERKISCH_TITLE = "Türkische Instagram Follower kaufen | Followerbase";

export const INSTAGRAM_FOLLOWER_TUERKISCH_DESCRIPTION =
  "Türkische Instagram Follower ab 2,49 € bestellen. Sechs Pakete, kein Passwort und transparente Produktdetails bei Followerbase.";

export const INSTAGRAM_FOLLOWER_TUERKISCH_H1 = "Instagram Follower Türkisch kaufen";

export const INSTAGRAM_FOLLOWER_TUERKISCH_IMAGE_ALT = "Instagram Follower Türkisch kaufen";

export const INSTAGRAM_FOLLOWER_TUERKISCH_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

export const INSTAGRAM_FOLLOWER_TUERKISCH_BULLETS = [
  "Kein Instagram-Passwort",
  "Sechs Pakete ab 2,49 €",
  "Einmalzahlung",
] as const;

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fbtr-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
${SCOPE} .fbtr-tablewrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  -webkit-overflow-scrolling: touch;
}
${SCOPE} .fbtr-tablewrap table { width: 100%; min-width: 660px; border-collapse: collapse; }
${SCOPE} tbody th {
  background: #fff;
  color: var(--fbtr-purple-dark, #4c1d95);
  font-size: 1em;
  font-weight: 800;
  min-width: 170px;
}
${SCOPE} tbody tr.fbtr-current td,
${SCOPE} tbody tr.fbtr-current th { background: var(--fbtr-purple-soft, #f2ecff); }
${SCOPE} summary::-webkit-details-marker { display: none; }
${SCOPE} .fbtr-button:focus-visible,
${SCOPE} summary:focus-visible,
${SCOPE} .fbtr-tablewrap:focus-visible {
  outline: 3px solid var(--fbtr-warm, #ffb347);
  outline-offset: 3px;
}
`;

export function isInstagramFollowerTuerkischProduct(slug: string): boolean {
  return slug === INSTAGRAM_FOLLOWER_TUERKISCH_SLUG;
}

type PriceSource = {
  quantities?: number[];
  pricesCents?: number[];
  articleNumber?: string;
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
        if (s.startsWith(".fbtr-copy")) return `${SCOPE_ROOT} ${s}`;
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
  const target = `#${INSTAGRAM_FOLLOWER_TUERKISCH_ORDER_ID}`;
  return html.replace(
    /(<a\b[^>]*fbtr-button[^>]*\bhref=["'])[^"']*(["'])/gi,
    `$1${target}$2`
  );
}

function perHundredLabel(quantity: number, priceCents: number): string {
  return formatEuroFromCents(Math.round((priceCents / quantity) * 100));
}

function offerSku(articleNumber: string | undefined, quantity: number): string {
  const base = (articleNumber || "FC-002").trim().replace(/-\d+$/, "");
  return `${base}-${quantity}`;
}

function buildPackageRows(quantities: number[], pricesCents: number[], articleNumber?: string): string {
  return quantities
    .map((qty, i) => {
      const cents = pricesCents[i];
      if (typeof cents !== "number" || !Number.isFinite(cents)) return "";
      return `<tr><th scope="row">${formatQuantity(qty)} Follower</th><td>${formatEuroFromCents(cents)}</td><td>${perHundredLabel(qty, cents)}</td><td>${offerSku(articleNumber, qty)}</td></tr>`;
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
    /<tbody([^>]*data-fbtr-packages[^>]*)>[\s\S]*?<\/tbody>/i,
    `<tbody$1>${buildPackageRows(quantities, pricesCents, source.articleNumber)}</tbody>`
  );
  next = next.replace(
    /(<[^>]*data-fbtr-from-price[^>]*>)[\s\S]*?(<\/(?:span|strong)>)/gi,
    `$1${fromPrice}$2`
  );
  next = next.replace(
    /(<span[^>]*data-fbtr-qty-fact[^>]*>)[\s\S]*?(<\/span>)/gi,
    `$1von ${formatQuantity(minQty)} bis ${formatQuantity(maxQty)} Follower$2`
  );
  next = next.replace(
    /(<strong[^>]*data-fbtr-package-count[^>]*>)[\s\S]*?(<\/strong>)/gi,
    `$1${quantities.length} Pakete$2`
  );
  next = next.replace(
    /(<p[^>]*data-fbtr-price-lead[^>]*>)[\s\S]*?(<\/p>)/i,
    `$1Du kannst zwischen ${formatQuantity(minQty)} und ${formatQuantity(maxQty)} Followern wählen. Das kleinste Paket kostet ${formatEuroFromCents(minCents)}, das größte ${formatEuroFromCents(maxCents)}. Kleine Mengen halten die erste Bestellung überschaubar; größere Pakete senken rechnerisch den Preis je 100 Follower. Entscheide trotzdem nach der gewünschten Gesamtmenge und deinem tatsächlichen Bedarf, nicht allein nach dem niedrigsten Stückpreis.$2`
  );
  return next;
}

function enhanceFaqs(html: string): string {
  if (html.includes("instagram-follower-tuerkisch-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `instagram-follower-tuerkisch-faq-answer-${n}`;
      return `<details class="fbtr-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><p id="${answerId}">${answer}</p></details>`;
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
export function prepareInstagramFollowerTuerkischDescriptionHtml(
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
