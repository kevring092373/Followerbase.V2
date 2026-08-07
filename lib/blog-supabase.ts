/**
 * Blog-Beiträge in Supabase (für Netlify read-only Dateisystem).
 * Wenn die Tabelle leer ist, wird einmalig aus content/blog-posts.json gelesen und eingespielt.
 * Tabelle in Supabase anlegen: siehe Kommentar am Ende oder README.
 */
import { promises as fs } from "fs";
import path from "path";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import type { BlogPost } from "./blog";

const BLOG_FILE = path.join(process.cwd(), "content", "blog-posts.json");

const TABLE = "blog_posts";

type BlogPostRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  date: string | null;
  meta_title: string | null;
  meta_description: string | null;
  image: string | null;
  category: string | null;
};

function cleanSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function rowToPost(r: BlogPostRow): BlogPost {
  return {
    slug: cleanSlug(r.slug) || r.slug.trim(),
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    content: r.content,
    date: r.date ?? undefined,
    metaTitle: r.meta_title ?? undefined,
    metaDescription: r.meta_description ?? undefined,
    image: r.image?.trim() || undefined,
    category: r.category?.trim() || undefined,
  };
}

function postToRow(p: BlogPost): Record<string, unknown> {
  const slug = cleanSlug(p.slug) || p.slug.trim();
  return {
    slug,
    title: p.title,
    excerpt: p.excerpt ?? null,
    content: p.content,
    date: p.date ?? null,
    meta_title: p.metaTitle ?? null,
    meta_description: p.metaDescription ?? null,
    image: p.image ?? null,
    category: p.category ?? null,
  };
}

async function seedFromFileIfNeeded(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { count } = await supabaseServer.from(TABLE).select("*", { count: "exact", head: true });
  if (count != null && count > 0) return;
  try {
    const raw = await fs.readFile(BLOG_FILE, "utf-8");
    const data = JSON.parse(raw) as { posts?: Record<string, unknown>[] };
    const list = Array.isArray(data.posts) ? data.posts : [];
    if (list.length === 0) return;
    const rows = list.map((p) => {
      const slug = typeof p.slug === "string" ? p.slug : "";
      const title = typeof p.title === "string" ? p.title : "";
      const content = typeof p.content === "string" ? p.content : "";
      return {
        slug,
        title,
        excerpt: typeof p.excerpt === "string" ? p.excerpt : null,
        content,
        date: typeof p.date === "string" ? p.date : null,
        meta_title: typeof p.metaTitle === "string" ? p.metaTitle : null,
        meta_description: typeof p.metaDescription === "string" ? p.metaDescription : null,
        image: typeof p.image === "string" ? p.image : null,
        category: typeof p.category === "string" ? p.category : null,
      };
    });
    await supabaseServer.from(TABLE).insert(rows);
  } catch (e) {
    console.error("[blog-supabase] Seed from file:", e);
  }
}

export async function getAllPostsSupabase(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  await seedFromFileIfNeeded();
  const { data, error } = await supabaseServer.from(TABLE).select("*").order("date", { ascending: false });
  if (error) {
    console.error("[blog-supabase] getAllPosts:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToPost(r as BlogPostRow));
}

export async function getPostBySlugSupabase(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) return null;
  await seedFromFileIfNeeded();
  const clean = cleanSlug(slug) || slug.trim();
  const { data, error } = await supabaseServer
    .from(TABLE)
    .select("*")
    .eq("slug", clean)
    .limit(1)
    .maybeSingle();
  if (!error && data) return rowToPost(data as BlogPostRow);
  // Fallback: alte Einträge mit Leerzeichen am Slug (z. B. Copy-Paste)
  const { data: loose } = await supabaseServer.from(TABLE).select("*").ilike("slug", clean);
  const match = (loose ?? []).find((r) => cleanSlug((r as BlogPostRow).slug) === clean);
  return match ? rowToPost(match as BlogPostRow) : null;
}

export async function createPostSupabase(post: BlogPost): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabaseServer.from(TABLE).insert(postToRow(post) as Record<string, unknown>);
  if (error) throw new Error(error.message);
}

export async function updatePostSupabase(slug: string, post: BlogPost): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (post.slug !== slug) {
    await deletePostSupabase(slug);
    await createPostSupabase(post);
    return;
  }
  const { error } = await supabaseServer
    .from(TABLE)
    .update(postToRow(post) as Record<string, unknown>)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
}

export async function deletePostSupabase(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabaseServer.from(TABLE).delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}
