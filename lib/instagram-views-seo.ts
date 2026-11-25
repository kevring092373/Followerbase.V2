import { readFileSync } from "node:fs";
import path from "path";
import { PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";
import {
  INSTAGRAM_VIEWS_CANONICAL_SLUG,
  INSTAGRAM_VIEWS_LEGACY_SLUG,
} from "@/lib/product-page-titles";

export const INSTAGRAM_VIEWS_SLUG = INSTAGRAM_VIEWS_CANONICAL_SLUG;
export const INSTAGRAM_VIEWS_TITLE = "Instagram Views kaufen ab 0,45 € | Followerbase";
export const INSTAGRAM_VIEWS_DESCRIPTION =
  "Instagram Views kaufen ab 0,45 € für 500 Stück bei Followerbase: Drip-Feed Lieferung, kein Passwort nötig, 30-Tage-Nachfüllgarantie, für Reels und Videos.";
export const INSTAGRAM_VIEWS_H1 = "Instagram Views kaufen";
export const INSTAGRAM_VIEWS_SUBLINE =
  "Mehr Reichweite für deine Reels und Videos, ab 0,45 € für 500 Views. Drip-Feed, kein Passwort.";
export const INSTAGRAM_VIEWS_HTML_FILE = "content/product-html/instagram-views-kaufen.html";

export function isInstagramViewsProduct(slug: string): boolean {
  return slug === INSTAGRAM_VIEWS_CANONICAL_SLUG || slug === INSTAGRAM_VIEWS_LEGACY_SLUG;
}

export function loadInstagramViewsHtml(fallback?: string): string {
  try {
    return readFileSync(path.join(process.cwd(), INSTAGRAM_VIEWS_HTML_FILE), "utf8");
  } catch {
    return fallback ?? "";
  }
}

export function prepareInstagramViewsDescriptionHtml(fallback?: string): string {
  const html = loadInstagramViewsHtml(fallback);
  return html.replaceAll("#produkt-auswahl", `#${PRODUCT_ORDER_ANCHOR_ID}`);
}
