/**
 * Kundendaten über Supabase.
 * Tabellen: customers (siehe supabase/schema.sql).
 */
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";

export interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInsert {
  email: string;
  name?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface CustomerUpdate {
  name?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

function rowToCustomer(r: Record<string, unknown>): Customer {
  return {
    id: r.id as string,
    email: r.email as string,
    name: (r.name as string) ?? null,
    phone: (r.phone as string) ?? null,
    addressLine1: (r.address_line1 as string) ?? null,
    addressLine2: (r.address_line2 as string) ?? null,
    city: (r.city as string) ?? null,
    postalCode: (r.postal_code as string) ?? null,
    country: (r.country as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

/** Alle Kunden (neueste zuerst). */
export async function getCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabaseServer
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase getCustomers:", error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => rowToCustomer(r));
}

/** Kunde anhand E-Mail (case-insensitive). */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  if (!isSupabaseConfigured()) return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const { data, error } = await supabaseServer
    .from("customers")
    .select("*")
    .ilike("email", normalized)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("Supabase getCustomerByEmail:", error.message);
    return null;
  }
  return data ? rowToCustomer(data as Record<string, unknown>) : null;
}

/** Kunde anhand ID. */
export async function getCustomerById(id: string): Promise<Customer | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabaseServer
    .from("customers")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("Supabase getCustomerById:", error.message);
    return null;
  }
  return data ? rowToCustomer(data as Record<string, unknown>) : null;
}

/** Kunde anlegen oder bestehenden zurückgeben (upsert anhand E-Mail). */
export async function createOrGetCustomer(input: CustomerInsert): Promise<Customer | null> {
  if (!isSupabaseConfigured()) return null;
  const email = input.email.trim();
  if (!email) return null;

  const existing = await getCustomerByEmail(email);
  if (existing) return existing;

  const { data, error } = await supabaseServer
    .from("customers")
    .insert({
      email: email.toLowerCase(),
      name: input.name ?? null,
      phone: input.phone ?? null,
      address_line1: input.addressLine1 ?? null,
      address_line2: input.addressLine2 ?? null,
      city: input.city ?? null,
      postal_code: input.postalCode ?? null,
      country: input.country ?? null,
    })
    .select()
    .single();
  if (error) {
    console.error("Supabase createOrGetCustomer:", error.message);
    return null;
  }
  return data ? rowToCustomer(data as Record<string, unknown>) : null;
}

/** Kunde aktualisieren. */
export async function updateCustomer(id: string, input: CustomerUpdate): Promise<Customer | null> {
  if (!isSupabaseConfigured()) return null;
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.addressLine1 !== undefined) payload.address_line1 = input.addressLine1;
  if (input.addressLine2 !== undefined) payload.address_line2 = input.addressLine2;
  if (input.city !== undefined) payload.city = input.city;
  if (input.postalCode !== undefined) payload.postal_code = input.postalCode;
  if (input.country !== undefined) payload.country = input.country;
  if (Object.keys(payload).length === 0) return getCustomerById(id);

  const { data, error } = await supabaseServer
    .from("customers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Supabase updateCustomer:", error.message);
    return null;
  }
  return data ? rowToCustomer(data as Record<string, unknown>) : null;
}
