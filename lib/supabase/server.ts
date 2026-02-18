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
});

export function isSupabaseConfigured(): boolean {
  return Boolean(url && serviceRoleKey);
}
