/**
 * Feste Meta-Titles für Produktseiten (≤60 Zeichen, Keyword vorn).
 * Überschreibt generierte „Name – Followerbase“-Titel.
 */
export const PRODUCT_PAGE_TITLES: Record<string, string> = {
  "facebook-post-likes-kaufen": "Facebook Post Likes kaufen ab 2,45 €: Mehr Engagement",
  "instagram-impressionen-kaufen": "Instagram Impressionen kaufen: Mehr Sichtbarkeit",
  "instagram-reel-views-kaufen": "Instagram Views kaufen ab 0,45 € | Followerbase",
  "instagram-views-kaufen": "Instagram Views kaufen ab 0,45 € | Followerbase",
  "reddit-follower-kaufen": "Reddit Follower kaufen: Social Proof ab 3,45 €",
  "snapchat-follower-kaufen": "Snapchat Follower kaufen: schnell, seriös & diskret",
  "telegram-gruppenmitglieder-kaufen": "Telegram Gruppenmitglieder kaufen: seriös & schnell",
  "telegram-post-views-kaufen": "Telegram Post Views kaufen ab 1,99 €: Mehr Sichtbarkeit",
  "threads-follower-kaufen": "Threads Follower kaufen: schnell, sicher & diskret",
  "threads-likes-kaufen": "Threads Likes kaufen ab 2,99 €: Mehr Reichweite",
  "tiktok-follower-kaufen": "TikTok Follower kaufen ab 1,29 €: seriös & diskret",
  "tiktok-likes-kaufen": "TikTok Likes kaufen: Mehr Reichweite für deine Videos",
  "tiktok-shares-kaufen": "TikTok Shares kaufen: Mehr Reichweite & Viralität",
  "youtube-likes-kaufen": "YouTube Likes kaufen ab 3,45 €: Mehr Engagement",
  "instagram-follower-kaufen": "Instagram Follower kaufen ab 0,99 €: seriös & diskret",
};

export function productPageTitle(slug: string): string | undefined {
  return PRODUCT_PAGE_TITLES[slug];
}

export const INSTAGRAM_VIEWS_CANONICAL_SLUG = "instagram-views-kaufen";
export const INSTAGRAM_VIEWS_LEGACY_SLUG = "instagram-reel-views-kaufen";

export function publicProductSlug(slug: string): string {
  return slug === INSTAGRAM_VIEWS_LEGACY_SLUG ? INSTAGRAM_VIEWS_CANONICAL_SLUG : slug;
}

export function catalogProductSlug(slug: string): string {
  return slug === INSTAGRAM_VIEWS_CANONICAL_SLUG ? INSTAGRAM_VIEWS_LEGACY_SLUG : slug;
}
