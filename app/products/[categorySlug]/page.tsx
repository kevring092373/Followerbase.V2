/**
 * Kategorieseite: z.B. /products/instagram – alle Produkte dieser Kategorie.
 */
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { categories } from "@/lib/categories";
import { getProductsByCategoryId, getProductImageAlt } from "@/lib/products-data";

type Props = { params: { categorySlug: string } };

export function generateMetadata({ params }: Props) {
  const category = categories.find((c) => c.slug === params.categorySlug);
  if (!category) return { title: "Kategorie – Followerbase" };
  return {
    title: `${category.name} – Followerbase`,
    description: `${category.name} – Produkte im Followerbase Shop.`,
  };
}

function formatAbPrice(cents: number): string {
  const euros = cents / 100;
  return euros % 1 === 0 ? `ab ${euros} €` : `ab ${euros.toFixed(2)} €`;
}

export default async function CategoryPage({ params }: Props) {
  const slug = params.categorySlug;
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  const products = await getProductsByCategoryId(category.id);

  return (
    <div className="category-page">
      <Link href="/products" className="category-back">
        ← Alle Produkte
      </Link>

      <header className="category-header">
        <h1 className="category-title">{category.name}</h1>
        <p className="category-subtitle">
          {products.length} {products.length === 1 ? "Produkt" : "Produkte"} – wähle dein gewünschtes Paket.
        </p>
      </header>

      <div className="category-grid">
        {products.map((product) => {
          const minPriceCents = product.pricesCents.length ? Math.min(...product.pricesCents) : 0;
          return (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="category-card card"
            >
              <div className="category-card-thumb-wrap">
                {product.image ? (
                  product.image.startsWith("/") ? (
                    <div className="category-card-thumb category-card-thumb-img">
                      <Image src={product.image} alt={getProductImageAlt(product.image, product.name)} width={120} height={120} className="category-card-thumb-img-inner" />
                    </div>
                  ) : (
                    <div className="category-card-thumb category-card-thumb-img">
                      <img src={product.image} alt={getProductImageAlt(product.image, product.name)} className="category-card-thumb-img-inner" />
                    </div>
                  )
                ) : (
                  <div className="category-card-thumb" aria-hidden>
                    <span className="category-card-thumb-text">Bild</span>
                  </div>
                )}
              </div>
              <div className="category-card-body">
                <span className="category-card-name">{product.name}</span>
                <span className="category-card-price">{formatAbPrice(minPriceCents)}</span>
              </div>
              <span className="category-card-arrow">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
