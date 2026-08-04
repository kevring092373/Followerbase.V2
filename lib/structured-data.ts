/**
 * Strukturierte Daten (schema.org / JSON-LD) für Google Rich Results.
 *
 * AggregateRating fehlt hier absichtlich: Bewertungs-Markup ohne echte, auf der Seite
 * sichtbare Bewertungen verstößt gegen die Google-Richtlinien und kann zu einer
 * manuellen Maßnahme führen. Wird ergänzt, sobald echte Bewertungen vorliegen.
 */
import { absoluteUrl, truncateDescription, SITE_NAME } from "@/lib/seo";
import { getProductDisplayName } from "@/lib/product-image-alt";
import type { Product } from "@/lib/products-data";
import type { Category } from "@/lib/categories";

const LOGO_PATH = "/icons/Followerbase%20Logo.png";
const ORGANIZATION_ID = `${absoluteUrl("/")}#organization`;

/** Angaben aus dem Impressum (Venus Management GbR). */
export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: "Venus Management GbR",
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(LOGO_PATH),
    },
    image: absoluteUrl(LOGO_PATH),
    description:
      "Follower, Likes und Views für Instagram, TikTok, YouTube und weitere Plattformen – schnelle Lieferung und sichere Zahlung.",
    email: "info@followerbase.de",
    telephone: "01786 718703",
    vatID: "DE361898179",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ulmenweg 15",
      postalCode: "51766",
      addressLocality: "Engelskirchen",
      addressCountry: "DE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "info@followerbase.de",
      telephone: "01786 718703",
      areaServed: "DE",
      availableLanguage: ["de"],
    },
  };
}

/**
 * Einstiegspreis in Cent – genau der Preis, den die Produktseite beim Laden anzeigt
 * (erste Standardmenge, bei Varianten die der ersten Variante). So stimmen
 * ausgezeichneter und strukturierter Preis immer überein.
 */
function getEntryPriceCents(product: Product): number | null {
  const prices = product.tiers?.length ? product.tiers[0]!.pricesCents : product.pricesCents;
  const price = prices?.[0];
  return typeof price === "number" && price >= 0 ? price : null;
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Bildpfade aus Supabase enthalten teils Leerzeichen ("/icons/Instagram Follower.png"),
 * teils sind sie bereits kodiert. Erst dekodieren, dann kodieren – so entsteht in beiden
 * Fällen genau eine gültige URL.
 */
function absoluteImageUrl(imagePath: string): string {
  if (!imagePath.startsWith("/")) return imagePath;
  const encoded = imagePath
    .split("/")
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
  return absoluteUrl(encoded);
}

export function buildProductSchema(
  product: Product,
  category?: Category
): Record<string, unknown> {
  const url = absoluteUrl(`/product/${product.slug}`);
  const priceCents = getEntryPriceCents(product);
  const image = product.image ? absoluteImageUrl(product.image) : undefined;

  const description = product.metaDescription?.trim()
    ? truncateDescription(product.metaDescription)
    : `${getProductDisplayName(product.name)} bei ${SITE_NAME} – faire Preise, schnelle Lieferung und sicherer Checkout.`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: getProductDisplayName(product.name),
    description,
    url,
    ...(image && { image: [image] }),
    ...(product.articleNumber && { sku: product.articleNumber }),
    ...(category && { category: category.name }),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    ...(priceCents !== null && {
      offers: {
        "@type": "Offer",
        url,
        price: formatPrice(priceCents),
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          "@id": ORGANIZATION_ID,
          name: SITE_NAME,
        },
      },
    }),
  };
}

export type BreadcrumbItem = {
  name: string;
  /** Pfad wie "/products/instagram". Beim letzten Eintrag (aktuelle Seite) weglassen. */
  path?: string;
};

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path && { item: absoluteUrl(item.path) }),
    })),
  };
}
