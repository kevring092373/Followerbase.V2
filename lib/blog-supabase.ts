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

function rowToPost(r: BlogPostRow): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    content: r.content,
    date: r.date ?? undefined,
    metaTitle: r.meta_title ?? undefined,
    metaDescription: r.meta_description ?? undefined,
    image: r.image ?? undefined,
    category: r.category ?? undefined,
  };
}

function postToRow(p: BlogPost): Record<string, unknown> {
  return {
    slug: p.slug,
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
  const { data, error } = await supabaseServer.from(TABLE).select("*").eq("slug", slug).limit(1).maybeSingle();
  if (error || !data) return null;
  return rowToPost(data as BlogPostRow);
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
