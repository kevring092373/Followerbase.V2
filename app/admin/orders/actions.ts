"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/orders-data";
import type { OrderStatus } from "@/lib/orders";

export type UpdateOrderStatusResult = { error?: string };

export async function updateOrderStatusAction(
  _prev: UpdateOrderStatusResult | null,
  formData: FormData
): Promise<UpdateOrderStatusResult> {
  const orderNumber = formData.get("orderNumber");
  const status = formData.get("status");
  const remarks = formData.get("remarks");

  if (typeof orderNumber !== "string" || !orderNumber.trim()) {
    return { error: "Bestellnummer fehlt." };
  }
  if (typeof status !== "string" || !status) {
    return { error: "Status fehlt." };
  }

  const validStatuses: OrderStatus[] = [
    "pending_payment",
    "eingegangen",
    "gestartet",
    "in_ausfuehrung",
    "abgeschlossen",
  ];
  if (!validStatuses.includes(status as OrderStatus)) {
    return { error: "Ungültiger Status." };
  }

  try {
    const updated = await updateOrderStatus(
      orderNumber.trim(),
      status as OrderStatus,
      typeof remarks === "string" ? remarks.trim() || undefined : undefined
    );

    if (!updated) {
      return { error: "Bestellung nicht gefunden." };
    }

    revalidatePath("/admin/orders", "layout");
    revalidatePath(`/admin/orders/${encodeURIComponent(orderNumber.trim())}`);
    return {};
  } catch (err) {
    console.error("updateOrderStatus failed:", err);
    return {
      error: "Status konnte nicht gespeichert werden. Bitte Supabase-Verbindung prüfen.",
    };
  }
}
