/**
 * Blog-Autor: zentrale Daten für Autorenbox, Autorenseite und Schema.
 */

export const AUTHOR_SLUG = "moritz-sachmann";

export const BLOG_AUTHOR = {
  slug: AUTHOR_SLUG,
  name: "Moritz Sachmann",
  role: "Social Media Experte",
  image: "/icons/Autor Moritz.webp",
  /** 2–3 Sätze Expertise für Autorenbox und Autorenseite */
  bio: "Langjährige Erfahrung mit Reichweitenaufbau und Community-Management für Instagram, TikTok und YouTube. Unterstützt Creator und Marken dabei, organisch und strategisch zu wachsen.",
} as const;

export function getAuthorPagePath(): string {
  return `/autor/${AUTHOR_SLUG}`;
}
