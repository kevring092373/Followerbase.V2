/**
 * Produkte in Supabase (für Netlify read-only Dateisystem).
 * Wenn die Tabelle leer ist, wird einmalig aus content/products.json gelesen und eingespielt.
 */
import { promises as fs } from "fs";
import path from "path";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Product, ProductTier } from "./products-data";

const PRODUCTS_FILE = path.join(process.cwd(), "content", "products.json");

type ProductRow = {
  slug: string;
  name: string;
  category_id: string;
  quantities: number[];
  prices_cents: number[];
  tiers: unknown;
  article_number: string | null;
  bullets: unknown;
  description: string | null;
  image: string | null;
  meta_title: string | null;
  meta_description: string | null;
};

function rowToProduct(r: ProductRow): Product {
  const quantities = Array.isArray(r.quantities) ? r.quantities : [];
  const pricesCents = Array.isArray(r.prices_cents) ? r.prices_cents : [];
  let tiers: Product["tiers"];
  if (r.tiers && Array.isArray(r.tiers)) {
    tiers = (r.tiers as ProductTier[]).filter(
      (t) => t && t.id && t.name && Array.isArray(t.quantities) && Array.isArray(t.pricesCents)
    );
    if (tiers.length === 0) tiers = undefined;
  }
  return {
    slug: r.slug,
    name: r.name,
    categoryId: r.category_id,
    quantities,
    pricesCents,
    tiers,
    articleNumber: r.article_number ?? undefined,
    bullets: Array.isArray(r.bullets) ? (r.bullets as string[]) : undefined,
    description: r.description ?? undefined,
    image: r.image ?? undefined,
    metaTitle: r.meta_title ?? undefined,
    metaDescription: r.meta_description ?? undefined,
  };
}

function productToRow(p: Product): Record<string, unknown> {
  return {
    slug: p.slug,
    name: p.name,
    category_id: p.categoryId,
    quantities: p.quantities,
    prices_cents: p.pricesCents,
    tiers: p.tiers ?? null,
    article_number: p.articleNumber ?? null,
    bullets: p.bullets ?? null,
    description: p.description ?? null,
    image: p.image ?? null,
    meta_title: p.metaTitle ?? null,
    meta_description: p.metaDescription ?? null,
  };
}

async function seedFromFileIfNeeded(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { count } = await supabaseServer.from("products").select("*", { count: "exact", head: true });
  if (count != null && count > 0) return;
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, "utf-8");
    const data = JSON.parse(raw) as { products?: Record<string, unknown>[] };
    const list = Array.isArray(data.products) ? data.products : [];
    if (list.length === 0) return;
    const rows = list.map((p) => {
      const slug = typeof p.slug === "string" ? p.slug : "";
      const name = typeof p.name === "string" ? p.name : "";
      const categoryId = typeof p.categoryId === "string" ? p.categoryId : "";
      const quantities = Array.isArray(p.quantities) ? p.quantities : [];
      const pricesCents = Array.isArray(p.pricesCents) ? p.pricesCents : [];
      return {
        slug,
        name,
        category_id: categoryId,
        quantities,
        prices_cents: pricesCents,
        tiers: p.tiers ?? null,
        article_number: typeof p.articleNumber === "string" ? p.articleNumber : null,
        bullets: Array.isArray(p.bullets) ? p.bullets : null,
        description: typeof p.description === "string" ? p.description : null,
        image: typeof p.image === "string" ? p.image : null,
        meta_title: typeof p.metaTitle === "string" ? p.metaTitle : null,
        meta_description: typeof p.metaDescription === "string" ? p.metaDescription : null,
      };
    });
    await supabaseServer.from("products").insert(rows);
  } catch (e) {
    console.error("[products-supabase] Seed from file:", e);
  }
}

export async function getAllProductsSupabase(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  await seedFromFileIfNeeded();
  const { data, error } = await supabaseServer.from("products").select("*").order("name");
  if (error) {
    console.error("[products-supabase] getAllProducts:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToProduct(r as ProductRow));
}

export async function getProductBySlugSupabase(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  await seedFromFileIfNeeded();
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProduct(data as ProductRow);
}

export async function upsertProductSupabase(product: Product): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabaseServer.from("products").upsert(productToRow(product) as Record<string, unknown>, {
    onConflict: "slug",
  });
  if (error) console.error("[products-supabase] upsert:", error.message);
}

export async function deleteProductSupabase(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabaseServer.from("products").delete().eq("slug", slug);
}
