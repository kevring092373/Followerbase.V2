/**
 * Schlanke Umsatzpunkte für die Admin-Übersicht – ohne Kundendaten.
 */
import type { Order, OrderStatus } from "@/lib/orders";
import { getOrderAmountCents, ORDER_STATUSES } from "@/lib/orders";

export type AdminRevenuePoint = {
  createdAt: string;
  status: OrderStatus;
  amountCents: number;
};

/** Standard: bezahlte, nicht stornierte Bestellungen. */
export const DEFAULT_REVENUE_STATUSES: OrderStatus[] = [
  "eingegangen",
  "gestartet",
  "in_ausfuehrung",
  "abgeschlossen",
];

export function toAdminRevenuePoints(orders: Order[]): AdminRevenuePoint[] {
  return orders.map((order) => ({
    createdAt: order.createdAt,
    status: order.status,
    amountCents: getOrderAmountCents(order),
  }));
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value);
}
