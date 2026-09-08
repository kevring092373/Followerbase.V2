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
import { ProductContextualLinks } from "@/components/ProductContextualLinks";
import { truncateDescription, truncateTitle, SITE_NAME } from "@/lib/seo";
import { categories } from "@/lib/categories";
import { JsonLd } from "@/components/JsonLd";
import {
  absoluteImageUrl,
  buildProductSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
} from "@/lib/structured-data";
import {
  extractProductFaqs,
  productCanonicalUrl,
  splitProductDescription,
  PRODUCT_ORDER_ANCHOR_ID,
} from "@/lib/product-seo";
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import {
  YOUTUBE_VIEWS_DESCRIPTION,
  YOUTUBE_VIEWS_IMAGE,
  YOUTUBE_VIEWS_IMAGE_ALT,
  YOUTUBE_VIEWS_TITLE,
  isYoutubeViewsProduct,
  prepareYoutubeViewsDescriptionHtml,
} from "@/lib/youtube-views-seo";
import {
  INSTAGRAM_LIKES_DESCRIPTION,
  INSTAGRAM_LIKES_IMAGE_ALT,
  INSTAGRAM_LIKES_TITLE,
  isInstagramLikesProduct,
  prepareInstagramLikesDescriptionHtml,
} from "@/lib/instagram-likes-seo";
import {
  INSTAGRAM_SAVES_DESCRIPTION,
  INSTAGRAM_SAVES_IMAGE_ALT,
  INSTAGRAM_SAVES_TITLE,
  isInstagramSavesProduct,
  prepareInstagramSavesDescriptionHtml,
} from "@/lib/instagram-saves-seo";
import {
  TIKTOK_SAVES_DESCRIPTION,
  TIKTOK_SAVES_TITLE,
  isTiktokSavesProduct,
  prepareTiktokSavesDescriptionHtml,
} from "@/lib/tiktok-saves-seo";
import {
  INSTAGRAM_FOLLOWER_DEUTSCH_BULLETS,
  INSTAGRAM_FOLLOWER_DEUTSCH_DESCRIPTION,
  INSTAGRAM_FOLLOWER_DEUTSCH_H1,
  INSTAGRAM_FOLLOWER_DEUTSCH_IMAGE_ALT,
  INSTAGRAM_FOLLOWER_DEUTSCH_TITLE,
  isInstagramFollowerDeutschProduct,
  prepareInstagramFollowerDeutschDescriptionHtml,
} from "@/lib/instagram-follower-deutsch-seo";
import {
  INSTAGRAM_FOLLOWER_TUERKISCH_BULLETS,
  INSTAGRAM_FOLLOWER_TUERKISCH_DESCRIPTION,
  INSTAGRAM_FOLLOWER_TUERKISCH_H1,
  INSTAGRAM_FOLLOWER_TUERKISCH_IMAGE_ALT,
  INSTAGRAM_FOLLOWER_TUERKISCH_TITLE,
  isInstagramFollowerTuerkischProduct,
  prepareInstagramFollowerTuerkischDescriptionHtml,
} from "@/lib/instagram-follower-tuerkisch-seo";
import {
  INSTAGRAM_LIKES_DEUTSCH_BULLETS,
  INSTAGRAM_LIKES_DEUTSCH_DESCRIPTION,
  INSTAGRAM_LIKES_DEUTSCH_EMPTY_TARGET_ERROR,
  INSTAGRAM_LIKES_DEUTSCH_H1,
  INSTAGRAM_LIKES_DEUTSCH_IMAGE_ALT,
  INSTAGRAM_LIKES_DEUTSCH_INVALID_TARGET_ERROR,
  INSTAGRAM_LIKES_DEUTSCH_TARGET_HINT,
  INSTAGRAM_LIKES_DEUTSCH_TITLE,
  isInstagramLikesDeutschProduct,
  prepareInstagramLikesDeutschDescriptionHtml,
} from "@/lib/instagram-likes-deutsch-seo";
import { InstagramLikesAnchorScroll } from "@/components/InstagramLikesAnchorScroll";
import { InstagramSavesAnchorScroll } from "@/components/InstagramSavesAnchorScroll";
import { TiktokSavesAnchorScroll } from "@/components/TiktokSavesAnchorScroll";
import { InstagramFollowerDeutschAnchorScroll } from "@/components/InstagramFollowerDeutschAnchorScroll";
import { InstagramFollowerTuerkischAnchorScroll } from "@/components/InstagramFollowerTuerkischAnchorScroll";
import { InstagramLikesDeutschAnchorScroll } from "@/components/InstagramLikesDeutschAnchorScroll";
import { TiktokFollowerTuerkischAnchorScroll } from "@/components/TiktokFollowerTuerkischAnchorScroll";
import {
  TIKTOK_FOLLOWER_TUERKISCH_BULLETS,
  TIKTOK_FOLLOWER_TUERKISCH_DESCRIPTION,
  TIKTOK_FOLLOWER_TUERKISCH_EMPTY_TARGET_ERROR,
  TIKTOK_FOLLOWER_TUERKISCH_H1,
  TIKTOK_FOLLOWER_TUERKISCH_IMAGE_ALT,
  TIKTOK_FOLLOWER_TUERKISCH_INVALID_TARGET_ERROR,
  TIKTOK_FOLLOWER_TUERKISCH_TARGET_HINT,
  TIKTOK_FOLLOWER_TUERKISCH_TITLE,
  isTiktokFollowerTuerkischProduct,
  prepareTiktokFollowerTuerkischDescriptionHtml,
} from "@/lib/tiktok-follower-tuerkisch-seo";
import likesStyles from "./instagram-likes.module.css";
import savesStyles from "./instagram-saves.module.css";
import tiktokSavesStyles from "./tiktok-saves.module.css";
import deutschStyles from "./instagram-follower-deutsch.module.css";
import tuerkischStyles from "./instagram-follower-tuerkisch.module.css";
import likesDeutschStyles from "./instagram-likes-deutsch.module.css";
import tiktokTuerkischStyles from "./tiktok-follower-tuerkisch.module.css";
import type { Product } from "@/lib/products-data";

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

function youtubeViewsProduct(product: Product): Product {
  return {
    ...product,
    image: YOUTUBE_VIEWS_IMAGE,
    metaTitle: YOUTUBE_VIEWS_TITLE,
    metaDescription: YOUTUBE_VIEWS_DESCRIPTION,
    description: prepareYoutubeViewsDescriptionHtml(product.description),
  };
}

function instagramLikesProduct(product: Product): Product {
  return {
    ...product,
    metaTitle: INSTAGRAM_LIKES_TITLE,
    metaDescription: INSTAGRAM_LIKES_DESCRIPTION,
    description: prepareInstagramLikesDescriptionHtml(product.description, product),
  };
}

function instagramSavesProduct(product: Product): Product {
  return {
    ...product,
    metaTitle: INSTAGRAM_SAVES_TITLE,
    metaDescription: INSTAGRAM_SAVES_DESCRIPTION,
    description: prepareInstagramSavesDescriptionHtml(product.description, product),
  };
}

function tiktokSavesProduct(product: Product): Product {
  return {
    ...product,
    metaTitle: TIKTOK_SAVES_TITLE,
    metaDescription: TIKTOK_SAVES_DESCRIPTION,
    description: prepareTiktokSavesDescriptionHtml(product.description, product),
  };
}

function instagramFollowerDeutschProduct(product: Product): Product {
  return {
    ...product,
    metaTitle: INSTAGRAM_FOLLOWER_DEUTSCH_TITLE,
    metaDescription: INSTAGRAM_FOLLOWER_DEUTSCH_DESCRIPTION,
    bullets: [...INSTAGRAM_FOLLOWER_DEUTSCH_BULLETS],
    description: prepareInstagramFollowerDeutschDescriptionHtml(product.description, product),
  };
}

function instagramFollowerTuerkischProduct(product: Product): Product {
  return {
    ...product,
    metaTitle: INSTAGRAM_FOLLOWER_TUERKISCH_TITLE,
    metaDescription: INSTAGRAM_FOLLOWER_TUERKISCH_DESCRIPTION,
    bullets: [...INSTAGRAM_FOLLOWER_TUERKISCH_BULLETS],
    description: prepareInstagramFollowerTuerkischDescriptionHtml(product.description, product),
  };
}

function instagramLikesDeutschProduct(product: Product): Product {
  return {
    ...product,
    metaTitle: INSTAGRAM_LIKES_DEUTSCH_TITLE,
    metaDescription: INSTAGRAM_LIKES_DEUTSCH_DESCRIPTION,
    bullets: [...INSTAGRAM_LIKES_DEUTSCH_BULLETS],
    description: prepareInstagramLikesDeutschDescriptionHtml(product.description, product),
  };
}

function tiktokFollowerTuerkischProduct(product: Product): Product {
  return {
    ...product,
    metaTitle: TIKTOK_FOLLOWER_TUERKISCH_TITLE,
    metaDescription: TIKTOK_FOLLOWER_TUERKISCH_DESCRIPTION,
    bullets: [...TIKTOK_FOLLOWER_TUERKISCH_BULLETS],
    description: prepareTiktokFollowerTuerkischDescriptionHtml(product.description, product),
  };
}

function withPageSeo(product: Product): Product {
  if (isYoutubeViewsProduct(product.slug)) return youtubeViewsProduct(product);
  if (isInstagramLikesProduct(product.slug)) return instagramLikesProduct(product);
  if (isInstagramSavesProduct(product.slug)) return instagramSavesProduct(product);
  if (isTiktokSavesProduct(product.slug)) return tiktokSavesProduct(product);
  if (isInstagramFollowerDeutschProduct(product.slug)) return instagramFollowerDeutschProduct(product);
  if (isInstagramFollowerTuerkischProduct(product.slug)) return instagramFollowerTuerkischProduct(product);
  if (isInstagramLikesDeutschProduct(product.slug)) return instagramLikesDeutschProduct(product);
  if (isTiktokFollowerTuerkischProduct(product.slug)) return tiktokFollowerTuerkischProduct(product);
  return product;
}

const indexFollowRobots = {
  index: true,
  follow: true,
  nocache: false,
  googleBot: {
    index: true,
    follow: true,
  },
};

export async function generateMetadata({ params }: Props) {
  const raw = await getProductBySlug(params.slug);
  if (!raw) return { title: "Produkt", robots: { index: false, follow: true } };
  const product = withPageSeo(raw);
  const displayName = productMetaTitle(product.name, product.metaTitle);
  const likesPage = isInstagramLikesProduct(product.slug);
  const savesPage = isInstagramSavesProduct(product.slug);
  const tiktokSavesPage = isTiktokSavesProduct(product.slug);
  const deutschPage = isInstagramFollowerDeutschProduct(product.slug);
  const tuerkischPage = isInstagramFollowerTuerkischProduct(product.slug);
  const likesDeutschPage = isInstagramLikesDeutschProduct(product.slug);
  const tiktokTuerkischPage = isTiktokFollowerTuerkischProduct(product.slug);
  const pinnedTitlePage =
    isYoutubeViewsProduct(product.slug) ||
    likesPage ||
    savesPage ||
    tiktokSavesPage ||
    deutschPage ||
    tuerkischPage ||
    likesDeutschPage ||
    tiktokTuerkischPage;
  const title = isYoutubeViewsProduct(product.slug)
    ? YOUTUBE_VIEWS_TITLE
    : likesPage
      ? INSTAGRAM_LIKES_TITLE
      : savesPage
        ? INSTAGRAM_SAVES_TITLE
        : tiktokSavesPage
          ? TIKTOK_SAVES_TITLE
          : deutschPage
            ? INSTAGRAM_FOLLOWER_DEUTSCH_TITLE
            : tuerkischPage
              ? INSTAGRAM_FOLLOWER_TUERKISCH_TITLE
              : likesDeutschPage
                ? INSTAGRAM_LIKES_DEUTSCH_TITLE
                : tiktokTuerkischPage
                  ? TIKTOK_FOLLOWER_TUERKISCH_TITLE
    : product.metaTitle?.trim()
      ? product.metaTitle.trim()
      : truncateTitle(`${displayName} – Followerbase`);
  const defaultDesc = `${displayName} bei Followerbase – faire Preise, schnelle Lieferung. Qualitätsgarantie & sicherer Checkout.`;
  const rawDesc = product.metaDescription?.trim() || defaultDesc;
  const description = isYoutubeViewsProduct(product.slug)
    ? YOUTUBE_VIEWS_DESCRIPTION
    : likesPage
      ? INSTAGRAM_LIKES_DESCRIPTION
      : savesPage
        ? INSTAGRAM_SAVES_DESCRIPTION
        : tiktokSavesPage
          ? TIKTOK_SAVES_DESCRIPTION
          : deutschPage
            ? INSTAGRAM_FOLLOWER_DEUTSCH_DESCRIPTION
            : tuerkischPage
              ? INSTAGRAM_FOLLOWER_TUERKISCH_DESCRIPTION
              : likesDeutschPage
                ? INSTAGRAM_LIKES_DEUTSCH_DESCRIPTION
                : tiktokTuerkischPage
                  ? TIKTOK_FOLLOWER_TUERKISCH_DESCRIPTION
    : truncateDescription(rawDesc);
  const url = productCanonicalUrl(product.slug);
  const imageUrl = product.image ? absoluteImageUrl(product.image) : absoluteImageUrl("/icons/Followerbase Logo.png");
  const ogImage = product.image
    ? {
        url: imageUrl,
        width: 400,
        height: 400,
        alt: isYoutubeViewsProduct(product.slug)
          ? YOUTUBE_VIEWS_IMAGE_ALT
          : likesPage
            ? INSTAGRAM_LIKES_IMAGE_ALT
            : savesPage
              ? INSTAGRAM_SAVES_IMAGE_ALT
              : deutschPage
                ? INSTAGRAM_FOLLOWER_DEUTSCH_IMAGE_ALT
                : tuerkischPage
                  ? INSTAGRAM_FOLLOWER_TUERKISCH_IMAGE_ALT
                  : likesDeutschPage
                    ? INSTAGRAM_LIKES_DEUTSCH_IMAGE_ALT
                    : tiktokTuerkischPage
                      ? TIKTOK_FOLLOWER_TUERKISCH_IMAGE_ALT
              : displayName,
      }
    : { url: imageUrl, width: 1200, height: 630, alt: SITE_NAME };
  return {
    title: pinnedTitlePage ? { absolute: title } : title,
    description,
    robots: indexFollowRobots,
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
  const raw = await getProductBySlug(slug);

  if (!raw) notFound();

  const product = withPageSeo(raw);
  const bullets = product.bullets?.length ? product.bullets : defaultBullets;
  const viewsPage = isYoutubeViewsProduct(product.slug);
  const likesPage = isInstagramLikesProduct(product.slug);
  const savesPage = isInstagramSavesProduct(product.slug);
  const tiktokSavesPage = isTiktokSavesProduct(product.slug);
  const deutschPage = isInstagramFollowerDeutschProduct(product.slug);
  const tuerkischPage = isInstagramFollowerTuerkischProduct(product.slug);
  const likesDeutschPage = isInstagramLikesDeutschProduct(product.slug);
  const tiktokTuerkischPage = isTiktokFollowerTuerkischProduct(product.slug);
  const structuredProductPage =
    likesPage || savesPage || deutschPage || tuerkischPage || likesDeutschPage || tiktokTuerkischPage;
  const editorialBlockPage = structuredProductPage || tiktokSavesPage;
  const OrderSectionTag = structuredProductPage ? "section" : "div";
  const productImage = product.image;
  const productImageAlt = viewsPage
    ? YOUTUBE_VIEWS_IMAGE_ALT
    : likesPage
      ? INSTAGRAM_LIKES_IMAGE_ALT
      : savesPage
        ? INSTAGRAM_SAVES_IMAGE_ALT
        : deutschPage
          ? INSTAGRAM_FOLLOWER_DEUTSCH_IMAGE_ALT
          : tuerkischPage
            ? INSTAGRAM_FOLLOWER_TUERKISCH_IMAGE_ALT
            : likesDeutschPage
              ? INSTAGRAM_LIKES_DEUTSCH_IMAGE_ALT
              : tiktokTuerkischPage
                ? TIKTOK_FOLLOWER_TUERKISCH_IMAGE_ALT
      : getProductImageAlt(productImage, product.name);

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
  const descriptionParts = editorialBlockPage
    ? null
    : product.description
      ? splitProductDescription(product.description)
      : null;
  const productUrl = productCanonicalUrl(product.slug);
  const breadcrumbName = getProductDisplayName(product.name);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Startseite", path: "/" },
    ...(category ? [{ name: category.name, path: `/products/${category.slug}` }] : []),
    { name: breadcrumbName, path: `/product/${product.slug}` },
  ]);
  const faqSchema = buildFaqPageSchema(extractProductFaqs(product.description));

  const pageClassName = [
    "product-page-wrap",
    likesPage ? `${likesStyles.page} instagram-likes-page` : "",
    savesPage ? `${savesStyles.page} instagram-saves-page` : "",
    tiktokSavesPage ? `${tiktokSavesStyles.page} tiktok-saves-page` : "",
    deutschPage ? `${deutschStyles.page} instagram-follower-deutsch-page` : "",
    tuerkischPage ? `${tuerkischStyles.page} instagram-follower-tuerkisch-page` : "",
    likesDeutschPage ? `${likesDeutschStyles.page} instagram-likes-deutsch-page` : "",
    tiktokTuerkischPage ? `${tiktokTuerkischStyles.page} tiktok-follower-tuerkisch-page` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={pageClassName}>
      {likesPage ? <InstagramLikesAnchorScroll /> : null}
      {savesPage ? <InstagramSavesAnchorScroll /> : null}
      {tiktokSavesPage ? <TiktokSavesAnchorScroll /> : null}
      {deutschPage ? <InstagramFollowerDeutschAnchorScroll /> : null}
      {tuerkischPage ? <InstagramFollowerTuerkischAnchorScroll /> : null}
      {likesDeutschPage ? <InstagramLikesDeutschAnchorScroll /> : null}
      {tiktokTuerkischPage ? <TiktokFollowerTuerkischAnchorScroll /> : null}
      <JsonLd
        data={buildProductSchema(
          product,
          category,
          likesDeutschPage || tiktokTuerkischPage ? { defaultPackageOffer: true } : undefined
        )}
      />
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
        <h1
          className="product-title product-title-page"
          id={
            likesPage
              ? "instagram-likes-titel"
              : savesPage
                ? "instagram-saves-titel"
                : deutschPage
                  ? "instagram-follower-deutsch-titel"
                  : tuerkischPage
                    ? "instagram-follower-tuerkisch-titel"
                    : likesDeutschPage
                      ? "instagram-likes-deutsch-titel"
                      : tiktokTuerkischPage
                        ? "tiktok-follower-tuerkisch-titel"
                : undefined
          }
        >
          {deutschPage
            ? INSTAGRAM_FOLLOWER_DEUTSCH_H1
            : tuerkischPage
              ? INSTAGRAM_FOLLOWER_TUERKISCH_H1
              : likesDeutschPage
                ? INSTAGRAM_LIKES_DEUTSCH_H1
                : tiktokTuerkischPage
                  ? TIKTOK_FOLLOWER_TUERKISCH_H1
              : getProductDisplayName(product.name)}
        </h1>
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
        <OrderSectionTag
          className="product-order-section"
          id={PRODUCT_ORDER_ANCHOR_ID}
          {...(likesPage
            ? { "aria-labelledby": "instagram-likes-titel" }
            : savesPage
              ? { "aria-labelledby": "instagram-saves-titel" }
              : deutschPage
                ? { "aria-labelledby": "instagram-follower-deutsch-titel" }
                : tuerkischPage
                  ? { "aria-labelledby": "instagram-follower-tuerkisch-titel" }
                  : likesDeutschPage
                    ? { "aria-labelledby": "instagram-likes-deutsch-titel" }
                    : tiktokTuerkischPage
                      ? { "aria-labelledby": "tiktok-follower-tuerkisch-titel" }
              : {})}
        >
          {viewsPage || likesPage || savesPage || deutschPage || tuerkischPage || likesDeutschPage || tiktokTuerkischPage ? (
            <>
              <p className="product-availability">Verfügbar – Lieferung nach Bestellung</p>
              <noscript>
                <ul className="product-packages-ssr">
                  {product.quantities.map((qty, i) => (
                    <li key={qty}>
                      {formatQuantity(qty)} – {formatEuroFromCents(product.pricesCents[i] ?? 0)}
                    </li>
                  ))}
                </ul>
              </noscript>
            </>
          ) : null}
          <ProductOrderBlock
            productSlug={product.slug}
            quantities={product.quantities}
            pricesCents={product.pricesCents}
            productName={product.name}
            bullets={[]}
            tiers={product.tiers}
            showPackagePrices={
              viewsPage || likesPage || savesPage || deutschPage || tuerkischPage || likesDeutschPage || tiktokTuerkischPage
            }
            targetAsUrl={likesPage || savesPage || likesDeutschPage}
            validateInstagramMediaUrl={likesPage || savesPage || likesDeutschPage}
            validateTikTokProfile={tiktokTuerkischPage}
            neutralizeTikTokGrowthClaim={tiktokTuerkischPage}
            sliderMinFromPackages={likesDeutschPage || tiktokTuerkischPage}
            restrictToListedQuantities={likesDeutschPage || tiktokTuerkischPage}
            targetHint={
              likesDeutschPage
                ? INSTAGRAM_LIKES_DEUTSCH_TARGET_HINT
                : tiktokTuerkischPage
                  ? TIKTOK_FOLLOWER_TUERKISCH_TARGET_HINT
                  : undefined
            }
            emptyTargetError={
              likesDeutschPage
                ? INSTAGRAM_LIKES_DEUTSCH_EMPTY_TARGET_ERROR
                : tiktokTuerkischPage
                  ? TIKTOK_FOLLOWER_TUERKISCH_EMPTY_TARGET_ERROR
                  : undefined
            }
            invalidTargetError={
              likesDeutschPage
                ? INSTAGRAM_LIKES_DEUTSCH_INVALID_TARGET_ERROR
                : tiktokTuerkischPage
                  ? TIKTOK_FOLLOWER_TUERKISCH_INVALID_TARGET_ERROR
                  : undefined
            }
            targetInputId={
              likesPage
                ? "instagram-likes-beitragslink"
                : savesPage
                  ? "instagram-saves-beitragslink"
                  : deutschPage
                    ? "instagram-follower-deutsch-ziel"
                    : tuerkischPage
                      ? "instagram-follower-tuerkisch-ziel"
                      : likesDeutschPage
                        ? "instagram-likes-deutsch-beitragslink"
                        : tiktokTuerkischPage
                          ? "tiktok-follower-tuerkisch-ziel"
                  : "product-target"
            }
            quantitySliderId={
              likesPage
                ? "instagram-likes-quantity-slider"
                : savesPage
                  ? "instagram-saves-quantity-slider"
                  : deutschPage
                    ? "instagram-follower-deutsch-quantity-slider"
                    : tuerkischPage
                      ? "instagram-follower-tuerkisch-quantity-slider"
                      : likesDeutschPage
                        ? "instagram-likes-deutsch-quantity-slider"
                        : tiktokTuerkischPage
                          ? "tiktok-follower-tuerkisch-quantity-slider"
                  : "product-quantity-slider"
            }
          />
        </OrderSectionTag>
        <div className="product-order-section-image">
          {productImage ? (
            productImage.startsWith("/") ? (
              <Image
                src={productImage}
                alt={productImageAlt}
                width={400}
                height={400}
                sizes="(max-width: 768px) 220px, 260px"
                className="product-image-img"
                priority
              />
            ) : (
              <img src={productImage} alt={productImageAlt} className="product-image-img" width={400} height={400} decoding="async" />
            )
          ) : (
            <div className="product-image-placeholder product-image-placeholder--small" aria-hidden>
              <span className="product-image-placeholder-text">Bild</span>
            </div>
          )}
        </div>
      </div>

      <section className="product-assurance" aria-label="Zahlungsarten und Vorteile">
        <ProductPaymentIcons />
        <ul className="product-assurance-list">
          {bullets.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </section>

      <ProductContextualLinks slug={product.slug} />

      {editorialBlockPage && product.description ? (
        <ProductDescriptionSection html={product.description} mode={descriptionMode} />
      ) : descriptionParts ? (
        <ProductDescriptionSection html={descriptionParts.summary} mode={descriptionMode} />
      ) : null}

      {otherProducts.length > 0 && (
        <ProductCarousel
          products={otherProducts}
          title={carouselTitle}
          prevLabel={
            likesPage || savesPage || deutschPage || tuerkischPage || likesDeutschPage
              ? "Weitere Instagram-Produkte: vorherige"
              : undefined
          }
          nextLabel={
            likesPage || savesPage || deutschPage || tuerkischPage || likesDeutschPage
              ? "Weitere Instagram-Produkte: nächste"
              : undefined
          }
          respectReducedMotion={
            likesPage || savesPage || deutschPage || tuerkischPage || likesDeutschPage || tiktokTuerkischPage
          }
        />
      )}

      {editorialBlockPage ? null : descriptionParts ? (
        <ProductDescriptionSection html={descriptionParts.rest} mode={descriptionMode} />
      ) : product.description ? (
        <ProductDescriptionSection html={product.description} mode={descriptionMode} />
      ) : null}

      <ShareButtons
        url={productUrl}
        title={productMetaTitle(product.name, product.metaTitle)}
        text={product.metaDescription ?? undefined}
        iconOnly
        className="share-buttons--product"
      />
    </div>
  );
}
