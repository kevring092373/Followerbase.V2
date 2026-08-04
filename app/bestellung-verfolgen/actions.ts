"use server";

import { getOrderByNumber } from "@/lib/orders-data";
import type { OrderTrackingInfo } from "@/lib/orders";

export type LookupResult =
  | { ok: true; order: OrderTrackingInfo }
  | { ok: false; error: string };

export async function lookupOrder(orderNumber: string): Promise<LookupResult> {
  const trimmed = orderNumber?.trim() ?? "";
  if (!trimmed) {
    return { ok: false, error: "Bitte gib eine Bestellnummer ein." };
  }
  const order = await getOrderByNumber(trimmed);
  if (!order) {
    return { ok: false, error: "Zu dieser Bestellnummer wurde keine Bestellung gefunden." };
  }
  // Nur Nummer und Status herausgeben – siehe OrderTrackingInfo.
  return {
    ok: true,
    order: { orderNumber: order.orderNumber, status: order.status },
  };
}
