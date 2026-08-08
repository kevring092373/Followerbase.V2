/**
 * Produktübersicht nach Kategorien (Instagram, TikTok, YouTube, …).
 * Icons aus public/icons/ – exakte Dateinamen wie im Ordner.
 */
import Link from "next/link";
import { categories } from "@/lib/categories";
import { getProductsByCategoryId } from "@/lib/products-data";
import { CategoryIcon } from "@/components/CategoryIcon";
import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Produkte – Followerbase",
  description:
    "Follower, Likes und Views für Instagram, TikTok, YouTube, Snapchat, Telegram & mehr. Nach Plattform wählen – faire Preise, schnelle Lieferung.",
  openGraph: {
    title: "Produkte – Followerbase" as const,
    description:
      "Follower, Likes und Views für Instagram, TikTok, YouTube und mehr. Nach Plattform wählen.",
    url: absoluteUrl("/products"),
    type: "website" as const,
  },
  twitter: {
    card: "summary" as const,
    title: "Produkte – Followerbase",
    description: "Follower, Likes und Views für alle großen Plattformen – Followerbase Shop.",
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
      <header className="products-header">
        <h1 className="products-title">Produkte</h1>
        <p className="products-intro">
          Wähle eine Kategorie und dein gewünschtes Produkt – Follower, Likes und Views für alle großen Plattformen.
        </p>
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
