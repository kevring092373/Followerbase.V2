/**
 * Einzelproduktseite: Bild, Name, Kurzbeschreibung, Bestellblock, Produktbeschreibung (HTML).
 */
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductImageAlt } from "@/lib/products-data";
import { ProductOrderBlock } from "@/components/ProductOrderBlock";

type Props = { params: { slug: string } };

const defaultBullets = ["Schnelle Lieferung", "Sichere Zahlung", "Qualitätsgarantie"];

export async function generateMetadata({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Produkt – Followerbase" };
  const title = product.metaTitle ?? product.name;
  const description = product.metaDescription ?? undefined;
  return {
    title: `${title} – Followerbase`,
    description,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) notFound();

  const bullets = product.bullets?.length ? product.bullets : defaultBullets;

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

      <div className="product-layout">
        <div className="product-image-wrap">
          {product.image ? (
            product.image.startsWith("/") ? (
              <Image
                src={product.image}
                alt={getProductImageAlt(product.image, product.name)}
                width={400}
                height={400}
                className="product-image-img"
              />
            ) : (
              <img src={product.image} alt={getProductImageAlt(product.image, product.name)} className="product-image-img" />
            )
          ) : (
            <div className="product-image-placeholder" aria-hidden>
              <span className="product-image-placeholder-text">Bild</span>
            </div>
          )}
        </div>

        <div className="product-detail">
          <ProductOrderBlock
            productSlug={product.slug}
            quantities={product.quantities}
            pricesCents={product.pricesCents}
            productName={product.name}
            bullets={bullets}
            tiers={product.tiers}
          />
        </div>
      </div>

      {product.description && (
        <section className="product-description-section">
          <h2 className="product-description-heading">Produktbeschreibung</h2>
          <div
            className="product-description-html"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}
    </>
  );
}
