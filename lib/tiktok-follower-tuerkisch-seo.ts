/**
 * SEO- und Content-Helfer nur für /product/tiktok-follower-tuerkisch-kaufen.
 *
 * PRODUKTDEFINITION FC-019 (technisch vorbereitet 2026-09-08)
 * Preise: content/products.json. Herkunft/Lieferart/Nachfüllung: Betreiberbestätigung
 * für dieses TikTok-Produkt steht aus. Keine Übernahme aus Instagram Likes Deutsch.
 *
 * Offene Punkte: türkische Profilmerkmale konkret, Länderanteil, Lieferweise,
 * Nachfüllfrist. Entwurf spricht von türkischem/türkischsprachigem Profilbezug
 * ohne Herkunftsgarantie.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const TIKTOK_FOLLOWER_TUERKISCH_SLUG = "tiktok-follower-tuerkisch-kaufen";

export const TIKTOK_FOLLOWER_TUERKISCH_TITLE = "Türkische TikTok Follower kaufen | Followerbase";

export const TIKTOK_FOLLOWER_TUERKISCH_DESCRIPTION =
  "Türkische TikTok Follower ab 2,85 € bestellen. Sechs Pakete von 100 bis 5.000 Followern. Profillink oder Nutzername genügt, kein TikTok-Passwort nötig.";

export const TIKTOK_FOLLOWER_TUERKISCH_H1 = "TikTok Follower Türkisch kaufen";

export const TIKTOK_FOLLOWER_TUERKISCH_IMAGE_ALT = "TikTok Follower Türkisch kaufen";

export const TIKTOK_FOLLOWER_TUERKISCH_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

export const TIKTOK_FOLLOWER_TUERKISCH_HTML_FILE = "content/product-html/tiktok-follower-tuerkisch-kaufen.html";

export const TIKTOK_FOLLOWER_TUERKISCH_BULLETS = [
  "Kein TikTok-Passwort",
  "Sechs Pakete ab 2,85 €",
  "Einmalzahlung",
] as const;

export const TIKTOK_FOLLOWER_TUERKISCH_TARGET_HINT =
  "Öffentlicher TikTok-Profillink oder @Nutzername. Kein Video-, Musik- oder Hashtag-Link. Die Prüfung erkennt das Format, nicht die Sichtbarkeit.";

export const TIKTOK_FOLLOWER_TUERKISCH_EMPTY_TARGET_ERROR =
  "Bitte den TikTok-Nutzernamen oder Profillink eingeben.";

export const TIKTOK_FOLLOWER_TUERKISCH_INVALID_TARGET_ERROR =
  "Bitte einen TikTok-Nutzernamen oder Profillink angeben, kein Video- oder Hashtag-Link.";

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fbtr-tiktok-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: break-word; word-break: normal; }
${SCOPE} h2,
${SCOPE} h3 { overflow-wrap: break-word; word-break: normal; }
${SCOPE} .fbtt-hero,
${SCOPE} .fbtt-hero > *,
${SCOPE} .fbtt-variant-section,
${SCOPE} .fbtt-variant-section > * { min-width: 0; }
${SCOPE} .fbtt-button:focus-visible,
${SCOPE} .fbtt-nav a:focus-visible,
${SCOPE} .fbtt-faq-list summary:focus-visible {
  outline: 3px solid rgba(121, 57, 216, .5);
  outline-offset: 4px;
}
@media (min-width: 821px) {
  ${SCOPE} .fbtt-hero {
    grid-template-columns: minmax(0, 1.5fr) minmax(240px, 1fr);
  }
}
@media (max-width: 820px) {
  ${SCOPE} .fbtt-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
  ${SCOPE} .fbtt-hero h2 {
    font-size: clamp(1.55rem, 7vw, 2.15rem);
  }
  ${SCOPE} .fbtt-variant-section {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
}
@media (max-width: 600px) {
  ${SCOPE} .fbtt-hero-main { padding: 22px 16px; }
  ${SCOPE} .fbtt-section h2 {
    font-size: clamp(1.28rem, 6vw, 1.7rem);
    text-wrap: balance;
  }
}
@media (prefers-reduced-motion: reduce) {
  ${SCOPE} .fbtt-button { transition: none; }
}
`;

export function isTiktokFollowerTuerkischProduct(slug: string): boolean {
  return slug === TIKTOK_FOLLOWER_TUERKISCH_SLUG;
}

type PriceSource = {
  quantities?: number[];
  pricesCents?: number[];
};

export function getTiktokFollowerTuerkischPackagePriceCents(
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

export function loadTiktokFollowerTuerkischHtml(fallback?: string): string {
  try {
    return readFileSync(path.join(process.cwd(), TIKTOK_FOLLOWER_TUERKISCH_HTML_FILE), "utf8");
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
        if (s.startsWith(".fbtr-tiktok-copy")) return `${SCOPE_ROOT} ${s}`;
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
  const target = `#${TIKTOK_FOLLOWER_TUERKISCH_ORDER_ID}`;
  return html.replace(/(<a\b[^>]*fbtt-button[^>]*\bhref=["'])[^"']*(["'])/gi, `$1${target}$2`);
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

  let next = html.replace(
    /(<[^>]*data-fbtt-price=["'](\d+)["'][^>]*>)[\s\S]*?(<\/(?:p|strong)>)/gi,
    (_m, open: string, qtyRaw: string, close: string) => {
      const qty = Number(qtyRaw);
      const index = quantities.indexOf(qty);
      const cents = index >= 0 ? pricesCents[index] : undefined;
      const label = typeof cents === "number" ? formatEuroFromCents(cents) : "";
      return `${open}${label}${close}`;
    }
  );
  next = next.replace(
    /(<[^>]*data-fbtt-unit=["'](\d+)["'][^>]*>)[\s\S]*?(<\/p>)/gi,
    (_m, open: string, qtyRaw: string, close: string) => {
      const qty = Number(qtyRaw);
      const index = quantities.indexOf(qty);
      const cents = index >= 0 ? pricesCents[index] : undefined;
      if (typeof cents !== "number" || qty <= 0) return `${open}${close}`;
      return `${open}${formatEuroFromCents(unitPricePerHundredCents(qty, cents))} je 100${close}`;
    }
  );
  next = next.replace(
    /Der Einstieg liegt bei [^.<]+€/,
    `Der Einstieg liegt bei ${formatEuroFromCents(minCents)}`
  );
  next = next.replace(
    /Das kleinste Paket umfasst [\d.\u00a0]+ Follower für [^.<]+€/,
    `Das kleinste Paket umfasst ${formatQuantity(minQty)} Follower für ${formatEuroFromCents(minCents)}`
  );
  next = next.replace(
    /<p class="fbtt-start-amount">für [\d.\u00a0]+ Follower<\/p>/,
    `<p class="fbtt-start-amount">für ${formatQuantity(minQty)} Follower</p>`
  );
  next = next.replace(
    /<dd>[\d.\u00a0]+ bis [\d.\u00a0]+<\/dd>/,
    `<dd>${formatQuantity(minQty)} bis ${formatQuantity(maxQty)}</dd>`
  );
  return next;
}

function enhanceFaqs(html: string): string {
  if (html.includes("tiktok-follower-tuerkisch-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `tiktok-follower-tuerkisch-faq-answer-${n}`;
      return `<details class="fbtt-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><div id="${answerId}">${answer}</div></details>`;
    }
  );
}

export function prepareTiktokFollowerTuerkischDescriptionHtml(
  html: string | undefined,
  product?: PriceSource
): string {
  const sourceHtml = loadTiktokFollowerTuerkischHtml(html);
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
