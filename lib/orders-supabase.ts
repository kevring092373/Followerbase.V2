/**
 * Bestellungen in Supabase (orders + order_items).
 * Wird von orders-data.ts genutzt, wenn Supabase konfiguriert ist.
 */
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatus, PaymentMethod } from "./orders";
import { ORDER_STATUSES } from "./orders";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  remarks: string | null;
  payment_method: string | null;
  paypal_order_id: string | null;
  seller_note: string | null;
  total_cents: number | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address_line1: string | null;
  customer_address_line2: string | null;
  customer_city: string | null;
  customer_postal_code: string | null;
  customer_country: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  price_cents: number;
  target: string;
};

function rowToOrder(row: OrderRow, items: OrderItem[]): Order {
  const status = ORDER_STATUSES.includes(row.status as OrderStatus)
    ? (row.status as OrderStatus)
    : "eingegangen";
  const paymentMethod: PaymentMethod | undefined =
    row.payment_method === "paypal" ||
    row.payment_method === "ueberweisung" ||
    row.payment_method === "viva"
      ? (row.payment_method as PaymentMethod)
      : undefined;
  return {
    orderNumber: row.order_number,
    status,
    remarks: row.remarks ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paymentMethod,
    paypalOrderId: row.paypal_order_id ?? undefined,
    sellerNote: row.seller_note ?? undefined,
    totalCents: row.total_cents ?? undefined,
    customerEmail: row.customer_email ?? undefined,
    customerName: row.customer_name ?? undefined,
    customerPhone: row.customer_phone ?? undefined,
    customerAddressLine1: row.customer_address_line1 ?? undefined,
    customerAddressLine2: row.customer_address_line2 ?? undefined,
    customerCity: row.customer_city ?? undefined,
    customerPostalCode: row.customer_postal_code ?? undefined,
    customerCountry: row.customer_country ?? undefined,
    items: items.length ? items : undefined,
  };
}

function itemRowToItem(r: OrderItemRow): OrderItem {
  return {
    productSlug: r.product_slug,
    productName: r.product_name,
    quantity: r.quantity,
    priceCents: r.price_cents,
    target: r.target,
  };
}

function normalizeOrderNumber(s: string): string {
  return s.replace(/\s/g, "").toUpperCase();
}

/** Einzelne Bestellung per Bestellnummer (direkt per DB-Abfrage). */
async function getOrderByNumberDirectSupabase(orderNumber: string): Promise<Order | null> {
  const trimmed = orderNumber?.trim();
  if (!trimmed) return null;

  const { data: orderRow, error: orderError } = await supabaseServer
    .from("orders")
    .select("*")
    .eq("order_number", trimmed)
    .limit(1)
    .maybeSingle();

  if (orderError || !orderRow) return null;

  const r = orderRow as OrderRow;
  const { data: itemRows } = await supabaseServer
    .from("order_items")
    .select("*")
    .eq("order_id", r.id)
    .order("created_at", { ascending: true });
  const items: OrderItem[] = (itemRows ?? []).map((i) => itemRowToItem(i as OrderItemRow));
  return rowToOrder(r, items);
}

export async function getOrderByNumberSupabase(orderNumber: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;
  const normalized = normalizeOrderNumber(orderNumber);
  if (!normalized) return null;

  const byExact = await getOrderByNumberDirectSupabase(orderNumber);
  if (byExact && normalizeOrderNumber(byExact.orderNumber) === normalized) return byExact;

  const all = await getAllOrdersSupabase();
  const order = all.find((o) => normalizeOrderNumber(o.orderNumber) === normalized);
  return order ?? null;
}

export async function getAllOrdersSupabase(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const { data: rows, error } = await supabaseServer
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getAllOrders:", error.message);
    return [];
  }

  const orders: Order[] = [];
  for (const row of rows ?? []) {
    const r = row as OrderRow;
    const { data: itemRows } = await supabaseServer
      .from("order_items")
      .select("*")
      .eq("order_id", r.id)
      .order("created_at", { ascending: true });
    const items: OrderItem[] = (itemRows ?? []).map((item) => itemRowToItem(item as OrderItemRow));
    orders.push(rowToOrder(r, items));
  }
  return orders;
}

export async function updateOrderStatusSupabase(
  orderNumber: string,
  status: OrderStatus,
  remarks?: string
): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;
  const trimmed = orderNumber.trim();
  if (!trimmed) return null;

  const { data: row, error: findError } = await supabaseServer
    .from("orders")
    .select("id, order_number")
    .eq("order_number", trimmed)
    .maybeSingle();

  if (findError) {
    console.error("Supabase updateOrderStatus find:", findError.message);
    return null;
  }
  if (!row) return null;

  const id = (row as { id: string; order_number: string }).id;
  const updatePayload: Record<string, unknown> = { status };
  if (remarks !== undefined) updatePayload.remarks = remarks || null;

  const { error: updateError } = await supabaseServer
    .from("orders")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    console.error("Supabase updateOrderStatus update:", updateError.message);
    return null;
  }

  return getOrderByNumberDirectSupabase(trimmed);
}

export async function getOrderByPaypalOrderIdSupabase(paypalOrderId: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;

  const { data: row, error } = await supabaseServer
    .from("orders")
    .select("*")
    .eq("paypal_order_id", paypalOrderId)
    .limit(1)
    .maybeSingle();

  if (error || !row) return null;
  return getOrderByNumberSupabase((row as OrderRow).order_number);
}

/** Nächste Bestellnummer FB-2026-NNNN (Counter startet bei 3629). */
const ORDER_NUMBER_YEAR = 2026;
const ORDER_NUMBER_START = 3629;

async function getNextOrderNumberSupabase(): Promise<string> {
  const prefix = `FB-${ORDER_NUMBER_YEAR}-`;

  const { data: rows, error } = await supabaseServer
    .from("orders")
    .select("order_number")
    .like("order_number", `${prefix}%`)
    .order("order_number", { ascending: false })
    .limit(1);

  if (error || !rows?.length) return `${prefix}${String(ORDER_NUMBER_START).padStart(4, "0")}`;

  const last = (rows[0] as { order_number: string }).order_number;
  const num = parseInt(last.slice(prefix.length), 10);
  const next = Number.isNaN(num) ? ORDER_NUMBER_START : num + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function insertOrderSupabase(order: Order): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { data: inserted, error: orderError } = await supabaseServer
    .from("orders")
    .insert({
      order_number: order.orderNumber,
      status: order.status,
      remarks: order.remarks ?? null,
      payment_method: order.paymentMethod ?? null,
      paypal_order_id: order.paypalOrderId ?? null,
      seller_note: order.sellerNote ?? null,
      total_cents: order.totalCents ?? null,
      customer_email: order.customerEmail ?? null,
      customer_name: order.customerName ?? null,
      customer_phone: order.customerPhone ?? null,
      customer_address_line1: order.customerAddressLine1 ?? null,
      customer_address_line2: order.customerAddressLine2 ?? null,
      customer_city: order.customerCity ?? null,
      customer_postal_code: order.customerPostalCode ?? null,
      customer_country: order.customerCountry ?? null,
    })
    .select("id")
    .single();

  if (orderError || !inserted) {
    console.error("Supabase insertOrder:", orderError?.message);
    return false;
  }

  const orderId = (inserted as { id: string }).id;
  if (order.items?.length) {
    const itemRows = order.items.map((item) => ({
      order_id: orderId,
      product_slug: item.productSlug,
      product_name: item.productName,
      quantity: item.quantity,
      price_cents: item.priceCents,
      target: item.target,
    }));
    const { error: itemsError } = await supabaseServer.from("order_items").insert(itemRows);
    if (itemsError) {
      console.error("Supabase order_items insert:", itemsError.message);
    }
  }

  return true;
}

/** Bestellung anlegen (orderNumber wird automatisch vergeben). */
export async function createOrderAndGetSupabase(
  order: Omit<Order, "orderNumber"> & { orderNumber?: string }
): Promise<Order | null> {
  const nextNumber = await getNextOrderNumberSupabase();
  const orderWithNumber: Order = {
    ...order,
    orderNumber: nextNumber,
  };
  const ok = await insertOrderSupabase(orderWithNumber);
  return ok ? orderWithNumber : null;
}
