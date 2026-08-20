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
import { asVivaOrderCode } from "./viva-server";
import type { OrderItem } from "./orders";
import type { PendingCheckoutCustomer } from "./orders-data";

const VIVA_PENDING_FILE = path.join(process.cwd(), "content", "viva-pending.json");

export interface VivaPendingCheckout {
  vivaOrderCode: string;
  items: OrderItem[];
  totalCents: number;
  sellerNote?: string;
  customer?: PendingCheckoutCustomer;
  createdAt: string;
}

function normalizePending(p: unknown): VivaPendingCheckout | null {
  if (!p || typeof p !== "object") return null;
  const row = p as Record<string, unknown>;
  const vivaOrderCode = asVivaOrderCode(row.vivaOrderCode);
  if (!vivaOrderCode) return null;
  return {
    vivaOrderCode,
    items: Array.isArray(row.items) ? (row.items as OrderItem[]) : [],
    totalCents: typeof row.totalCents === "number" ? row.totalCents : 0,
    sellerNote: typeof row.sellerNote === "string" ? row.sellerNote : undefined,
    customer: row.customer as PendingCheckoutCustomer | undefined,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
  };
}

async function readVivaPending(): Promise<VivaPendingCheckout[]> {
  try {
    const raw = await fs.readFile(VIVA_PENDING_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list: unknown[] = Array.isArray(data.pending) ? data.pending : [];
    return list.map(normalizePending).filter((p): p is VivaPendingCheckout => p !== null);
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

/** Gibt bei Supabase true zurück, wenn der Pending gespeichert wurde; sonst immer true (Datei). */
export async function addVivaPending(
  vivaOrderCode: string,
  items: OrderItem[],
  totalCents: number,
  sellerNote?: string,
  customer?: PendingCheckoutCustomer
): Promise<boolean> {
  const code = asVivaOrderCode(vivaOrderCode);
  if (!code) return false;
  if (isSupabaseConfigured()) {
    return addVivaPendingSupabase(code, items, totalCents, sellerNote, customer);
  }
  const list = await readVivaPending();
  list.push({
    vivaOrderCode: code,
    items,
    totalCents,
    sellerNote,
    customer,
    createdAt: new Date().toISOString(),
  });
  await writeVivaPending(list);
  return true;
}

export async function getVivaPendingByOrderCode(
  vivaOrderCode: string
): Promise<VivaPendingCheckout | null> {
  const code = asVivaOrderCode(vivaOrderCode);
  if (!code) return null;
  if (isSupabaseConfigured()) {
    return getVivaPendingByOrderCodeSupabase(code);
  }
  const list = await readVivaPending();
  return list.find((p) => p.vivaOrderCode === code) ?? null;
}

export async function removeVivaPendingByOrderCode(
  vivaOrderCode: string
): Promise<void> {
  const code = asVivaOrderCode(vivaOrderCode);
  if (!code) return;
  if (isSupabaseConfigured()) {
    await removeVivaPendingByOrderCodeSupabase(code);
    return;
  }
  const list = await readVivaPending();
  const filtered = list.filter((p) => p.vivaOrderCode !== code);
  await writeVivaPending(filtered);
}
