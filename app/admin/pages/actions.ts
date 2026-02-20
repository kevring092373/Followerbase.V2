"use server";

import { createPage, updatePage, deletePage as deletePageData } from "@/lib/pages-data";
import type { Page } from "@/lib/page";

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[^a-z0-9-]/g, "");
}

export async function savePageAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const originalSlug = (formData.get("originalSlug") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() ?? "";
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || undefined;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || undefined;

  if (!title) return { error: "Titel ist Pflicht." };
  const finalSlug = slug || slugFromTitle(title);
  if (!finalSlug) return { error: "URL konnte nicht erzeugt werden." };

  const isEdit = !!originalSlug;
  const page: Page = {
    slug: finalSlug,
    title,
    content,
    metaTitle,
    metaDescription,
  };

  try {
    if (isEdit) {
      await updatePage(originalSlug!, page);
    } else {
      await createPage(page);
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fehler beim Speichern." };
  }
}

export async function deletePageAction(slug: string): Promise<{ error?: string }> {
  try {
    await deletePageData(slug);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fehler beim Löschen." };
  }
}
