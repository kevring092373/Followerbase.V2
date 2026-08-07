/**
 * Supabase-Client für die Server-Seite (Service Role).
 * Nur in Server Components, Route Handlers und Server Actions verwenden.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn(
    "Supabase: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local"
  );
}

export const supabaseServer = createClient(url ?? "", serviceRoleKey ?? "", {
  auth: { persistSession: false },
  // Next.js 14 cached fetch by default – ohne no-store bleiben leere Blog-Lookups als 404 hängen.
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" }),
  },
});

export function isSupabaseConfigured(): boolean {
  return Boolean(url && serviceRoleKey);
}
