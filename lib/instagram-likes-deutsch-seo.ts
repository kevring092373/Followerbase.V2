/**
 * SEO- und Content-Helfer nur für /product/instagram-likes-deutsch-kaufen.
 *
 * PRODUKTDEFINITION FC-007 (geprüft 2026-09-08)
 * Shopbetreiber bestätigt: deutschsprachige Accountmerkmale (Namen, Profilgestaltung);
 * tatsächliche Herkunft nicht bekannt bzw. nicht verifiziert. Keine Umschreibung in
 * „garantiert aus Deutschland“, „echte deutsche Nutzer“, DACH-Herkunft oder Stadt-Targeting.
 *
 * Quellen: content/products.json, ProductOrderBlock, lib/instagram-url.ts,
 * ProductPaymentIcons, sichtbares Bestellmodul. Keine Lieferanten-API.
 *
 * Offene Produktfragen (nicht als Leistung behaupten):
 * 1. Verifizierter Wohnort/Staatsangehörigkeit: nicht zugesichert.
 * 2. Drip-Feed, feste Lieferdauer, 30-Tage-Nachfüllung: nicht hinterlegt.
 * 3. Klarna: im Zahlungsbereich nicht vorhanden (PayPal, Kreditkarte, Überweisung).
 * 4. URL-Prüfung erkennt /p/, /reel/, /reels/, /tv/, nicht die Sichtbarkeit.
 *
 * Bestellangabe: öffentlicher Instagram-Beitragslink (Posts, Reels, Karussells, TV).
 * Kein Passwort. Pakete: 50 / 100 / 250 / 500 / 1.000 / 2.500. Preise aus pricesCents.
 * Zwischenmengen sind im Katalog nicht vorgesehen.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const INSTAGRAM_LIKES_DEUTSCH_SLUG = "instagram-likes-deutsch-kaufen";

export const INSTAGRAM_LIKES_DEUTSCH_TITLE = "Deutsche Instagram Likes kaufen | Followerbase";

export const INSTAGRAM_LIKES_DEUTSCH_DESCRIPTION =
  "Deutsche Instagram Likes ab 3,90 €: Accounts mit deutschsprachigen Profilmerkmalen. Paket auswählen und per Beitragslink bestellen. Ohne Instagram-Passwort.";

export const INSTAGRAM_LIKES_DEUTSCH_H1 = "Instagram Likes Deutsch kaufen";

export const INSTAGRAM_LIKES_DEUTSCH_IMAGE_ALT = "Instagram Likes Deutsch kaufen";

export const INSTAGRAM_LIKES_DEUTSCH_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

export const INSTAGRAM_LIKES_DEUTSCH_HTML_FILE = "content/product-html/instagram-likes-deutsch-kaufen.html";

export const INSTAGRAM_LIKES_DEUTSCH_BULLETS = [
  "Kein Instagram-Passwort",
  "Sechs Pakete ab 3,90 €",
  "Einmalzahlung",
] as const;

export const INSTAGRAM_LIKES_DEUTSCH_TARGET_HINT =
  "Öffentlicher Instagram-Link zu einem Beitrag, Reel oder Karussell. Erkannt werden /p/, /reel/, /reels/ und /tv/. Die Prüfung erkennt das Format, nicht die Sichtbarkeit.";

export const INSTAGRAM_LIKES_DEUTSCH_EMPTY_TARGET_ERROR =
  "Bitte den Link zu deinem Instagram-Beitrag, Reel oder Karussell einfügen.";

export const INSTAGRAM_LIKES_DEUTSCH_INVALID_TARGET_ERROR =
  "Bitte einen gültigen Instagram-Link zu einem Beitrag, Reel oder Karussell einfügen.";

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fbde-likes-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
${SCOPE} .fbdl-button:focus-visible,
${SCOPE} .fbdl-text-link:focus-visible,
${SCOPE} .fbdl-jumpnav a:focus-visible,
${SCOPE} .fbdl-faq summary:focus-visible {
  outline: 3px solid rgba(107, 43, 212, .55);
  outline-offset: 4px;
}
@media (prefers-reduced-motion: reduce) {
  ${SCOPE} .fbdl-button { transition: none; }
}
`;

export function isInstagramLikesDeutschProduct(slug: string): boolean {
  return slug === INSTAGRAM_LIKES_DEUTSCH_SLUG;
}

type PriceSource = {
  quantities?: number[];
  pricesCents?: number[];
};

export function getInstagramLikesDeutschPackagePriceCents(
  quantity: number,
  source: PriceSource
): number | null {
  const quantities = Array.isArray(source.quantities) ? source.quantities : [];
  const pricesCents = Array.isArray(source.pricesCents) ? source.pricesCents : [];
  const index = quantities.indexOf(quantity);
  if (index < 0) return null;
  const cents = pricesCents[index];
  return typeof cents === "number" && Number.isFinite(cents) && cents >= 0 ? cents : null;
}

export function loadInstagramLikesDeutschHtml(fallback?: string): string {
  try {
    return readFileSync(path.join(process.cwd(), INSTAGRAM_LIKES_DEUTSCH_HTML_FILE), "utf8");
  } catch {
    return fallback ?? "";
  }
}

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
        if (s.startsWith(".fbde-likes-copy")) return `${SCOPE_ROOT} ${s}`;
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
  const target = `#${INSTAGRAM_LIKES_DEUTSCH_ORDER_ID}`;
  return html.replace(
    /(<a\b[^>]*fbdl-button[^>]*\bhref=["'])[^"']*(["'])/gi,
    `$1${target}$2`
  );
}

function unitPricePerHundredCents(quantity: number, priceCents: number): number {
  return Math.round((priceCents / quantity) * 100);
}

function injectPackagePrices(html: string, source: PriceSource): string {
  const quantities = Array.isArray(source.quantities) ? source.quantities : [];
  const pricesCents = Array.isArray(source.pricesCents) ? source.pricesCents : [];
  if (!quantities.length || quantities.length !== pricesCents.length) return html;

  const minCents = Math.min(...pricesCents);
  const minQty = quantities[pricesCents.indexOf(minCents)] ?? quantities[0];

  let next = html.replace(
    /(<[^>]*data-fbdl-price-for=["'](\d+)["'][^>]*>)[\s\S]*?(<\/p>)/gi,
    (_m, open: string, qtyRaw: string, close: string) => {
      const qty = Number(qtyRaw);
      const index = quantities.indexOf(qty);
      const cents = index >= 0 ? pricesCents[index] : undefined;
      const label = typeof cents === "number" ? formatEuroFromCents(cents) : "";
      return `${open}${label}${close}`;
    }
  );
  next = next.replace(
    /(<[^>]*data-fbdl-unit-for=["'](\d+)["'][^>]*>)[\s\S]*?(<\/p>)/gi,
    (_m, open: string, qtyRaw: string, close: string) => {
      const qty = Number(qtyRaw);
      const index = quantities.indexOf(qty);
      const cents = index >= 0 ? pricesCents[index] : undefined;
      if (typeof cents !== "number" || qty <= 0) return `${open}${close}`;
      return `${open}${formatEuroFromCents(unitPricePerHundredCents(qty, cents))} je 100 Likes${close}`;
    }
  );
  next = next.replace(
    /(<span class="fbdl-soft-tag">)[\s\S]*?(<\/span>)/i,
    `$1Ab ${formatQuantity(minQty)} Likes$2`
  );
  next = next.replace(
    /Das kleinste Standardpaket umfasst [\d.\u00a0]+ Likes und kostet derzeit [^.<]+€/,
    `Das kleinste Standardpaket umfasst ${formatQuantity(minQty)} Likes und kostet derzeit ${formatEuroFromCents(minCents)}`
  );
  return next;
}

function enhanceFaqs(html: string): string {
  if (html.includes("instagram-likes-deutsch-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `instagram-likes-deutsch-faq-answer-${n}`;
      return `<details class="fbdl-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><div id="${answerId}">${answer}</div></details>`;
    }
  );
}

/** Scoping, Preiszeilen aus Produktdaten, FAQ-IDs und CTA-Anker nur für diese Seite. */
export function prepareInstagramLikesDeutschDescriptionHtml(
  html: string | undefined,
  product?: PriceSource
): string {
  const sourceHtml = loadInstagramLikesDeutschHtml(html);
  if (!sourceHtml) return "";
  let { css, body } = extractStyleAndBody(sourceHtml);
  css = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\n)\s*\*\s*\{[^}]*\}/g, "$1")
    .replace(/(^|\n)\s*body\s*\{[^}]*\}/g, "$1")
    .replace(/(^|\n)\s*:root\s*\{[^}]*\}/g, "$1")
    .replace(/(^|\n)\s*h1\s*\{[^}]*\}/g, "$1");
  body = injectPackagePrices(body, product ?? {});
  body = decorateHeadings(body);
  body = enhanceFaqs(body);
  body = rewriteCtas(body);
  return `<style>${scopeCss(css)}\n${EXTRA_CSS}</style>${body}`;
}
