/**
 * Server-seitige Blog-Daten: Bei Supabase aus DB, sonst aus content/blog-posts.json.
 * Auf Netlify (read-only) wird Supabase verwendet.
 */
import { promises as fs } from "fs";
import path from "path";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  getAllPostsSupabase,
  getPostBySlugSupabase,
  createPostSupabase,
  updatePostSupabase,
  deletePostSupabase,
} from "./blog-supabase";
import type { BlogPost } from "./blog";

const BLOG_FILE = path.join(process.cwd(), "content", "blog-posts.json");

/** Slug für URLs: trimmen, Kleinbuchstaben, nur a-z0-9 und Bindestriche. */
export function normalizeBlogSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePost(p: Record<string, unknown>): BlogPost {
  const rawSlug = typeof p.slug === "string" ? p.slug : "";
  const slug = normalizeBlogSlug(rawSlug) || rawSlug.trim();
  const title = typeof p.title === "string" ? p.title : (typeof p.excerpt === "string" ? p.excerpt : slug);
  const excerpt = typeof p.excerpt === "string" ? p.excerpt : undefined;
  const content = typeof p.content === "string" ? p.content : "";
  const date = typeof p.date === "string" ? p.date : undefined;
  const metaTitle = typeof p.metaTitle === "string" ? p.metaTitle : undefined;
  const metaDescription = typeof p.metaDescription === "string" ? p.metaDescription : undefined;
  const image = typeof p.image === "string" ? p.image.trim() || undefined : undefined;
  const category = typeof p.category === "string" ? p.category.trim() || undefined : undefined;
  return { slug, title, excerpt, content, date, metaTitle, metaDescription, image, category };
}

async function readPosts(): Promise<BlogPost[]> {
  try {
    const raw = await fs.readFile(BLOG_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.posts) ? data.posts : [];
    return list.map((p: Record<string, unknown>) => normalizePost(p));
  } catch {
    return [];
  }
}

async function writePosts(posts: BlogPost[]): Promise<void> {
  const dir = path.dirname(BLOG_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    BLOG_FILE,
    JSON.stringify({ posts }, null, 2),
    "utf-8"
  );
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) return getAllPostsSupabase();
  const posts = await readPosts();
  return [...posts].sort((a, b) => {
    const dA = a.date ?? "";
    const dB = b.date ?? "";
    if (dA && dB) return dB.localeCompare(dA);
    return (b.slug ?? "").localeCompare(a.slug ?? "");
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const clean = normalizeBlogSlug(slug) || slug.trim();
  if (isSupabaseConfigured()) {
    const p = await getPostBySlugSupabase(clean);
    return p ?? undefined;
  }
  const posts = await readPosts();
  return posts.find((p) => p.slug === clean || normalizeBlogSlug(p.slug) === clean);
}

export async function createPost(input: BlogPost): Promise<BlogPost> {
  const slug = normalizeBlogSlug(input.slug);
  if (!slug) throw new Error("Bitte eine gültige URL (Slug) angeben.");
  const post: BlogPost = {
    slug,
    title: input.title,
    content: input.content,
    date: input.date ?? new Date().toISOString().slice(0, 10),
    excerpt: input.excerpt,
    category: input.category,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    image: input.image,
  };
  if (isSupabaseConfigured()) {
    const existing = await getPostBySlugSupabase(post.slug);
    if (existing) throw new Error(`Ein Beitrag mit der URL "${post.slug}" existiert bereits.`);
    await createPostSupabase(post);
    return post;
  }
  const posts = await readPosts();
  if (posts.some((p) => p.slug === post.slug)) {
    throw new Error(`Ein Beitrag mit der URL "${post.slug}" existiert bereits.`);
  }
  posts.push(post);
  await writePosts(posts);
  return post;
}

export async function updatePost(slug: string, input: Partial<BlogPost>): Promise<BlogPost> {
  const cleanSlugParam = normalizeBlogSlug(slug) || slug.trim();
  const nextSlug =
    input.slug !== undefined ? normalizeBlogSlug(input.slug) || input.slug.trim() : undefined;
  if (isSupabaseConfigured()) {
    const existing = await getPostBySlugSupabase(cleanSlugParam);
    if (!existing) throw new Error("Beitrag nicht gefunden.");
    const updated: BlogPost = {
      ...existing,
      ...input,
      ...(nextSlug ? { slug: nextSlug } : {}),
    };
    await updatePostSupabase(existing.slug, updated);
    return updated;
  }
  const posts = await readPosts();
  const index = posts.findIndex(
    (p) => p.slug === cleanSlugParam || normalizeBlogSlug(p.slug) === cleanSlugParam
  );
  if (index === -1) throw new Error("Beitrag nicht gefunden.");
  const updated: BlogPost = {
    ...posts[index],
    ...input,
    ...(nextSlug ? { slug: nextSlug } : {}),
  };
  posts[index] = updated;
  await writePosts(posts);
  return updated;
}

export async function deletePost(slug: string): Promise<void> {
  const clean = normalizeBlogSlug(slug) || slug.trim();
  if (isSupabaseConfigured()) {
    const existing = await getPostBySlugSupabase(clean);
    if (!existing) throw new Error("Beitrag nicht gefunden.");
    await deletePostSupabase(existing.slug);
    return;
  }
  const posts = await readPosts();
  const filtered = posts.filter(
    (p) => p.slug !== clean && normalizeBlogSlug(p.slug) !== clean
  );
  if (filtered.length === posts.length) throw new Error("Beitrag nicht gefunden.");
  await writePosts(filtered);
}
