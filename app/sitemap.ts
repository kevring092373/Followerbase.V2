import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products-data";
import { categories } from "@/lib/categories";
import { getAllPosts } from "@/lib/blog-data";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_URL ||
  "https://followerbase.netlify.app";

function url(path: string): string {
  const base = BASE_URL.startsWith("http") ? BASE_URL : `https://${BASE_URL}`;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: url("/products"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/blog"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/bestellung-verfolgen"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/instagram-profilbild"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/impressum"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: url("/datenschutz"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: url("/agb"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: url("/kontakt"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/widerrufsbelehrung"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: url("/seiten"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: url(`/products/${cat.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const products = await getAllProducts();
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: url(`/product/${p.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const posts = await getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: url(`/blog/${post.slug}`),
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
