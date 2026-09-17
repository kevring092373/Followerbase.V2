/**
 * SEO- und Content-Helfer nur für /product/youtube-follower-kaufen.
 *
 * PRODUKTDEFINITION FC-027 (technisch vorbereitet 2026-09-17)
 * Preise: content/products.json. Lieferstart, Dauer und Nachfüllung: Betreiberbestätigung
 * steht aus. Alte Aussagen zu 24 Stunden, 3–7 Tagen und 30 Tagen Nachfüllung nicht übernehmen.
 *
 * Offene Punkte: Herkunft/Aktivität der Accounts, dauerhafter Erhalt, Nachfüllfrist.
 * Entwurf spricht von Abonnements für den öffentlichen Kanal ohne Partnerprogramm-Zusage.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const YOUTUBE_ABONNENTEN_SLUG = "youtube-follower-kaufen";

export const YOUTUBE_ABONNENTEN_TITLE = "YouTube Abonnenten kaufen ab 8,45 € | Followerbase";

export const YOUTUBE_ABONNENTEN_DESCRIPTION =
  "YouTube Abonnenten kaufen: Pakete von 50 bis 1.000 Abonnenten ab 8,45 €. Preise, Bestellung per Kanallink und Grenzen der Leistung bei Followerbase.";

export const YOUTUBE_ABONNENTEN_H1 = "YouTube Abonnenten kaufen";

export const YOUTUBE_ABONNENTEN_IMAGE_ALT = "YouTube Abonnenten kaufen";

export const YOUTUBE_ABONNENTEN_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

export const YOUTUBE_ABONNENTEN_HTML_FILE = "content/product-html/youtube-follower-kaufen.html";

export const YOUTUBE_ABONNENTEN_BULLETS = [
  "Kein YouTube-Passwort",
  "Fünf Pakete ab 8,45 €",
  "Einmalzahlung",
] as const;

export const YOUTUBE_ABONNENTEN_TARGET_HINT =
  "Öffentlicher YouTube-Kanallink (/@Handle oder /channel/UC…). Ein @Handle ohne Link wird ebenfalls erkannt. Kein Video-, Shorts- oder Playlist-Link. Die Prüfung erkennt das Format, nicht die Sichtbarkeit.";

export const YOUTUBE_ABONNENTEN_EMPTY_TARGET_ERROR =
  "Bitte den öffentlichen YouTube-Kanallink oder das @Handle eingeben.";

export const YOUTUBE_ABONNENTEN_INVALID_TARGET_ERROR =
  "Bitte einen YouTube-Kanallink oder ein @Handle angeben, keinen Video-, Shorts- oder Playlist-Link.";

export const YOUTUBE_ABONNENTEN_TARGET_LABEL = "YouTube-Kanallink";

export const YOUTUBE_ABONNENTEN_TARGET_PLACEHOLDER = "z. B. https://www.youtube.com/@deinkanal";

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fbyt-subs-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: break-word; word-break: normal; }
${SCOPE} h2,
${SCOPE} h3 { font-family: inherit; overflow-wrap: break-word; word-break: normal; }
${SCOPE} .fbys-intro,
${SCOPE} .fbys-intro > *,
${SCOPE} .fbys-order,
${SCOPE} .fbys-order > * { min-width: 0; }
${SCOPE} .fbys-button:focus-visible,
${SCOPE} .fbys-text-link:focus-visible,
${SCOPE} .fbys-nav a:focus-visible,
${SCOPE} .fbys-faq summary:focus-visible {
  outline: 3px solid rgba(116, 53, 206, .5);
  outline-offset: 4px;
}
@media (min-width: 761px) {
  ${SCOPE} .fbys-intro {
    grid-template-columns: minmax(0, 1.65fr) minmax(240px, 1fr);
  }
  ${SCOPE} .fbys-order {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  }
}
@media (max-width: 960px) {
  ${SCOPE} .fbys-packages {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  ${SCOPE} .fbys-intro,
  ${SCOPE} .fbys-order,
  ${SCOPE} .fbys-scope-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
  ${SCOPE} .fbys-intro h2 {
    font-size: clamp(1.55rem, 7vw, 2.15rem);
  }
  ${SCOPE} .fbys-closing {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 520px) {
  ${SCOPE} .fbys-intro { padding: 19px; }
  ${SCOPE} .fbys-section h2 {
    font-size: clamp(1.28rem, 6vw, 1.7rem);
    text-wrap: balance;
  }
  ${SCOPE} .fbys-unit { white-space: normal; }
  ${SCOPE} .fbys-packages {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  ${SCOPE} .fbys-intro .fbys-button,
  ${SCOPE} .fbys-closing .fbys-button {
    width: 100%;
  }
}
@media (max-width: 350px) {
  ${SCOPE} .fbys-packages {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (prefers-reduced-motion: reduce) {
  ${SCOPE} .fbys-button { transition: none; }
}
`;

export function isYoutubeAbonnentenProduct(slug: string): boolean {
  return slug === YOUTUBE_ABONNENTEN_SLUG;
}

type PriceSource = {
  quantities?: number[];
  pricesCents?: number[];
};

export function getYoutubeAbonnentenPackagePriceCents(
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

export function loadYoutubeAbonnentenHtml(fallback?: string): string {
  try {
    return readFileSync(path.join(process.cwd(), YOUTUBE_ABONNENTEN_HTML_FILE), "utf8");
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
        if (s.startsWith(".fbyt-subs-copy")) return `${SCOPE_ROOT} ${s}`;
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
  const target = `#${YOUTUBE_ABONNENTEN_ORDER_ID}`;
  return html.replace(
    /(<a\b[^>]*(?:fbys-button|fbys-text-link)[^>]*\bhref=["'])#produkt-auswahl(["'])/gi,
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
  const maxQty = quantities[quantities.length - 1];
  const price100 = getYoutubeAbonnentenPackagePriceCents(100, source);
  const price1000 = getYoutubeAbonnentenPackagePriceCents(1000, source);

  let next = html.replace(
    /(<[^>]*data-fbys-price=["'](\d+)["'][^>]*>)[\s\S]*?(<\/(?:p|strong)>)/gi,
    (_m, open: string, qtyRaw: string, close: string) => {
      const qty = Number(qtyRaw);
      const cents = getYoutubeAbonnentenPackagePriceCents(qty, { quantities, pricesCents });
      const label = typeof cents === "number" ? formatEuroFromCents(cents) : "";
      return `${open}${label}${close}`;
    }
  );
  next = next.replace(
    /(<[^>]*data-fbys-unit=["'](\d+)["'][^>]*>)[\s\S]*?(<\/p>)/gi,
    (_m, open: string, qtyRaw: string, close: string) => {
      const qty = Number(qtyRaw);
      const cents = getYoutubeAbonnentenPackagePriceCents(qty, { quantities, pricesCents });
      if (typeof cents !== "number" || qty <= 0) return `${open}${close}`;
      return `${open}${formatEuroFromCents(unitPricePerHundredCents(qty, cents))} je 100${close}`;
    }
  );
  next = next.replace(
    /<p class="fbys-card-quantity">für [\d.\u00a0]+ Abonnenten<\/p>/,
    `<p class="fbys-card-quantity">für ${formatQuantity(minQty)} Abonnenten</p>`
  );
  next = next.replace(
    /<dd>[\d.\u00a0]+ bis [\d.\u00a0]+<\/dd>/,
    `<dd>${formatQuantity(minQty)} bis ${formatQuantity(maxQty)}</dd>`
  );
  next = next.replace(
    /Das kleinste Paket umfasst [\d.\u00a0]+ Abonnenten für [^.<]+€/,
    `Das kleinste Paket umfasst ${formatQuantity(minQty)} Abonnenten für ${formatEuroFromCents(minCents)}`
  );
  if (typeof price100 === "number" && typeof price1000 === "number") {
    next = next.replace(
      /[\d.\u00a0]+ Abonnenten kosten [^.<]+€, das Paket mit [\d.\u00a0]+ Abonnenten kostet [^.<]+€\. Der Einstieg liegt bei [\d.\u00a0]+ Abonnenten für [^.<]+€/,
      `${formatQuantity(100)} Abonnenten kosten ${formatEuroFromCents(price100)}, das Paket mit ${formatQuantity(1000)} Abonnenten kostet ${formatEuroFromCents(price1000)}. Der Einstieg liegt bei ${formatQuantity(minQty)} Abonnenten für ${formatEuroFromCents(minCents)}`
    );
  }
  return next;
}

function enhanceFaqs(html: string): string {
  if (html.includes("youtube-abonnenten-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `youtube-abonnenten-faq-answer-${n}`;
      return `<details class="fbys-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><div id="${answerId}">${answer}</div></details>`;
    }
  );
}

export function prepareYoutubeAbonnentenDescriptionHtml(
  html: string | undefined,
  product?: PriceSource
): string {
  const sourceHtml = loadYoutubeAbonnentenHtml(html);
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
