"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/orders-data";
import type { OrderStatus } from "@/lib/orders";

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const orderNumber = formData.get("orderNumber");
  const status = formData.get("status");
  const remarks = formData.get("remarks");

  if (typeof orderNumber !== "string" || !orderNumber.trim()) return;
  if (typeof status !== "string" || !status) return;

  const validStatuses: OrderStatus[] = [
    "pending_payment",
    "eingegangen",
    "gestartet",
    "in_ausfuehrung",
    "abgeschlossen",
  ];
  if (!validStatuses.includes(status as OrderStatus)) return;

  const updated = await updateOrderStatus(
    orderNumber.trim(),
    status as OrderStatus,
    typeof remarks === "string" ? remarks.trim() || undefined : undefined
  );

  if (!updated) return;

  revalidatePath("/admin/orders", "layout");
}
