/**
 * Server-seitige Seiten-Daten: Lesen/Schreiben aus content/pages.json.
 */
import { promises as fs } from "fs";
import path from "path";
import type { Page } from "./page";

const PAGES_FILE = path.join(process.cwd(), "content", "pages.json");

function normalizePage(p: Record<string, unknown>): Page {
  const slug = typeof p.slug === "string" ? p.slug : "";
  const title = typeof p.title === "string" ? p.title : slug;
  const content = typeof p.content === "string" ? p.content : "";
  const metaTitle = typeof p.metaTitle === "string" ? p.metaTitle : undefined;
  const metaDescription = typeof p.metaDescription === "string" ? p.metaDescription : undefined;
  return { slug, title, content, metaTitle, metaDescription };
}

async function readPages(): Promise<Page[]> {
  try {
    const raw = await fs.readFile(PAGES_FILE, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data.pages) ? data.pages : [];
    return list.map((p: Record<string, unknown>) => normalizePage(p));
  } catch {
    return [];
  }
}

async function writePages(pages: Page[]): Promise<void> {
  const dir = path.dirname(PAGES_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(PAGES_FILE, JSON.stringify({ pages }, null, 2), "utf-8");
}

export async function getAllPages(): Promise<Page[]> {
  const pages = await readPages();
  return [...pages].sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  const pages = await readPages();
  return pages.find((p) => p.slug === slug);
}

export async function createPage(input: Page): Promise<Page> {
  const pages = await readPages();
  const page: Page = {
    slug: input.slug,
    title: input.title,
    content: input.content ?? "",
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
  };
  if (pages.some((p) => p.slug === page.slug)) {
    throw new Error(`Eine Seite mit der URL "${page.slug}" existiert bereits.`);
  }
  pages.push(page);
  await writePages(pages);
  return page;
}

export async function updatePage(slug: string, input: Partial<Page>): Promise<Page> {
  const pages = await readPages();
  const index = pages.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error("Seite nicht gefunden.");
  const updated: Page = { ...pages[index], ...input };
  pages[index] = updated;
  await writePages(pages);
  return updated;
}

export async function deletePage(slug: string): Promise<void> {
  const pages = await readPages();
  const filtered = pages.filter((p) => p.slug !== slug);
  if (filtered.length === pages.length) throw new Error("Seite nicht gefunden.");
  await writePages(filtered);
}
