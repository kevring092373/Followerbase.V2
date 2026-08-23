/**
 * Zentrale SEO-Helfer für Produktseiten: Preise, FAQ-Extraktion, Canonical-Pfad.
 * Keine erfundenen Preise, Bewertungen oder Verfügbarkeiten.
 */
import { canonicalUrl } from "@/lib/seo";

export type ProductPriceSource = {
  quantities?: number[];
  pricesCents: number[];
  tiers?: { name?: string; quantities?: number[]; pricesCents: number[] }[];
};

export type ProductPriceStats = {
  pricesCents: number[];
  lowCents: number | null;
  highCents: number | null;
  offerCount: number;
};

export type ProductFaq = {
  question: string;
  answer: string;
};

export type ProductPackageOffer = {
  quantity: number;
  priceCents: number;
  variantName?: string;
};

/** Sichtbare Standardpakete (ohne individuellen Slider). */
export function getProductPackages(product: ProductPriceSource): ProductPackageOffer[] {
  const packages: ProductPackageOffer[] = [];
  if (product.tiers?.length) {
    for (const tier of product.tiers) {
      const quantities = Array.isArray(tier.quantities) ? tier.quantities : [];
      for (let i = 0; i < tier.pricesCents.length; i++) {
        const priceCents = tier.pricesCents[i];
        const quantity = quantities[i];
        if (typeof priceCents !== "number" || !Number.isFinite(priceCents) || priceCents < 0) continue;
        packages.push({
          quantity: typeof quantity === "number" ? quantity : i + 1,
          priceCents,
          variantName: tier.name,
        });
      }
    }
    return packages;
  }

  const quantities = product.quantities;
  const prices = product.pricesCents;
  if (!Array.isArray(prices)) return packages;
  for (let i = 0; i < prices.length; i++) {
    const priceCents = prices[i];
    if (typeof priceCents !== "number" || !Number.isFinite(priceCents) || priceCents < 0) continue;
    packages.push({
      quantity: Array.isArray(quantities) && typeof quantities[i] === "number" ? quantities[i] : i + 1,
      priceCents,
    });
  }
  return packages;
}

/** Alle sichtbaren Paketpreise (Standardliste oder alle Varianten). */
export function getProductPriceStats(product: ProductPriceSource): ProductPriceStats {
  const collected: number[] = [];
  const sources = product.tiers?.length
    ? product.tiers.map((t) => t.pricesCents)
    : [product.pricesCents];

  for (const list of sources) {
    if (!Array.isArray(list)) continue;
    for (const value of list) {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        collected.push(value);
      }
    }
  }

  if (collected.length === 0) {
    return { pricesCents: [], lowCents: null, highCents: null, offerCount: 0 };
  }

  return {
    pricesCents: collected,
    lowCents: Math.min(...collected),
    highCents: Math.max(...collected),
    offerCount: collected.length,
  };
}

export function formatSchemaPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function productCanonicalUrl(slug: string): string {
  const clean = slug.trim().replace(/^\/+/, "").split("?")[0].split("#")[0];
  return canonicalUrl(`/product/${clean}`);
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sichtbare FAQ-Paare aus der Produktbeschreibung.
 * Nur vorhandene faq-item / details-Blöcke – keine zusätzlichen SEO-Fragen.
 */
export function extractProductFaqs(html: string | undefined): ProductFaq[] {
  if (!html || !html.trim()) return [];

  const pairs: ProductFaq[] = [];
  const seen = new Set<string>();

  const add = (questionHtml: string, answerHtml: string) => {
    const question = htmlToPlainText(questionHtml);
    const answer = htmlToPlainText(answerHtml);
    if (!question || !answer) return;
    const key = question.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ question, answer });
  };

  const detailsRe =
    /<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let match: RegExpExecArray | null;
  while ((match = detailsRe.exec(html)) !== null) {
    add(match[1], match[2]);
  }

  const faqRe =
    /<(?:div|details)\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>\s*<(?:button|summary)\b[^>]*>([\s\S]*?)<\/(?:button|summary)>\s*<div\b[^>]*class=["'][^"']*\bfaq-answer\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/(?:div|details)>/gi;
  while ((match = faqRe.exec(html)) !== null) {
    add(match[1], match[2]);
  }

  return pairs;
}
