/**
 * Serverseitige Preisprüfung nur für ausgewählte Produkt-Slugs.
 * Andere Positionen behalten die bisherige Checkout-Logik.
 */
import {
  getInstagramLikesDeutschPackagePriceCents,
  isInstagramLikesDeutschProduct,
} from "@/lib/instagram-likes-deutsch-seo";
import {
  getTiktokFollowerTuerkischPackagePriceCents,
  isTiktokFollowerTuerkischProduct,
} from "@/lib/tiktok-follower-tuerkisch-seo";
import { getProductBySlug } from "@/lib/products-data";
import type { OrderItem } from "@/lib/orders";

export type AuthorizedCheckout =
  | { ok: true; items: OrderItem[]; totalCents: number }
  | { ok: false; error: string };

function needsAuthoritativePrice(slug: string): boolean {
  return isInstagramLikesDeutschProduct(slug) || isTiktokFollowerTuerkischProduct(slug);
}

function packagePriceCents(
  slug: string,
  quantity: number,
  product: { quantities?: number[]; pricesCents?: number[] }
): number | null {
  if (isInstagramLikesDeutschProduct(slug)) {
    return getInstagramLikesDeutschPackagePriceCents(quantity, product);
  }
  if (isTiktokFollowerTuerkischProduct(slug)) {
    return getTiktokFollowerTuerkischPackagePriceCents(quantity, product);
  }
  return null;
}

export async function authorizeCheckoutPrices(
  items: OrderItem[],
  clientTotalCents: number
): Promise<AuthorizedCheckout> {
  const hasLocked = items.some((item) => needsAuthoritativePrice(item.productSlug));
  if (!hasLocked) {
    const totalCents =
      clientTotalCents > 0 && Number.isFinite(clientTotalCents)
        ? clientTotalCents
        : items.reduce((sum, item) => sum + item.priceCents, 0);
    return { ok: true, items, totalCents };
  }

  const catalog = new Map<string, Awaited<ReturnType<typeof getProductBySlug>>>();
  const next: OrderItem[] = [];
  for (const item of items) {
    if (!needsAuthoritativePrice(item.productSlug)) {
      next.push(item);
      continue;
    }
    if (!catalog.has(item.productSlug)) {
      catalog.set(item.productSlug, await getProductBySlug(item.productSlug));
    }
    const product = catalog.get(item.productSlug);
    if (!product) {
      return { ok: false, error: "Produktpreis konnte nicht geprüft werden." };
    }
    const cents = packagePriceCents(item.productSlug, item.quantity, product);
    if (cents == null) {
      return { ok: false, error: "Die gewählte Menge ist für dieses Produkt nicht verfügbar." };
    }
    next.push({ ...item, priceCents: cents });
  }

  const totalCents = next.reduce((sum, item) => sum + item.priceCents, 0);
  if (totalCents <= 0) {
    return { ok: false, error: "Ungültiger Betrag." };
  }
  return { ok: true, items: next, totalCents };
}
