/**
 * SEO- und Content-Helfer nur für /product/youtube-watchtime-kaufen.
 *
 * PRODUKTDEFINITION FC-031 (Langtext aus Komplettpaket 2026-09-24)
 * Bestätigt: Verkaufseinheit Stunden; Pakete 100 / 500 / 1.000 / 2.000 / 4.000;
 * Ziel ein normales YouTube-Video ab 10 Minuten; keine Verteilung auf mehrere Videos;
 * Lieferbeginn 1–10 Stunden; Gesamtdauer mehrere Stunden bis Tage; Nachfüllung bis 30 Tage.
 * Preise: content/products.json. Keine Monetarisierungs- oder YPP-Anrechnungszusage.
 *
 * Offene Punkte (nicht als Leistung behaupten):
 * Startpunkt und Bedingungen der Nachfüllung, Abwicklung, Ausschlüsse,
 * feste Höchstdauer je Paket, genauer Auslöser der Lieferbeginn-Frist,
 * Unterstützung von Zwischenmengen (z. B. 150 / 550).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { htmlToPlainText, PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";

export const YOUTUBE_WATCHTIME_SLUG = "youtube-watchtime-kaufen";

export const YOUTUBE_WATCHTIME_TITLE = "YouTube Watchtime kaufen: Pakete & Ablauf | Followerbase";

export const YOUTUBE_WATCHTIME_DESCRIPTION =
  "YouTube Watchtime kaufen für normale Videos ab 10 Minuten. Stundenpakete, Lieferzeiten und Nachfüllung im Überblick. Keine Monetarisierungsgarantie.";

export const YOUTUBE_WATCHTIME_PRODUCT_DESCRIPTION =
  "YouTube Watchtime in Stundenpaketen für ein normales Video ab 10 Minuten. Ein Video pro Bestellung, Lieferbeginn 1 bis 10 Stunden, Gesamtdauer mehrere Stunden bis Tage. Keine zugesicherte Anrechnung für das YouTube-Partnerprogramm.";

export const YOUTUBE_WATCHTIME_H1 = "YouTube Watchtime kaufen";

export const YOUTUBE_WATCHTIME_IMAGE_ALT = "YouTube Watchtime kaufen";

export const YOUTUBE_WATCHTIME_ORDER_ID = PRODUCT_ORDER_ANCHOR_ID;

export const YOUTUBE_WATCHTIME_HTML_FILE = "content/product-html/youtube-watchtime-kaufen.html";

export const YOUTUBE_WATCHTIME_UPDATED_AT = "2026-09-24";

export const YOUTUBE_WATCHTIME_BULLETS = [
  "Kein YouTube-Passwort",
  "Stundenpakete für ein Video",
  "Einmalzahlung",
] as const;

export const YOUTUBE_WATCHTIME_QUANTITY_UNIT = "Stunden";

export const YOUTUBE_WATCHTIME_TARGET_LABEL = "Link zu deinem YouTube-Video";

export const YOUTUBE_WATCHTIME_TARGET_PLACEHOLDER = "z. B. https://www.youtube.com/watch?v=…";

export const YOUTUBE_WATCHTIME_TARGET_HINT =
  "Für ein normales YouTube-Video ab 10 Minuten. Keine Verteilung auf mehrere Videos. Öffentlich und ohne Altersbeschränkung. Die Prüfung erkennt das Linkformat, nicht die Videolänge.";

export const YOUTUBE_WATCHTIME_EMPTY_TARGET_ERROR =
  "Bitte den Link zu deinem YouTube-Video einfügen.";

export const YOUTUBE_WATCHTIME_INVALID_TARGET_ERROR =
  "Bitte einen YouTube-Videolink angeben (youtube.com/watch?v=… oder youtu.be/…), keinen Kanal-, Playlist-, Shorts- oder Livestream-Link.";

export const YOUTUBE_WATCHTIME_MULTIPLE_TARGET_ERROR =
  "Bitte nur einen Videolink einfügen. Mehrere URLs werden nicht auf die erste Adresse gekürzt.";

export const YOUTUBE_WATCHTIME_DELIVERY_NOTE =
  "Lieferbeginn: 1–10 Stunden. Gesamtdauer: mehrere Stunden bis Tage. Nachfüllung: bis 30 Tage. Startpunkt, Ausschlüsse und der genaue Auslöser der Frist sind nicht abschließend bestätigt.";

export const YOUTUBE_WATCHTIME_POLICY_NOTE =
  "Keine Zusage einer Anrechnung für das YouTube-Partnerprogramm oder einer Monetarisierung. Künstliche Interaktionen können gegen YouTubes Regeln verstoßen und zu Maßnahmen gegen Inhalte oder Kanal führen.";

const SCOPE_ROOT = ".product-description-raw-html";
const SCOPE = `${SCOPE_ROOT} .fbyt-watchtime-copy`;

const EXTRA_CSS = `
${SCOPE} { max-width: 100%; min-width: 0; overflow-wrap: break-word; word-break: normal; }
${SCOPE} h2,
${SCOPE} h3 { overflow-wrap: break-word; word-break: normal; }
${SCOPE} .fbwt-hero,
${SCOPE} .fbwt-hero > *,
${SCOPE} .fbwt-video-grid,
${SCOPE} .fbwt-service,
${SCOPE} .fbwt-packages,
${SCOPE} .fbwt-timeline { min-width: 0; }
${SCOPE} .fbwt-button:focus-visible,
${SCOPE} .fbwt-text-link:focus-visible,
${SCOPE} .fbwt-summary-link:focus-visible,
${SCOPE} .fbwt-nav a:focus-visible,
${SCOPE} .fbwt-faq summary:focus-visible {
  outline: 3px solid rgba(113, 50, 197, .5);
  outline-offset: 4px;
}
@media (max-width: 760px) {
  ${SCOPE} .fbwt-hero,
  ${SCOPE} .fbwt-video-grid,
  ${SCOPE} .fbwt-service {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  ${SCOPE} .fbwt-hero h2,
  ${SCOPE} .fbwt-section h2 {
    font-size: clamp(1.35rem, 7vw, 2.1rem);
    text-wrap: balance;
  }
  ${SCOPE} .fbwt-price { white-space: normal; }
}
`;

export function isYoutubeWatchtimeProduct(slug: string): boolean {
  return slug === YOUTUBE_WATCHTIME_SLUG;
}

type PriceSource = {
  quantities?: number[];
  pricesCents?: number[];
};

export function getYoutubeWatchtimePackagePriceCents(
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

export function loadYoutubeWatchtimeHtml(fallback?: string): string {
  try {
    return readFileSync(path.join(process.cwd(), YOUTUBE_WATCHTIME_HTML_FILE), "utf8");
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
        if (s.startsWith(".fbyt-watchtime-copy")) return `${SCOPE_ROOT} ${s}`;
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
  return html
    .replace(/https:\/\/followerbase\.de(\/(?:kontakt|blog)[^"'\s>]*)/gi, "$1")
    .replace(
      /(<a\b[^>]*\bhref=["'])\/products(?:\/)?(["'])/gi,
      `$1#${YOUTUBE_WATCHTIME_ORDER_ID}$2`
    );
}

function injectPackagePrices(html: string, source: PriceSource): string {
  const quantities = Array.isArray(source.quantities) ? source.quantities : [];
  const pricesCents = Array.isArray(source.pricesCents) ? source.pricesCents : [];
  if (!quantities.length || quantities.length !== pricesCents.length) return html;
  return html.replace(
    /(<[^>]*data-fbwt-price=["'](\d+)["'][^>]*>)[\s\S]*?(<\/(?:p|strong)>)/gi,
    (_m, open: string, qtyRaw: string, close: string) => {
      const qty = Number(qtyRaw);
      const cents = getYoutubeWatchtimePackagePriceCents(qty, { quantities, pricesCents });
      const label = typeof cents === "number" ? formatEuroFromCents(cents) : "";
      return `${open}${label}${close}`;
    }
  );
}

function enhanceFaqs(html: string): string {
  if (html.includes("youtube-watchtime-faq-answer-")) return html;
  let n = 0;
  return html.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/gi,
    (_m, question: string, answer: string) => {
      n += 1;
      const answerId = `youtube-watchtime-faq-answer-${n}`;
      return `<details class="fbwt-faq-item"><summary aria-expanded="false" aria-controls="${answerId}">${question}</summary><div id="${answerId}">${answer}</div></details>`;
    }
  );
}

export function prepareYoutubeWatchtimeDescriptionHtml(
  html: string | undefined,
  product?: PriceSource
): string {
  const sourceHtml = loadYoutubeWatchtimeHtml(html);
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

export function formatWatchtimeHours(quantity: number): string {
  return `${formatQuantity(quantity)} Stunden`;
}
