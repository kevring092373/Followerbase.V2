/**
 * Produktdaten: Lesen/Schreiben aus content/products.json.
 * Seed aus lib/categories, wenn Datei fehlt.
 */
import { promises as fs } from "fs";
import path from "path";
import { categories } from "./categories";
import type { Category } from "./categories";

export interface Product {
  slug: string;
  name: string;
  categoryId: string;
  quantities: number[];
  pricesCents: number[];
  /** Artikelnummer (z. B. FC-001) */
  articleNumber?: string;
  /** Kurzbeschreibung als Bulletpoints (für Produktseite) */
  bullets?: string[];
  /** Produktbeschreibung als HTML */
  description?: string;
  /** Bild-URL oder -Pfad */
  image?: string;
  /** Meta-Titel (SEO) */
  metaTitle?: string;
  /** Meta-Beschreibung (SEO) */
  metaDescription?: string;
}

const PRODUCTS_FILE = path.join(process.cwd(), "content", "products.json");

function seedFromCategories(): Product[] {
  const products: Product[] = [];
  for (const cat of categories) {
    for (const p of cat.products) {
      products.push({
        slug: p.slug,
        name: p.name,
        categoryId: cat.id,
        quantities: p.quantities,
        pricesCents: p.pricesCents,
      });
    }
  }
  return products;
}

async function readProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.products) ? data.products : seedFromCategories();
    return list.map((p) => normalizeProduct(p as Record<string, unknown>));
  } catch {
    return seedFromCategories();
  }
}

async function writeProducts(products: Product[]): Promise<void> {
  const dir = path.dirname(PRODUCTS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    PRODUCTS_FILE,
    JSON.stringify({ products }, null, 2),
    "utf-8"
  );
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await readProducts();
  return products.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await readProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  const products = await readProducts();
  return products.filter((p) => p.categoryId === categoryId).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCategoryByProductSlug(slug: string): Promise<Category | undefined> {
  const product = await getProductBySlug(slug);
  if (!product) return undefined;
  return categories.find((c) => c.id === product.categoryId);
}

function normalizeProduct(p: Record<string, unknown>): Product {
  const slug = typeof p.slug === "string" ? p.slug : "";
  const name = typeof p.name === "string" ? p.name : "";
  const categoryId = typeof p.categoryId === "string" ? p.categoryId : "";
  const quantities = Array.isArray(p.quantities) ? (p.quantities as number[]) : [];
  const pricesCents = Array.isArray(p.pricesCents) ? (p.pricesCents as number[]) : [];
  const articleNumber = typeof p.articleNumber === "string" ? p.articleNumber.trim() || undefined : undefined;
  const bullets = Array.isArray(p.bullets) ? (p.bullets as string[]) : undefined;
  const description = typeof p.description === "string" ? p.description : undefined;
  const image = typeof p.image === "string" ? p.image : undefined;
  const metaTitle = typeof p.metaTitle === "string" ? p.metaTitle : undefined;
  const metaDescription = typeof p.metaDescription === "string" ? p.metaDescription : undefined;
  return { slug, name, categoryId, quantities, pricesCents, articleNumber, bullets, description, image, metaTitle, metaDescription };
}

export async function updateProduct(slug: string, data: Partial<Product>): Promise<Product> {
  const products = await readProducts();
  const index = products.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error("Produkt nicht gefunden.");
  const updated: Product = { ...products[index], ...data };
  products[index] = updated;
  await writeProducts(products);
  return updated;
}

export async function deleteProduct(slug: string): Promise<void> {
  const products = await readProducts();
  const filtered = products.filter((p) => p.slug !== slug);
  if (filtered.length === products.length) throw new Error("Produkt nicht gefunden.");
  await writeProducts(filtered);
}
