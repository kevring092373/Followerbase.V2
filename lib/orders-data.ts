/**
 * Bestellungen: Lesen/Schreiben aus content/orders.json.
 * Unbezahlte Vorgänge (Warenkorb/Kasse) in content/pending-checkouts.json ohne Bestellnummer.
 */
import { promises as fs } from "fs";
import path from "path";
import type { Order, OrderItem, OrderStatus, PaymentMethod } from "./orders";
import { ORDER_STATUSES } from "./orders";

export type { Order, OrderStatus, PaymentMethod } from "./orders";

const ORDERS_FILE = path.join(process.cwd(), "content", "orders.json");
const PENDING_FILE = path.join(process.cwd(), "content", "pending-checkouts.json");
const ORDER_ERRORS_FILE = path.join(process.cwd(), "content", "order-errors.json");

export interface OrderErrorRecord {
  id: string;
  paypalOrderId?: string;
  createdAt: string;
  message: string;
  totalCents?: number;
}

/** Kundendaten aus dem Checkout (für Supabase). */
export interface PendingCheckoutCustomer {
  email: string;
  name?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface PendingCheckout {
  paypalOrderId: string;
  items: OrderItem[];
  totalCents: number;
  sellerNote?: string;
  customer?: PendingCheckoutCustomer;
  createdAt: string;
}

function normalizeItem(i: unknown): OrderItem | null {
  if (!i || typeof i !== "object") return null;
  const r = i as Record<string, unknown>;
  if (typeof r.productSlug !== "string" || typeof r.productName !== "string") return null;
  if (typeof r.quantity !== "number" || typeof r.priceCents !== "number" || typeof r.target !== "string") return null;
  return {
    productSlug: r.productSlug,
    productName: r.productName,
    quantity: r.quantity,
    priceCents: r.priceCents,
    target: r.target,
  };
}

function normalizeOrder(o: Record<string, unknown>): Order {
  const orderNumber = typeof o.orderNumber === "string" ? o.orderNumber.trim() : "";
  const status = ORDER_STATUSES.includes(o.status as OrderStatus)
    ? (o.status as OrderStatus)
    : "eingegangen";
  const remarks = typeof o.remarks === "string" ? o.remarks : undefined;
  const createdAt = typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString();
  const updatedAt = typeof o.updatedAt === "string" ? o.updatedAt : undefined;
  const paymentMethod =
    o.paymentMethod === "paypal" || o.paymentMethod === "ueberweisung"
      ? (o.paymentMethod as PaymentMethod)
      : undefined;
  const paypalOrderId = typeof o.paypalOrderId === "string" ? o.paypalOrderId : undefined;
  const sellerNote = typeof o.sellerNote === "string" ? o.sellerNote : undefined;
  const totalCents =
    typeof o.totalCents === "number" && o.totalCents >= 0 ? o.totalCents : undefined;
  const items: OrderItem[] = Array.isArray(o.items)
    ? o.items.map(normalizeItem).filter((x): x is OrderItem => x !== null)
    : [];
  const customerEmail = typeof o.customerEmail === "string" ? o.customerEmail : undefined;
  const customerName = typeof o.customerName === "string" ? o.customerName : undefined;
  const customerPhone = typeof o.customerPhone === "string" ? o.customerPhone : undefined;
  const customerAddressLine1 = typeof o.customerAddressLine1 === "string" ? o.customerAddressLine1 : undefined;
  const customerAddressLine2 = typeof o.customerAddressLine2 === "string" ? o.customerAddressLine2 : undefined;
  const customerCity = typeof o.customerCity === "string" ? o.customerCity : undefined;
  const customerPostalCode = typeof o.customerPostalCode === "string" ? o.customerPostalCode : undefined;
  const customerCountry = typeof o.customerCountry === "string" ? o.customerCountry : undefined;
  return {
    orderNumber,
    status,
    remarks,
    createdAt,
    updatedAt,
    paymentMethod,
    paypalOrderId,
    sellerNote,
    totalCents,
    customerEmail,
    customerName,
    customerPhone,
    customerAddressLine1,
    customerAddressLine2,
    customerCity,
    customerPostalCode,
    customerCountry,
    items: items.length ? items : undefined,
  };
}

async function readOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.orders) ? data.orders : [];
    return list.map((o) => normalizeOrder(o as Record<string, unknown>));
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  const dir = path.dirname(ORDERS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    ORDERS_FILE,
    JSON.stringify({ orders }, null, 2),
    "utf-8"
  );
}

/** Bestellung anhand der Bestellnummer suchen (case-insensitive, Leerzeichen ignoriert). */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const normalized = orderNumber.replace(/\s/g, "").toUpperCase();
  if (!normalized) return null;
  const orders = await readOrders();
  const order = orders.find(
    (o) => o.orderNumber.replace(/\s/g, "").toUpperCase() === normalized
  );
  return order ?? null;
}

export async function getAllOrders(): Promise<Order[]> {
  const orders = await readOrders();
  return [...orders].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

/** Status einer Bestellung aktualisieren (für Admin). */
export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus,
  remarks?: string
): Promise<Order | null> {
  const orders = await readOrders();
  const normalized = orderNumber.replace(/\s/g, "").toUpperCase();
  const index = orders.findIndex(
    (o) => o.orderNumber.replace(/\s/g, "").toUpperCase() === normalized
  );
  if (index === -1) return null;
  const now = new Date().toISOString();
  orders[index] = {
    ...orders[index],
    status,
    remarks: remarks !== undefined ? remarks : orders[index].remarks,
    updatedAt: now,
  };
  await writeOrders(orders);
  return orders[index];
}

/** Nächste Bestellnummer erzeugen (FC-YYYY-NNNN). */
function nextOrderNumber(orders: Order[]): string {
  const year = new Date().getFullYear();
  const prefix = `FC-${year}-`;
  const sameYear = orders.filter((o) => o.orderNumber.startsWith(prefix));
  let max = 0;
  for (const o of sameYear) {
    const num = parseInt(o.orderNumber.slice(prefix.length), 10);
    if (!Number.isNaN(num) && num > max) max = num;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

/** Bestellung anhand PayPal-Order-ID finden (nur bezahlte Bestellungen). */
export async function getOrderByPaypalOrderId(paypalOrderId: string): Promise<Order | null> {
  const orders = await readOrders();
  return orders.find((o) => o.paypalOrderId === paypalOrderId) ?? null;
}

// ---------- Pending Checkouts (unbezahlt, keine Bestellnummer) ----------

async function readPendingCheckouts(): Promise<PendingCheckout[]> {
  try {
    const raw = await fs.readFile(PENDING_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.pending) ? data.pending : [];
    return list.map(normalizePendingCheckout);
  } catch {
    return [];
  }
}

function normalizePendingCheckoutCustomer(c: unknown): PendingCheckoutCustomer | undefined {
  if (!c || typeof c !== "object") return undefined;
  const r = c as Record<string, unknown>;
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

function normalizePendingCheckout(p: unknown): PendingCheckout {
  const r = p as Record<string, unknown>;
  const paypalOrderId = typeof r.paypalOrderId === "string" ? r.paypalOrderId : "";
  const totalCents = typeof r.totalCents === "number" && r.totalCents >= 0 ? r.totalCents : 0;
  const items: OrderItem[] = Array.isArray(r.items)
    ? (r.items as unknown[]).map((i) => normalizeItem(i)).filter((x): x is OrderItem => x !== null)
    : [];
  const sellerNote = typeof r.sellerNote === "string" ? r.sellerNote : undefined;
  const customer = normalizePendingCheckoutCustomer(r.customer);
  const createdAt =
    typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString();
  return { paypalOrderId, items, totalCents, sellerNote, customer, createdAt };
}

async function writePendingCheckouts(pending: PendingCheckout[]): Promise<void> {
  const dir = path.dirname(PENDING_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    PENDING_FILE,
    JSON.stringify({ pending }, null, 2),
    "utf-8"
  );
}

/** Unbezahlten Vorgang anlegen (Warenkorb/Kasse) – keine Bestellnummer. */
export async function addPendingCheckout(
  paypalOrderId: string,
  items: OrderItem[],
  totalCents: number,
  sellerNote?: string,
  customer?: PendingCheckoutCustomer
): Promise<void> {
  const list = await readPendingCheckouts();
  list.push({
    paypalOrderId,
    items,
    totalCents,
    sellerNote,
    customer,
    createdAt: new Date().toISOString(),
  });
  await writePendingCheckouts(list);
}

/** Alle unbezahlten Vorgänge (für Admin-Spalte). */
export async function getPendingCheckouts(): Promise<PendingCheckout[]> {
  const list = await readPendingCheckouts();
  return [...list].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

/** Pending anhand PayPal-Order-ID (für Capture). */
export async function getPendingByPaypalOrderId(
  paypalOrderId: string
): Promise<PendingCheckout | null> {
  const list = await readPendingCheckouts();
  return list.find((p) => p.paypalOrderId === paypalOrderId) ?? null;
}

/** Nach PayPal-Capture: Bestellung anlegen, Kunde in Supabase speichern, Pending entfernen. */
export async function createOrderFromPendingAndRemovePending(
  paypalOrderId: string
): Promise<Order | null> {
  const pending = await getPendingByPaypalOrderId(paypalOrderId);
  if (!pending) return null;

  if (pending.customer?.email) {
    const { createOrGetCustomer } = await import("@/lib/customers-data");
    await createOrGetCustomer({
      email: pending.customer.email,
      name: pending.customer.name ?? null,
      phone: pending.customer.phone ?? null,
      addressLine1: pending.customer.addressLine1 ?? null,
      addressLine2: pending.customer.addressLine2 ?? null,
      city: pending.customer.city ?? null,
      postalCode: pending.customer.postalCode ?? null,
      country: pending.customer.country ?? null,
    });
  }

  const orders = await readOrders();
  const orderNumber = nextOrderNumber(orders);
  const now = new Date().toISOString();
  const c = pending.customer;
  const order: Order = {
    orderNumber,
    status: "eingegangen",
    paymentMethod: "paypal",
    paypalOrderId,
    items: pending.items.length ? pending.items : undefined,
    sellerNote: pending.sellerNote,
    totalCents: pending.totalCents,
    createdAt: pending.createdAt,
    updatedAt: now,
    customerEmail: c?.email,
    customerName: c?.name ?? undefined,
    customerPhone: c?.phone ?? undefined,
    customerAddressLine1: c?.addressLine1 ?? undefined,
    customerAddressLine2: c?.addressLine2 ?? undefined,
    customerCity: c?.city ?? undefined,
    customerPostalCode: c?.postalCode ?? undefined,
    customerCountry: c?.country ?? undefined,
  };
  orders.push(order);
  await writeOrders(orders);

  const remaining = (await readPendingCheckouts()).filter((p) => p.paypalOrderId !== paypalOrderId);
  await writePendingCheckouts(remaining);

  return order;
}

/** Bestellung per Überweisung anlegen (ohne PayPal). Verwendungszweck = Bestellnummer. */
export async function createOrderForUeberweisung(
  customer: PendingCheckoutCustomer,
  items: OrderItem[],
  totalCents: number,
  sellerNote?: string
): Promise<Order> {
  if (customer.email.trim()) {
    const { createOrGetCustomer } = await import("@/lib/customers-data");
    await createOrGetCustomer({
      email: customer.email,
      name: customer.name ?? null,
      phone: customer.phone ?? null,
      addressLine1: customer.addressLine1 ?? null,
      addressLine2: customer.addressLine2 ?? null,
      city: customer.city ?? null,
      postalCode: customer.postalCode ?? null,
      country: customer.country ?? null,
    });
  }

  const orders = await readOrders();
  const orderNumber = nextOrderNumber(orders);
  const now = new Date().toISOString();
  const order: Order = {
    orderNumber,
    status: "pending_payment",
    paymentMethod: "ueberweisung",
    items: items.length ? items : undefined,
    sellerNote,
    totalCents,
    createdAt: now,
    updatedAt: now,
    customerEmail: customer.email,
    customerName: customer.name ?? undefined,
    customerPhone: customer.phone ?? undefined,
    customerAddressLine1: customer.addressLine1 ?? undefined,
    customerAddressLine2: customer.addressLine2 ?? undefined,
    customerCity: customer.city ?? undefined,
    customerPostalCode: customer.postalCode ?? undefined,
    customerCountry: customer.country ?? undefined,
  };
  orders.push(order);
  await writeOrders(orders);
  return order;
}

// ---------- Vorgänge mit Fehler (z. B. Capture fehlgeschlagen) ----------

async function readOrderErrors(): Promise<OrderErrorRecord[]> {
  try {
    const raw = await fs.readFile(ORDER_ERRORS_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.errors) ? data.errors : [];
    return list.map(normalizeOrderError);
  } catch {
    return [];
  }
}

function normalizeOrderError(e: unknown): OrderErrorRecord {
  const r = e as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : `err-${Date.now()}`;
  const paypalOrderId = typeof r.paypalOrderId === "string" ? r.paypalOrderId : undefined;
  const createdAt = typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString();
  const message = typeof r.message === "string" ? r.message : "Unbekannter Fehler";
  const totalCents =
    typeof r.totalCents === "number" && r.totalCents >= 0 ? r.totalCents : undefined;
  return { id, paypalOrderId, createdAt, message, totalCents };
}

async function writeOrderErrors(errors: OrderErrorRecord[]): Promise<void> {
  const dir = path.dirname(ORDER_ERRORS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    ORDER_ERRORS_FILE,
    JSON.stringify({ errors }, null, 2),
    "utf-8"
  );
}

/** Fehler beim Zahlungsabschluss o. Ä. speichern (für Admin-Anzeige). */
export async function addOrderError(
  message: string,
  options?: { paypalOrderId?: string; totalCents?: number }
): Promise<void> {
  const list = await readOrderErrors();
  const id = `err-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  list.push({
    id,
    paypalOrderId: options?.paypalOrderId,
    createdAt: new Date().toISOString(),
    message,
    totalCents: options?.totalCents,
  });
  await writeOrderErrors(list);
}

/** Alle gespeicherten Fehlervorgänge (neueste zuerst). */
export async function getOrderErrors(): Promise<OrderErrorRecord[]> {
  const list = await readOrderErrors();
  return [...list].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}
