import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products-data";
import { categories } from "@/lib/categories";
import { getAllPosts, blogCategoryPath } from "@/lib/blog-data";
import { getAllPages } from "@/lib/pages-data";
import { canonicalUrl } from "@/lib/seo";
import { productCanonicalUrl } from "@/lib/product-seo";

/** Sitemap alle 5 Min neu – schneller als force-dynamic bei jedem Hit. */
export const revalidate = 300;

function realLastmod(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function entry(
  path: string,
  extra?: Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority" | "lastModified">
): MetadataRoute.Sitemap[number] {
  return {
    url: canonicalUrl(path),
    changeFrequency: extra?.changeFrequency,
    priority: extra?.priority,
    ...(extra?.lastModified ? { lastModified: extra.lastModified } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "weekly", priority: 1 }),
    entry("/products", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/blog", { changeFrequency: "weekly", priority: 0.8 }),
    entry("/ueber-uns", { changeFrequency: "monthly", priority: 0.6 }),
    entry("/bestellung-verfolgen", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/instagram-profilbild", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/impressum", { changeFrequency: "monthly", priority: 0.3 }),
    entry("/datenschutz", { changeFrequency: "monthly", priority: 0.3 }),
    entry("/agb", { changeFrequency: "monthly", priority: 0.3 }),
    entry("/kontakt", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/widerrufsbelehrung", { changeFrequency: "monthly", priority: 0.3 }),
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) =>
    entry(`/products/${cat.slug}`, { changeFrequency: "weekly", priority: 0.8 })
  );

  let productPages: MetadataRoute.Sitemap = [];
  let blogPages: MetadataRoute.Sitemap = [];
  let cmsPages: MetadataRoute.Sitemap = [];

  try {
    const products = await getAllProducts();
    productPages = products
      .filter((p) => p.slug && !p.slug.includes("?") && !p.slug.includes("#"))
      .map((p) => ({
        url: productCanonicalUrl(p.slug),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(realLastmod(p.updatedAt) ? { lastModified: realLastmod(p.updatedAt) } : {}),
      }));
  } catch {
    // Bei Fehler (z. B. DB) trotzdem gültige Sitemap mit statischen + Kategorien
  }

  try {
    const posts = await getAllPosts();
    blogPages = posts
      .filter((post) => post.slug && !post.slug.includes("?"))
      .map((post) => ({
        url: canonicalUrl(`/blog/${post.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        ...(realLastmod(post.date) ? { lastModified: realLastmod(post.date) } : {}),
      }));
    const blogCats = [
      ...new Set(
        posts
          .map((post) => post.category?.trim())
          .filter((name): name is string => Boolean(name))
      ),
    ];
    blogPages.push(
      ...blogCats.map((name) =>
        entry(blogCategoryPath(name), { changeFrequency: "weekly", priority: 0.65 })
      )
    );
  } catch {
    // Blog optional
  }

  try {
    const pages = await getAllPages();
    cmsPages = pages
      .filter((p) => p.slug && !p.slug.includes("?"))
      .map((p) =>
        entry(`/p/${p.slug}`, { changeFrequency: "monthly", priority: 0.5 })
      );
  } catch {
    // CMS-Seiten optional
  }

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages, ...cmsPages];
}
