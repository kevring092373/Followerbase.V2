/**
 * Viva-Pending-Checkouts (unbezahlte Karten-Zahlungen).
 * Auf Netlify: Supabase (read-only Dateisystem). Lokal ohne Supabase: content/viva-pending.json.
 */
import { promises as fs } from "fs";
import path from "path";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  addVivaPendingSupabase,
  getVivaPendingByOrderCodeSupabase,
  removeVivaPendingByOrderCodeSupabase,
} from "./viva-pending-supabase";
import type { OrderItem } from "./orders";
import type { PendingCheckoutCustomer } from "./orders-data";

const VIVA_PENDING_FILE = path.join(process.cwd(), "content", "viva-pending.json");

export interface VivaPendingCheckout {
  vivaOrderCode: number;
  items: OrderItem[];
  totalCents: number;
  sellerNote?: string;
  customer?: PendingCheckoutCustomer;
  createdAt: string;
}

async function readVivaPending(): Promise<VivaPendingCheckout[]> {
  try {
    const raw = await fs.readFile(VIVA_PENDING_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.pending) ? data.pending : [];
    return list.filter(
      (p: unknown): p is VivaPendingCheckout =>
        p != null &&
        typeof p === "object" &&
        typeof (p as VivaPendingCheckout).vivaOrderCode === "number"
    );
  } catch {
    return [];
  }
}

async function writeVivaPending(pending: VivaPendingCheckout[]): Promise<void> {
  const dir = path.dirname(VIVA_PENDING_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    VIVA_PENDING_FILE,
    JSON.stringify({ pending }, null, 2),
    "utf-8"
  );
}

export async function addVivaPending(
  vivaOrderCode: number,
  items: OrderItem[],
  totalCents: number,
  sellerNote?: string,
  customer?: PendingCheckoutCustomer
): Promise<void> {
  if (isSupabaseConfigured()) {
    await addVivaPendingSupabase(vivaOrderCode, items, totalCents, sellerNote, customer);
    return;
  }
  const list = await readVivaPending();
  list.push({
    vivaOrderCode,
    items,
    totalCents,
    sellerNote,
    customer,
    createdAt: new Date().toISOString(),
  });
  await writeVivaPending(list);
}

export async function getVivaPendingByOrderCode(
  vivaOrderCode: number
): Promise<VivaPendingCheckout | null> {
  if (isSupabaseConfigured()) {
    return getVivaPendingByOrderCodeSupabase(vivaOrderCode);
  }
  const list = await readVivaPending();
  return list.find((p) => p.vivaOrderCode === vivaOrderCode) ?? null;
}

export async function removeVivaPendingByOrderCode(
  vivaOrderCode: number
): Promise<void> {
  if (isSupabaseConfigured()) {
    await removeVivaPendingByOrderCodeSupabase(vivaOrderCode);
    return;
  }
  const list = await readVivaPending();
  const filtered = list.filter((p) => p.vivaOrderCode !== vivaOrderCode);
  await writeVivaPending(filtered);
}
