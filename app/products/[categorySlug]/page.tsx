/**
 * Kategorieseite: z.B. /products/instagram – alle Produkte dieser Kategorie.
 */
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { categories } from "@/lib/categories";
import { getProductsByCategoryId, getProductImageAlt } from "@/lib/products-data";
import { absoluteUrl, brandOgImage, truncateDescription } from "@/lib/seo";
import { PAGE_META_DESCRIPTIONS } from "@/lib/page-meta-descriptions";
import { PLATFORM_HUB_COPY } from "@/lib/hub-page-copy";
import { formatFromPriceFromCents } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { buildCollectionPageSchema } from "@/lib/structured-data";
import { publicProductSlug } from "@/lib/product-page-titles";

type Props = { params: { categorySlug: string } };

/** Statische Generierung: alle Kategorie-URLs beim Build */
export function generateStaticParams() {
  return categories.map((c) => ({ categorySlug: c.slug }));
}

export const revalidate = 3600;

export function generateMetadata({ params }: Props) {
  const category = categories.find((c) => c.slug === params.categorySlug);
  if (!category) return { title: "Kategorie" };
  const hub = PLATFORM_HUB_COPY[category.slug];
  const title = hub?.h1 ? `${hub.h1} | Followerbase` : `${category.name} – Follower, Likes & Views kaufen – Followerbase`;
  const path = `/products/${category.slug}` as keyof typeof PAGE_META_DESCRIPTIONS;
  const description =
    PAGE_META_DESCRIPTIONS[path] ??
    hub?.intro ??
    truncateDescription(
      `${category.name} – Follower, Likes und Views kaufen. Faire Preise, schnelle Lieferung bei Followerbase. Jetzt bestellen.`
    );
  const url = absoluteUrl(`/products/${category.slug}`);
  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" as const, images: [brandOgImage()] },
    twitter: { card: "summary_large_image" as const, title, description, images: [brandOgImage().url] },
    alternates: { canonical: url },
  };
}

const formatAbPrice = formatFromPriceFromCents;

export default async function CategoryPage({ params }: Props) {
  const slug = params.categorySlug;
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  const products = await getProductsByCategoryId(category.id);

  const hub = PLATFORM_HUB_COPY[category.slug];

  return (
    <div className="category-page">
      <JsonLd
        data={buildCollectionPageSchema({
          name: hub?.h1 ?? category.name,
          description: hub?.intro ?? "",
          path: `/products/${category.slug}`,
          items: products.map((product) => ({
            name: product.name,
            path: `/product/${publicProductSlug(product.slug)}`,
          })),
        })}
      />
      <Link href="/products" className="category-back">
        ← Alle Produkte
      </Link>

      <header className="category-header">
        <h1 className="category-title">{hub?.h1 ?? category.name}</h1>
        {hub?.intro ? (
          <p className="hub-intro">
            {hub.intro}
            {category.slug === "youtube" ? (
              <>
                {" "}
                Noch unsicher? Hier entlang:{" "}
                <Link href="/blog/youtube-abonnenten-kaufen-ratgeber">
                  Ratgeber: YouTube Abonnenten kaufen
                </Link>
                .
              </>
            ) : null}
          </p>
        ) : null}
        <p className="category-subtitle">
          {products.length} {products.length === 1 ? "Produkt" : "Produkte"} – wähle dein gewünschtes Paket.
        </p>
        {category.slug === "instagram" ? (
          <p className="category-intro">
            Für Reels und Videos findest du hier auch{" "}
            <Link href="/product/instagram-views-kaufen">Instagram Views kaufen</Link>.
          </p>
        ) : null}
        {category.slug === "youtube" ? (
          <p className="category-intro">
            Neben Abonnenten, Likes und Watchtime findest du hier auch{" "}
            <Link href="/product/youtube-views-kaufen">YouTube-Views-Pakete</Link>.
          </p>
        ) : null}
      </header>

      <div className="category-grid">
        {products.map((product) => {
          const minPriceCents = product.pricesCents.length ? Math.min(...product.pricesCents) : 0;
          return (
            <Link
              key={product.slug}
              href={`/product/${publicProductSlug(product.slug)}`}
              className="category-card card"
            >
              <div className="category-card-thumb-wrap">
                {product.image ? (
                  product.image.startsWith("/") ? (
                    <div className="category-card-thumb category-card-thumb-img">
                      <Image src={product.image} alt={getProductImageAlt(product.image, product.name)} width={120} height={120} sizes="120px" className="category-card-thumb-img-inner" />
                    </div>
                  ) : (
                    <div className="category-card-thumb category-card-thumb-img">
                      <img src={product.image} alt={getProductImageAlt(product.image, product.name)} className="category-card-thumb-img-inner" loading="lazy" decoding="async" />
                    </div>
                  )
                ) : (
                  <div className="category-card-thumb" aria-hidden>
                    <span className="category-card-thumb-text">Bild</span>
                  </div>
                )}
              </div>
              <div className="category-card-body">
                <span className="category-card-name">
                  {publicProductSlug(product.slug) === "instagram-views-kaufen"
                    ? "Instagram Views kaufen"
                    : product.name}
                </span>
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
