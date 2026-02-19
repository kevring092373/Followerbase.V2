/**
 * Pending Checkouts in Supabase (unbezahlte PayPal-Vorgänge).
 * Ermöglicht Checkout auf Netlify (read-only Dateisystem).
 */
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import type { OrderItem } from "./orders";
import type { PendingCheckout, PendingCheckoutCustomer } from "./orders-data";

type PendingRow = {
  id: string;
  paypal_order_id: string;
  items: unknown;
  total_cents: number;
  seller_note: string | null;
  customer: unknown;
  created_at: string;
};

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

function rowToPending(r: PendingRow): PendingCheckout {
  return {
    paypalOrderId: r.paypal_order_id,
    items: parseItems(r.items),
    totalCents: r.total_cents,
    sellerNote: r.seller_note ?? undefined,
    customer: parseCustomer(r.customer),
    createdAt: r.created_at,
  };
}

export async function addPendingCheckoutSupabase(
  paypalOrderId: string,
  items: OrderItem[],
  totalCents: number,
  sellerNote?: string,
  customer?: PendingCheckoutCustomer
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabaseServer.from("pending_checkouts").insert({
    paypal_order_id: paypalOrderId,
    items: items,
    total_cents: totalCents,
    seller_note: sellerNote ?? null,
    customer: customer ?? null,
  });

  if (error) console.error("Supabase addPendingCheckout:", error.message);
}

export async function getPendingByPaypalOrderIdSupabase(
  paypalOrderId: string
): Promise<PendingCheckout | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabaseServer
    .from("pending_checkouts")
    .select("*")
    .eq("paypal_order_id", paypalOrderId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return rowToPending(data as PendingRow);
}

export async function removePendingByPaypalOrderIdSupabase(paypalOrderId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await supabaseServer.from("pending_checkouts").delete().eq("paypal_order_id", paypalOrderId);
}

export async function getPendingCheckoutsSupabase(): Promise<PendingCheckout[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabaseServer
    .from("pending_checkouts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getPendingCheckouts:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToPending(r as PendingRow));
}
