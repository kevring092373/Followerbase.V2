"use server";

import { getOrderByNumber } from "@/lib/orders-data";
import type { Order } from "@/lib/orders";

export type LookupResult =
  | { ok: true; order: Order }
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
  return { ok: true, order };
}
