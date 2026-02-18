/**
 * Typen für den Follower-Shop.
 * Ausführung der Bestellungen erfolgt extern – hier nur Speicherung & Verwaltung.
 */

export type Platform = "instagram" | "tiktok" | "youtube" | "twitter";

export type ProductType = "followers" | "likes" | "views" | "comments";

export interface Product {
  id: string;
  /** SEO-URL-Segment, z.B. "instagram-follower-kaufen" → /product/instagram-follower-kaufen */
  slug: string;
  platform: Platform;
  type: ProductType;
  name: string;
  description?: string;
  /** Menge (z.B. 1000 Follower) */
  quantity: number;
  /** Preis in Cent oder kleinster Währungsteil */
  priceCents: number;
  /** Optional: Lieferzeit in Stunden */
  estimatedDeliveryHours?: number;
  active: boolean;
  sortOrder: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  /** Snapshot des Preises zum Bestellzeitpunkt */
  priceCents: number;
  /** z.B. Instagram-Username oder Link – für die spätere Ausführung */
  targetIdentifier: string;
}

export type OrderStatus =
  | "pending"   // angelegt, noch nicht bezahlt/übergeben
  | "paid"      // bezahlt, zur Ausführung übergeben
  | "processing"// wird ausgeführt (extern)
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  createdAt: string; // ISO
  status: OrderStatus;
  items: OrderItem[];
  /** Gesamtbetrag in Cent */
  totalCents: number;
  customerEmail: string;
  customerNote?: string;
  /** Externe Referenz (z.B. dein Ausführungssystem) */
  externalId?: string;
}
