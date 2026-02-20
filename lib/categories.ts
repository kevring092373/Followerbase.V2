/**
 * Kategorien und Produkte für Shop und Navigation.
 * Jedes Produkt gehört zu genau einer Kategorie.
 * Mengen/Preise sind Platzhalter (100, 200, 500 bzw. 1€, 2€, 5€) – können später ersetzt werden.
 */

export interface CategoryProduct {
  slug: string;
  name: string;
  /** Platzhalter-Mengen (z.B. 100, 200, 500) – später durch echte Daten ersetzen */
  quantities: number[];
  /** Preise in Cent pro Menge (Index entspricht quantities: 100→1€, 200→2€, 500→5€) */
  pricesCents: number[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  products: CategoryProduct[];
}

/** Einheitliche Platzhalter: Menge 100/200/500, Preis 1€/2€/5€ */
const PLACEHOLDER_QUANTITIES = [100, 200, 500];
const PLACEHOLDER_PRICES_CENTS = [100, 200, 500]; // 1€, 2€, 5€

function prod(slug: string, name: string): CategoryProduct {
  return { slug, name, quantities: PLACEHOLDER_QUANTITIES, pricesCents: PLACEHOLDER_PRICES_CENTS };
}

export const categories: Category[] = [
  {
    id: "instagram",
    name: "Instagram",
    slug: "instagram",
    products: [
      prod("instagram-follower-kaufen", "Instagram Follower"),
      prod("instagram-follower-tuerkisch-kaufen", "Instagram Follower Türkisch"),
      prod("instagram-follower-deutsch-kaufen", "Instagram Follower Deutsch"),
      prod("instagram-follower-blauer-haken-kaufen", "Instagram Follower Blauer Haken"),
      prod("instagram-follower-kostenlos-kaufen", "Instagram Follower Kostenlos"),
      prod("instagram-likes-kaufen", "Instagram Likes"),
      prod("instagram-likes-deutsch-kaufen", "Instagram Likes Deutsch"),
      prod("instagram-likes-tuerkisch-kaufen", "Instagram Likes Türkisch"),
      prod("instagram-kommentare-kaufen", "Instagram Kommentare"),
      prod("instagram-story-views-kaufen", "Instagram Story Views"),
      prod("instagram-impressionen-kaufen", "Instagram Impressionen"),
      prod("instagram-saves-kaufen", "Instagram Saves"),
      prod("instagram-reel-views-kaufen", "Instagram Reel Views"),
      prod("instagram-bundle-kaufen", "Instagram Bundle"),
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    slug: "tiktok",
    products: [
      prod("tiktok-follower-kaufen", "TikTok Follower"),
      prod("tiktok-likes-kaufen", "TikTok Likes"),
      prod("tiktok-saves-kaufen", "TikTok Saves"),
      prod("tiktok-shares-kaufen", "TikTok Shares"),
      prod("tiktok-views-kaufen", "TikTok Views"),
      prod("tiktok-follower-tuerkisch-kaufen", "TikTok Follower Türkisch"),
    ],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    slug: "snapchat",
    products: [
      prod("snapchat-follower-kaufen", "Snapchat Follower"),
      prod("snapchat-story-views-kaufen", "Snapchat Story Views"),
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    slug: "reddit",
    products: [
      prod("reddit-follower-kaufen", "Reddit Follower"),
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    slug: "telegram",
    products: [
      prod("telegram-gruppenmitglieder-kaufen", "Telegram Gruppenmitglieder"),
      prod("telegram-post-views-kaufen", "Telegram Post Views"),
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    slug: "facebook",
    products: [
      prod("facebook-follower-kaufen", "Facebook Follower"),
      prod("facebook-post-likes-kaufen", "Facebook Post Likes"),
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    slug: "youtube",
    products: [
      prod("youtube-follower-kaufen", "YouTube Follower"),
      prod("youtube-likes-kaufen", "YouTube Likes"),
      prod("youtube-views-kaufen", "YouTube Views"),
      prod("youtube-watchtime-kaufen", "YouTube Watchtime"),
    ],
  },
  {
    id: "threads",
    name: "Threads",
    slug: "threads",
    products: [
      prod("threads-follower-kaufen", "Threads Follower kaufen"),
      prod("threads-likes-kaufen", "Threads Likes kaufen"),
    ],
  },
];

/** Direkte Header-Links (z.B. Instagram/TikTok Follower & Likes). */
export const headerQuickLinks: { label: string; productSlug: string }[] = [
  { label: "Instagram Follower", productSlug: "instagram-follower-kaufen" },
  { label: "TikTok Follower", productSlug: "tiktok-follower-kaufen" },
  { label: "Instagram Likes", productSlug: "instagram-likes-kaufen" },
  { label: "TikTok Likes", productSlug: "tiktok-likes-kaufen" },
];

export function getProductBySlug(slug: string): CategoryProduct | undefined {
  for (const cat of categories) {
    const product = cat.products.find((p) => p.slug === slug);
    if (product) return product;
  }
  return undefined;
}

/** Kategorie zu einem Produkt-Slug (z. B. für Plattform-Logo). */
export function getCategoryByProductSlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.products.some((p) => p.slug === slug));
}
