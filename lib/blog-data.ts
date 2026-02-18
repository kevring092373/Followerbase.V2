/**
 * Server-seitige Blog-Daten: Lesen/Schreiben aus content/blog-posts.json.
 */
import { promises as fs } from "fs";
import path from "path";
import type { BlogPost } from "./blog";

const BLOG_FILE = path.join(process.cwd(), "content", "blog-posts.json");

function normalizePost(p: Record<string, unknown>): BlogPost {
  const slug = typeof p.slug === "string" ? p.slug : "";
  const title = typeof p.title === "string" ? p.title : (typeof p.excerpt === "string" ? p.excerpt : slug);
  const excerpt = typeof p.excerpt === "string" ? p.excerpt : undefined;
  const content = typeof p.content === "string" ? p.content : "";
  const date = typeof p.date === "string" ? p.date : undefined;
  const metaTitle = typeof p.metaTitle === "string" ? p.metaTitle : undefined;
  const metaDescription = typeof p.metaDescription === "string" ? p.metaDescription : undefined;
  const image = typeof p.image === "string" ? p.image : undefined;
  return { slug, title, excerpt, content, date, metaTitle, metaDescription, image };
}

async function readPosts(): Promise<BlogPost[]> {
  try {
    const raw = await fs.readFile(BLOG_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.posts) ? data.posts : [];
    return list.map((p) => normalizePost(p as Record<string, unknown>));
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
  const posts = await readPosts();
  return [...posts].sort((a, b) => {
    const dA = a.date ?? "";
    const dB = b.date ?? "";
    if (dA && dB) return dB.localeCompare(dA);
    return (b.slug ?? "").localeCompare(a.slug ?? "");
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await readPosts();
  return posts.find((p) => p.slug === slug);
}

export async function createPost(input: BlogPost): Promise<BlogPost> {
  const posts = await readPosts();
  const post: BlogPost = {
    slug: input.slug,
    title: input.title,
    content: input.content,
    date: input.date ?? new Date().toISOString().slice(0, 10),
  };
  if (posts.some((p) => p.slug === post.slug)) {
    throw new Error(`Ein Beitrag mit der URL "${post.slug}" existiert bereits.`);
  }
  posts.push(post);
  await writePosts(posts);
  return post;
}

export async function updatePost(slug: string, input: Partial<BlogPost>): Promise<BlogPost> {
  const posts = await readPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error("Beitrag nicht gefunden.");
  const updated: BlogPost = {
    ...posts[index],
    ...input,
  };
  posts[index] = updated;
  await writePosts(posts);
  return updated;
}

export async function deletePost(slug: string): Promise<void> {
  const posts = await readPosts();
  const filtered = posts.filter((p) => p.slug !== slug);
  if (filtered.length === posts.length) throw new Error("Beitrag nicht gefunden.");
  await writePosts(filtered);
}
