/**
 * Supabase-Client für die Server-Seite (Service Role).
 * Nur in Server Components, Route Handlers und Server Actions verwenden.
 *
 * Shop/Blog-Reads: Next Data Cache mit Revalidate (schneller TTFB).
 * Schreibende Admin-Pfade: explizit no-store, damit nach Speichern sofort frisch.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Öffentliche Inhalte (Shop/Blog) – 5 Min Cache, passend zu page revalidate. */
export const SUPABASE_FETCH_REVALIDATE = 300;

if (!url || !serviceRoleKey) {
  console.warn(
    "Supabase: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local"
  );
}

function makeFetch(mode: "cached" | "fresh") {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    if (mode === "fresh") {
      return fetch(input, { ...init, cache: "no-store" });
    }
    return fetch(input, {
      ...init,
      // Explizites no-store vom Aufrufer (z. B. Admin) respektieren
      ...(init?.cache === "no-store"
        ? { cache: "no-store" as const }
        : { next: { revalidate: SUPABASE_FETCH_REVALIDATE } }),
    });
  };
}

/** Gecachte Reads für Shop, Blog, Sitemap. */
export const supabaseServer = createClient(url ?? "", serviceRoleKey ?? "", {
  auth: { persistSession: false },
  global: { fetch: makeFetch("cached") },
});

/** Frische Reads/Writes für Admin & kritische Lookups nach Mutationen. */
export const supabaseServerFresh = createClient(url ?? "", serviceRoleKey ?? "", {
  auth: { persistSession: false },
  global: { fetch: makeFetch("fresh") },
});

export function isSupabaseConfigured(): boolean {
  return Boolean(url && serviceRoleKey);
}
