/**
 * Einzelproduktseite: Bild, Name, Kurzbeschreibung, Bestellblock, Produktbeschreibung (HTML).
 */
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductImageAlt, getAllProducts, getRelatedProducts } from "@/lib/products-data";
import { getProductDisplayName } from "@/lib/product-image-alt";
import { ProductOrderBlock } from "@/components/ProductOrderBlock";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ShareButtons } from "@/components/ShareButtons";
import { ProductDescriptionSection } from "@/components/ProductDescriptionSection";
import { ProductPaymentIcons } from "@/components/ProductPaymentIcons";
import { truncateDescription, truncateTitle, SITE_NAME } from "@/lib/seo";
import { categories } from "@/lib/categories";
import { JsonLd } from "@/components/JsonLd";
import {
  absoluteImageUrl,
  buildProductSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
} from "@/lib/structured-data";
import { extractProductFaqs, productCanonicalUrl } from "@/lib/product-seo";

type Props = { params: { slug: string } };

const defaultBullets = ["Schnelle Lieferung", "Sichere Zahlung", "Qualitätsgarantie"];

/** Statische Generierung: alle Produkt-URLs beim Build vorrendern */
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

/** Cache: Produktseiten stündlich neu validieren */
export const revalidate = 3600;

/** Meta-Titel: „kaufen“ anhängen, falls nicht schon enthalten. */
function productMetaTitle(name: string, metaTitle?: string): string {
  if (metaTitle?.trim()) return metaTitle.trim();
  return name.trimEnd().endsWith(" kaufen") ? name : `${name} kaufen`;
}

export async function generateMetadata({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Produkt", robots: { index: false, follow: true } };
  const displayName = productMetaTitle(product.name, product.metaTitle);
  const title = product.metaTitle?.trim()
    ? product.metaTitle.trim()
    : truncateTitle(`${displayName} – Followerbase`);
  const defaultDesc = `${displayName} bei Followerbase – faire Preise, schnelle Lieferung. Qualitätsgarantie & sicherer Checkout.`;
  const rawDesc = product.metaDescription?.trim() || defaultDesc;
  const description = truncateDescription(rawDesc);
  const url = productCanonicalUrl(product.slug);
  const imageUrl = product.image ? absoluteImageUrl(product.image) : absoluteImageUrl("/icons/Followerbase Logo.png");
  const ogImage = product.image
    ? { url: imageUrl, width: 400, height: 400, alt: displayName }
    : { url: imageUrl, width: 1200, height: 630, alt: SITE_NAME };
  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: url },
  };
}

export default async function ProductPage({ params }: Props) {
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const bullets = product.bullets?.length ? product.bullets : defaultBullets;

  let related = await getRelatedProducts(product.categoryId, product.slug, 12);
  if (related.length === 0) {
    related = (await getAllProducts())
      .filter((p) => p.slug !== product.slug)
      .slice(0, 12);
  }
  const otherProducts = related.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.image,
    pricesCents: p.pricesCents,
  }));
  const category = categories.find((c) => c.id === product.categoryId);
  const carouselTitle =
    category && otherProducts.length > 0
      ? `Weitere ${category.name}-Produkte`
      : "Weitere Produkte";
  const descriptionMode: "raw" = "raw";
  const productUrl = productCanonicalUrl(product.slug);
  const breadcrumbName = getProductDisplayName(product.name);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Startseite", path: "/" },
    ...(category ? [{ name: category.name, path: `/products/${category.slug}` }] : []),
    { name: breadcrumbName, path: `/product/${product.slug}` },
  ]);
  const faqSchema = buildFaqPageSchema(extractProductFaqs(product.description));

  return (
    <div className="product-page-wrap">
      <JsonLd data={buildProductSchema(product, category)} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <Link href="/products" className="product-back-link">
        ← Alle Produkte
      </Link>
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <ol className="product-breadcrumb-list">
          <li>
            <Link href="/">Startseite</Link>
          </li>
          {category && (
            <li>
              <span className="product-breadcrumb-sep" aria-hidden>/</span>
              <Link href={`/products/${category.slug}`}>{category.name}</Link>
            </li>
          )}
          <li>
            <span className="product-breadcrumb-sep" aria-hidden>/</span>
            <span className="product-breadcrumb-current" aria-current="page">
              {breadcrumbName}
            </span>
          </li>
        </ol>
      </nav>

      <header className="product-page-header">
        <h1 className="product-title product-title-page">{getProductDisplayName(product.name)}</h1>
        {product.articleNumber && (
          <p className="product-article-number" aria-label="Artikelnummer">
            Artikelnummer: {product.articleNumber}
          </p>
        )}
        <div className="product-trust-bar" role="list">
          {bullets.map((text, i) => (
            <span key={i} className="product-trust-badge" role="listitem">
              {text}
            </span>
          ))}
        </div>
      </header>

      <div className="product-order-row">
        <div className="product-order-section">
          <ProductOrderBlock
            productSlug={product.slug}
            quantities={product.quantities}
            pricesCents={product.pricesCents}
            productName={product.name}
            bullets={[]}
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
                sizes="(max-width: 768px) 220px, 260px"
                className="product-image-img"
                priority
              />
            ) : (
              <img src={product.image} alt={getProductImageAlt(product.image, product.name)} className="product-image-img" decoding="async" />
            )
          ) : (
            <div className="product-image-placeholder product-image-placeholder--small" aria-hidden>
              <span className="product-image-placeholder-text">Bild</span>
            </div>
          )}
          <ShareButtons
            url={productUrl}
            title={productMetaTitle(product.name, product.metaTitle)}
            text={product.metaDescription ?? undefined}
            iconOnly
            className="share-buttons--product"
          />
          <ProductPaymentIcons />
        </div>
      </div>

      {otherProducts.length > 0 && (
        <ProductCarousel products={otherProducts} title={carouselTitle} />
      )}

      {product.description ? (
        <ProductDescriptionSection html={product.description} mode={descriptionMode} />
      ) : null}
    </div>
  );
}
