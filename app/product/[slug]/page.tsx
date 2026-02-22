/**
 * Einzelproduktseite: Bild, Name, Kurzbeschreibung, Bestellblock, Produktbeschreibung (HTML).
 */
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductImageAlt, getProductsByCategoryId, getAllProducts } from "@/lib/products-data";
import { ProductOrderBlock } from "@/components/ProductOrderBlock";
import { ProductCarousel } from "@/components/ProductCarousel";
import { absoluteUrl, truncateDescription, stripDocumentHeadAndViewport } from "@/lib/seo";
import { categories } from "@/lib/categories";

type Props = { params: { slug: string } };

const defaultBullets = ["Schnelle Lieferung", "Sichere Zahlung", "Qualitätsgarantie"];

export async function generateMetadata({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Produkt" };
  const title = product.metaTitle ?? product.name;
  const rawDesc = product.metaDescription ?? `${product.name} bei Followerbase – faire Preise, schnelle Lieferung.`;
  const description = truncateDescription(rawDesc);
  const url = absoluteUrl(`/product/${product.slug}`);
  const image = product.image?.startsWith("/") ? absoluteUrl(product.image) : undefined;
  return {
    title,
    description,
    openGraph: {
      title: `${title} – Followerbase`,
      description,
      url,
      type: "website",
      images: image ? [{ url: image, width: 400, height: 400, alt: product.name }] : undefined,
    },
    twitter: { card: "summary", title: `${title} – Followerbase`, description },
    alternates: { canonical: url },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) notFound();

  const bullets = product.bullets?.length ? product.bullets : defaultBullets;

  const categoryProducts = await getProductsByCategoryId(product.categoryId);
  let otherProducts = categoryProducts
    .filter((p) => p.slug !== product.slug)
    .map((p) => ({ slug: p.slug, name: p.name, image: p.image, pricesCents: p.pricesCents }));
  if (otherProducts.length === 0) {
    otherProducts = (await getAllProducts())
      .filter((p) => p.slug !== product.slug)
      .slice(0, 12)
      .map((p) => ({ slug: p.slug, name: p.name, image: p.image, pricesCents: p.pricesCents }));
  }
  const category = categories.find((c) => c.id === product.categoryId);
  const carouselTitle =
    otherProducts.length && category && otherProducts.length <= categoryProducts.length - 1
      ? `Weitere ${category.name}-Produkte`
      : "Weitere Produkte";

  return (
    <>
      <Link
        href="/products"
        className="text-muted"
        style={{ marginBottom: "1rem", display: "inline-block", fontSize: "0.9375rem" }}
      >
        ← Alle Produkte
      </Link>

      <h1 className="product-title product-title-page">{product.name}</h1>
      {product.articleNumber && (
        <p className="product-article-number" aria-label="Artikelnummer">
          Artikelnummer: {product.articleNumber}
        </p>
      )}

      <div className="product-order-row">
        <div className="product-order-section">
          <ProductOrderBlock
            productSlug={product.slug}
            quantities={product.quantities}
            pricesCents={product.pricesCents}
            productName={product.name}
            bullets={bullets}
            tiers={product.tiers}
          />
        </div>
        <div className="product-order-section-image">
          {product.image ? (
            product.image.startsWith("/") ? (
              <Image
                src={product.image}
                alt={getProductImageAlt(product.image, product.name)}
                width={260}
                height={260}
                className="product-image-img"
              />
            ) : (
              <img src={product.image} alt={getProductImageAlt(product.image, product.name)} className="product-image-img" />
            )
          ) : (
            <div className="product-image-placeholder product-image-placeholder--small" aria-hidden>
              <span className="product-image-placeholder-text">Bild</span>
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <section className="product-description-section">
          <div
            className="product-description-html"
            dangerouslySetInnerHTML={{ __html: stripDocumentHeadAndViewport(product.description) }}
          />
        </section>
      )}

      {otherProducts.length > 0 && (
        <ProductCarousel products={otherProducts} title={carouselTitle} />
      )}
    </>
  );
}
