/**
 * Viva-Pending-Checkouts in Supabase (für Netlify read-only Dateisystem).
 */
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import type { OrderItem } from "./orders";
import type { PendingCheckoutCustomer } from "./orders-data";

function parseItems(val: unknown): OrderItem[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter(
      (i): i is OrderItem =>
        i != null &&
        typeof i === "object" &&
        typeof (i as OrderItem).productSlug === "string" &&
        typeof (i as OrderItem).productName === "string" &&
        typeof (i as OrderItem).quantity === "number" &&
        typeof (i as OrderItem).priceCents === "number" &&
        typeof (i as OrderItem).target === "string"
    )
    .map((i) => ({
      productSlug: i.productSlug,
      productName: i.productName,
      quantity: i.quantity,
      priceCents: i.priceCents,
      target: i.target,
    }));
}

function parseCustomer(val: unknown): PendingCheckoutCustomer | undefined {
  if (!val || typeof val !== "object") return undefined;
  const r = val as Record<string, unknown>;
  const email = typeof r.email === "string" ? r.email.trim() : "";
  if (!email) return undefined;
  return {
    email,
    name: typeof r.name === "string" ? r.name : undefined,
    phone: typeof r.phone === "string" ? r.phone : undefined,
    addressLine1: typeof r.addressLine1 === "string" ? r.addressLine1 : undefined,
    addressLine2: typeof r.addressLine2 === "string" ? r.addressLine2 : undefined,
    city: typeof r.city === "string" ? r.city : undefined,
    postalCode: typeof r.postalCode === "string" ? r.postalCode : undefined,
    country: typeof r.country === "string" ? r.country : undefined,
  };
}

export async function addVivaPendingSupabase(
  vivaOrderCode: number,
  items: OrderItem[],
  totalCents: number,
  sellerNote?: string,
  customer?: PendingCheckoutCustomer
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabaseServer.from("viva_pending_checkouts").insert({
    viva_order_code: vivaOrderCode,
    items,
    total_cents: totalCents,
    seller_note: sellerNote ?? null,
    customer: customer ?? null,
  });

  if (error) console.error("Supabase addVivaPending:", error.message);
}

export async function getVivaPendingByOrderCodeSupabase(
  vivaOrderCode: number
): Promise<{
  vivaOrderCode: number;
  items: OrderItem[];
  totalCents: number;
  sellerNote?: string;
  customer?: PendingCheckoutCustomer;
  createdAt: string;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabaseServer
    .from("viva_pending_checkouts")
    .select("*")
    .eq("viva_order_code", vivaOrderCode)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as {
    viva_order_code: number;
    items: unknown;
    total_cents: number;
    seller_note: string | null;
    customer: unknown;
    created_at: string;
  };
  return {
    vivaOrderCode: row.viva_order_code,
    items: parseItems(row.items),
    totalCents: row.total_cents,
    sellerNote: row.seller_note ?? undefined,
    customer: parseCustomer(row.customer),
    createdAt: row.created_at,
  };
}

export async function removeVivaPendingByOrderCodeSupabase(
  vivaOrderCode: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await supabaseServer
    .from("viva_pending_checkouts")
    .delete()
    .eq("viva_order_code", vivaOrderCode);
}
