/**
 * Technische SEO-Angaben nur für /product/youtube-views-kaufen.
 * Produktfließtext bleibt unangetastet; hier werden Markup, CTA und FAQ-Blöcke bereinigt.
 */
import { htmlToPlainText } from "@/lib/product-seo";

export const YOUTUBE_VIEWS_SLUG = "youtube-views-kaufen";

export const YOUTUBE_VIEWS_TITLE =
  "YouTube Views kaufen: 1.000 Aufrufe ab 5,23 €";

export const YOUTUBE_VIEWS_DESCRIPTION =
  "YouTube Views kaufen: 1.000–25.000 Aufrufe, Lieferung in 1–5 Tagen und kein Passwort nötig. Pakete, Preise und Bedingungen transparent ansehen.";

export const YOUTUBE_VIEWS_IMAGE = "/icons/youtube-views-kaufen.webp";

export const YOUTUBE_VIEWS_IMAGE_ALT =
  "YouTube Views kaufen – verfügbare Aufruf-Pakete";

export const YOUTUBE_VIEWS_ORDER_ID = "produkt-auswahl";

const PROBLEMATIC_FAQ_QUESTIONS = [
  "erkennt youtube gekaufte views",
  "zählen gekaufte views zur watchtime",
];

const PROBLEMATIC_FAQ_CLAIM =
  /4\.?000\s*-?\s*stunden|watchtime[- ]ziel|monetarisierung ermöglichen|algorithmus verbessern|nicht erkannt werden|garantiert dauerhaft|zählen zum 4/i;

function isProblematicYoutubeViewsFaq(block: string): boolean {
  const text = htmlToPlainText(block).toLowerCase();
  if (!text) return false;
  if (PROBLEMATIC_FAQ_QUESTIONS.some((q) => text.includes(q))) return true;
  return PROBLEMATIC_FAQ_CLAIM.test(text);
}

/** Entfernt FAQ-Blöcke mit unzulässigen Garantie-Aussagen. */
export function stripProblematicYoutubeViewsFaqs(html: string): string {
  if (!html) return html;
  return html.replace(
    /<(div|details)\b([^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi,
    (block) => (isProblematicYoutubeViewsFaq(block) ? "" : block)
  );
}

function rewriteCtaHref(html: string): string {
  const target = `$1#${YOUTUBE_VIEWS_ORDER_ID}$2`;
  return html
    .replace(
      /(<a\b[^>]*class=["'][^"']*\bcta-button\b[^"']*["'][^>]*\bhref=["'])[^"']*(["'])/gi,
      target
    )
    .replace(
      /(<a\b[^>]*\bhref=["'])[^"']*(["'][^>]*class=["'][^"']*\bcta-button\b[^"']*["'])/gi,
      target
    );
}

function wrapOverflowTables(html: string): string {
  if (html.includes("table-scroll-wrap")) return html;
  return html.replace(
    /<table\b[^>]*class=["'][^"']*\bdata-table\b[^"']*["'][^>]*>[\s\S]*?<\/table>/gi,
    (table) =>
      `<div class="table-scroll-wrap"><p class="table-scroll-hint">Tabelle seitlich scrollen, um alle Spalten zu sehen</p><div class="table-scroll">${table}</div></div>`
  );
}

function faqsToDetails(html: string): string {
  return html.replace(
    /<div\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>\s*<button\b[^>]*>([\s\S]*?)<\/button>\s*<div\b[^>]*class=["'][^"']*\bfaq-answer\b[^"']*["'][^>]*>\s*(?:<div\b[^>]*class=["'][^"']*\bfaq-answer-inner\b[^"']*["'][^>]*>)?([\s\S]*?)(?:<\/div>\s*)?<\/div>\s*<\/div>/gi,
    (_m, question: string, answer: string) =>
      `<details class="faq-item"><summary class="faq-question">${question}</summary><div class="faq-answer"><div class="faq-answer-inner">${answer}</div></div></details>`
  );
}

const DETAILS_FAQ_CSS = `
details.faq-item .faq-answer,
details.faq-item[open] .faq-answer { max-height: none; overflow: visible; }
details.faq-item summary.faq-question { list-style: none; }
details.faq-item summary.faq-question::-webkit-details-marker { display: none; }
.table-scroll-wrap { margin: 1.5rem 0; max-width: 100%; }
.table-scroll-hint { display: none; font-size: 0.82rem; color: var(--text-muted); margin: 0 0 0.5rem; }
.table-scroll { width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
@media (max-width: 768px) {
  .table-scroll-hint { display: block; }
  .table-scroll { overscroll-behavior-x: contain; }
}
`;

function ensureFaqAndTableCss(html: string): string {
  if (html.includes("details.faq-item .faq-answer")) return html;
  if (!html.includes("</style>")) return html;
  return html.replace("</style>", `${DETAILS_FAQ_CSS}</style>`);
}

/**
 * Technische Bereinigung der Views-Beschreibung: CTA-Anker, FAQ-Garantie-Blöcke,
 * Details-Markup (ohne JS nutzbar) und horizontaler Tabellen-Scroll.
 * Der Fließtext wird nicht umgeschrieben.
 */
export function prepareYoutubeViewsDescriptionHtml(html: string | undefined): string {
  if (!html) return "";
  let out = html;
  out = stripProblematicYoutubeViewsFaqs(out);
  out = rewriteCtaHref(out);
  out = wrapOverflowTables(out);
  out = faqsToDetails(out);
  out = ensureFaqAndTableCss(out);
  return out;
}

export function isYoutubeViewsProduct(slug: string): boolean {
  return slug === YOUTUBE_VIEWS_SLUG;
}
