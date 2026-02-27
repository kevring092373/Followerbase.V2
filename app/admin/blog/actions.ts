"use server";

import { promises as fs } from "fs";
import path from "path";
import { createPost, updatePost, deletePost as deletePostData } from "@/lib/blog-data";
import type { BlogPost } from "@/lib/blog";

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[^a-z0-9-]/g, "");
}

export async function savePostAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const originalSlug = (formData.get("originalSlug") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim() || undefined;
  const category = (formData.get("category") as string)?.trim() || undefined;
  const content = (formData.get("content") as string)?.trim() ?? "";
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || undefined;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || undefined;
  const image = (formData.get("image") as string)?.trim() || undefined;

  if (!title) return { error: "Bezeichnung (für die Liste) ist Pflicht." };
  const finalSlug = slug || slugFromTitle(title);
  if (!finalSlug) return { error: "URL konnte nicht erzeugt werden." };

  const isEdit = !!originalSlug;
  const post: BlogPost = {
    slug: finalSlug,
    title,
    excerpt,
    category,
    content,
    date: new Date().toISOString().slice(0, 10),
    metaTitle,
    metaDescription,
    image,
  };

  try {
    if (isEdit) {
      await updatePost(originalSlug!, post);
    } else {
      await createPost(post);
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fehler beim Speichern." };
  }
}

export async function deletePostAction(slug: string): Promise<{ error?: string }> {
  try {
    await deletePostData(slug);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fehler beim Löschen." };
  }
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "blog");

export async function uploadBlogImageAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Bitte eine Datei auswählen." };
  }
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { error: "Nur Bilder (JPEG, PNG, GIF, WebP) erlaubt." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Max. 5 MB." };
  }
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(file.name) || ".jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));
    const url = `/uploads/blog/${safeName}`;
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload fehlgeschlagen." };
  }
}
