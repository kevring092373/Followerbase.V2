/**
 * Einzelproduktseite: Bild, Name, Kurzbeschreibung, Bestellblock, Produktbeschreibung (HTML).
 */
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductImageAlt, getAllProducts } from "@/lib/products-data";
import { getProductDisplayName } from "@/lib/product-image-alt";
import { ProductOrderBlock } from "@/components/ProductOrderBlock";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ShareButtons } from "@/components/ShareButtons";
import { ProductDescriptionSection } from "@/components/ProductDescriptionSection";
import { ProductPaymentIcons } from "@/components/ProductPaymentIcons";
import { absoluteUrl, truncateDescription } from "@/lib/seo";
import { categories } from "@/lib/categories";

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
  if (!product) return { title: "Produkt" };
  const title = productMetaTitle(product.name, product.metaTitle);
  const defaultDesc = `${product.name} kaufen bei Followerbase – faire Preise, schnelle Lieferung. Qualitätsgarantie & sicherer Checkout.`;
  const rawDesc = product.metaDescription ?? defaultDesc;
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
  const slug = params.slug;
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getAllProducts(),
  ]);

  if (!product) notFound();

  const bullets = product.bullets?.length ? product.bullets : defaultBullets;

  const categoryProducts = allProducts.filter((p) => p.categoryId === product.categoryId);
  let otherProducts = categoryProducts
    .filter((p) => p.slug !== product.slug)
    .map((p) => ({ slug: p.slug, name: p.name, image: p.image, pricesCents: p.pricesCents }));
  if (otherProducts.length === 0) {
    otherProducts = allProducts
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
    <div className="product-page-wrap">
      <Link href="/products" className="product-back-link">
        ← Alle Produkte
      </Link>
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <ol className="product-breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/" itemProp="item">
              <span itemProp="name">Startseite</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          {category && (
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="product-breadcrumb-sep" aria-hidden>/</span>
              <Link href={`/products/${category.slug}`} itemProp="item">
                <span itemProp="name">{category.name}</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
          )}
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span className="product-breadcrumb-sep" aria-hidden>/</span>
            <span className="product-breadcrumb-current" itemProp="name" aria-current="page">
              {product.name}
            </span>
            <meta itemProp="position" content={category ? "3" : "2"} />
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
            url={absoluteUrl(`/product/${product.slug}`)}
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
        <ProductDescriptionSection html={product.description} />
      ) : null}
    </div>
  );
}
