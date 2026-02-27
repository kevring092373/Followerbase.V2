"use server";

import { promises as fs } from "fs";
import path from "path";
import { updateProduct, deleteProduct } from "@/lib/products-data";
import type { Product } from "@/lib/products-data";

const PRICE_TABLE_ROWS = 12;

export async function saveProductAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const slug = (formData.get("slug") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const categoryId = (formData.get("categoryId") as string)?.trim();
  const articleNumber = (formData.get("articleNumber") as string)?.trim() || undefined;
  const bulletsStr = (formData.get("bullets") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || undefined;
  const image = (formData.get("image") as string)?.trim() || undefined;
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || undefined;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || undefined;

  const quantities: number[] = [];
  const pricesCents: number[] = [];
  for (let i = 0; i < PRICE_TABLE_ROWS; i++) {
    const q = (formData.get(`quantity_${i}`) as string)?.trim();
    const p = (formData.get(`price_${i}`) as string)?.trim();
    if (q && p) {
      const qn = parseInt(q, 10);
      const pn = parseInt(p, 10);
      if (!isNaN(qn) && !isNaN(pn)) {
        quantities.push(qn);
        pricesCents.push(pn);
      }
    }
  }
  if (quantities.length === 0) {
    quantities.push(100, 200, 500);
    pricesCents.push(100, 200, 500);
  }

  const bullets = bulletsStr
    ? bulletsStr.split("\n").map((s) => s.trim()).filter(Boolean)
    : undefined;

  if (!slug) return { error: "Slug (URL) ist Pflicht." };
  if (!name) return { error: "Produktname ist Pflicht." };
  if (!categoryId) return { error: "Kategorie ist Pflicht." };
  if (quantities.length !== pricesCents.length) {
    return { error: "Anzahl Mengen und Preise muss übereinstimmen." };
  }

  const data: Partial<Product> = {
    slug,
    name,
    categoryId,
    quantities,
    pricesCents,
    articleNumber,
    bullets: bullets?.length ? bullets : undefined,
    description,
    image,
    metaTitle,
    metaDescription,
  };

  try {
    await updateProduct(slug, data);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fehler beim Speichern." };
  }
}

export async function deleteProductAction(slug: string): Promise<{ error?: string }> {
  try {
    await deleteProduct(slug);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fehler beim Löschen." };
  }
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const DESCRIPTION_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products", "description");

async function uploadImage(
  file: File,
  dir: string,
  urlPrefix: string
): Promise<{ error?: string; url?: string }> {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { error: "Nur Bilder (JPEG, PNG, GIF, WebP) erlaubt." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Max. 5 MB." };
  }
  try {
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(file.name) || ".jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const filePath = path.join(dir, safeName);
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));
    return { url: `${urlPrefix}/${safeName}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload fehlgeschlagen." };
  }
}

export async function uploadProductImageAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Bitte eine Datei auswählen." };
  }
  return uploadImage(file, UPLOAD_DIR, "/uploads/products");
}

/** Bild für die Produktbeschreibung (HTML): hochladen, URL in Beschreibung einfügen. */
export async function uploadProductDescriptionImageAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Bitte eine Datei auswählen." };
  }
  return uploadImage(file, DESCRIPTION_UPLOAD_DIR, "/uploads/products/description");
}
