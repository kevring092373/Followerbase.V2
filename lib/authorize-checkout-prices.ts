/**
 * Serverseitige Preisprüfung nur für FC-007 / instagram-likes-deutsch-kaufen.
 * Andere Positionen behalten die bisherige Checkout-Logik.
 */
import {
  getInstagramLikesDeutschPackagePriceCents,
  INSTAGRAM_LIKES_DEUTSCH_SLUG,
  isInstagramLikesDeutschProduct,
} from "@/lib/instagram-likes-deutsch-seo";
import { getProductBySlug } from "@/lib/products-data";
import type { OrderItem } from "@/lib/orders";

export type AuthorizedCheckout =
  | { ok: true; items: OrderItem[]; totalCents: number }
  | { ok: false; error: string };

export async function authorizeCheckoutPrices(
  items: OrderItem[],
  clientTotalCents: number
): Promise<AuthorizedCheckout> {
  const hasDeutschLikes = items.some((item) => isInstagramLikesDeutschProduct(item.productSlug));
  if (!hasDeutschLikes) {
    const totalCents =
      clientTotalCents > 0 && Number.isFinite(clientTotalCents)
        ? clientTotalCents
        : items.reduce((sum, item) => sum + item.priceCents, 0);
    return { ok: true, items, totalCents };
  }

  const product = await getProductBySlug(INSTAGRAM_LIKES_DEUTSCH_SLUG);
  if (!product) {
    return { ok: false, error: "Produktpreis konnte nicht geprüft werden." };
  }

  const next: OrderItem[] = [];
  for (const item of items) {
    if (!isInstagramLikesDeutschProduct(item.productSlug)) {
      next.push(item);
      continue;
    }
    const cents = getInstagramLikesDeutschPackagePriceCents(item.quantity, product);
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
