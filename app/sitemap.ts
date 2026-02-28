import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products-data";
import { categories } from "@/lib/categories";
import { getAllPosts } from "@/lib/blog-data";
import { getAllPages } from "@/lib/pages-data";
import { getBaseUrl } from "@/lib/seo";

/** Sitemap stündlich neu aufbauen, stabile Auslieferung für Google. */
export const revalidate = 3600;

/** Erzeugt absolute URLs für die Sitemap (Google-konform). */
function absoluteUrl(path: string): string {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/products"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/bestellung-verfolgen"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/instagram-profilbild"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/impressum"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/datenschutz"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/agb"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/kontakt"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/widerrufsbelehrung"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: absoluteUrl(`/products/${cat.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  let productPages: MetadataRoute.Sitemap = [];
  let blogPages: MetadataRoute.Sitemap = [];
  let cmsPages: MetadataRoute.Sitemap = [];

  try {
    const products = await getAllProducts();
    productPages = products.map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Bei Fehler (z. B. DB) trotzdem gültige Sitemap mit statischen + Kategorien
  }

  try {
    const posts = await getAllPosts();
    blogPages = posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Blog optional
  }

  try {
    const pages = await getAllPages();
    cmsPages = pages.map((p) => ({
      url: absoluteUrl(`/p/${p.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // CMS-Seiten optional
  }

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages, ...cmsPages];
}
