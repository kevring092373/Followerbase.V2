/**
 * Produktübersicht nach Kategorien (Instagram, TikTok, YouTube, …).
 * Icons aus public/icons/ – exakte Dateinamen wie im Ordner.
 */
import Link from "next/link";
import { categories } from "@/lib/categories";
import { getProductsByCategoryId } from "@/lib/products-data";
import { CategoryIcon } from "@/components/CategoryIcon";
import { absoluteUrl, brandOgImage } from "@/lib/seo";
import { PRODUCTS_HUB_COPY } from "@/lib/hub-page-copy";
import { JsonLd } from "@/components/JsonLd";
import { buildCollectionPageSchema } from "@/lib/structured-data";

const description = PRODUCTS_HUB_COPY.intro;
const title = PRODUCTS_HUB_COPY.title;

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: absoluteUrl("/products"),
    type: "website" as const,
    images: [brandOgImage()],
  },
  twitter: {
    card: "summary_large_image" as const,
    title,
    description,
    images: [brandOgImage().url],
  },
  alternates: { canonical: absoluteUrl("/products") },
};

export const revalidate = 300;

/** Kategorie-ID → Dateiname in public/icons/ (wie abgelegt). */
const CATEGORY_ICONS: Record<string, string> = {
  instagram: "instagram.png",
  tiktok: "tiktok.png",
  snapchat: "Snapchat.png",
  reddit: "reddit.webp",
  telegram: "telegram.webp",
  facebook: "facebook.png",
  youtube: "youtube.png",
  threads: "threads.png",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
  youtube: "▶️",
  snapchat: "👻",
  reddit: "🤖",
  telegram: "✈️",
  facebook: "👍",
  threads: "🧵",
};

export default async function ProductsPage() {
  const categoryProducts = await Promise.all(
    categories.map(async (cat) => ({ category: cat, products: await getProductsByCategoryId(cat.id) }))
  );

  return (
    <div className="products-page">
      <JsonLd
        data={buildCollectionPageSchema({
          name: PRODUCTS_HUB_COPY.h1,
          description,
          path: "/products",
          items: categories.map((cat) => ({
            name: cat.name,
            path: `/products/${cat.slug}`,
          })),
        })}
      />
      <header className="products-header">
        <h1 className="products-title">{PRODUCTS_HUB_COPY.h1}</h1>
        <p className="products-intro hub-intro">{PRODUCTS_HUB_COPY.intro}</p>
      </header>

      <div className="products-category-grid">
        {categoryProducts.map(({ category, products }) => (
          <Link
            key={category.id}
            href={`/products/${category.slug}`}
            className="products-category-card card"
          >
            <span className="products-category-icon">
              <CategoryIcon
                src={CATEGORY_ICONS[category.id] ? `/icons/${CATEGORY_ICONS[category.id]}` : ""}
                fallback={PLATFORM_ICONS[category.id] ?? "📦"}
                alt={category.name}
                size={48}
                className="products-category-icon-img"
              />
            </span>
            <div className="products-category-body">
              <h2 className="products-category-name">{category.name}</h2>
              <p className="products-category-meta">
                {products.length} {products.length === 1 ? "Produkt" : "Produkte"}
              </p>
            </div>
            <span className="products-category-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
