/**
 * Blog-Autor: zentrale Daten für Autorenbox, Autorenseite und Schema.
 */

export const AUTHOR_SLUG = "moritz-sachmann";

export const BLOG_AUTHOR = {
  slug: AUTHOR_SLUG,
  name: "Moritz Sachmann",
  role: "Social-Media-Experte",
  image: "/icons/Autor-Moritz-clean.webp",
  /** 2–3 Sätze Expertise für Autorenbox und Autorenseite */
  bio: "Moritz beschäftigt sich seit mehreren Jahren mit Wachstumsstrategien für Instagram, TikTok und YouTube. Er analysiert Plattform-Trends und testet die Lieferqualität aller Pakete regelmäßig selbst.",
} as const;

export function getAuthorPagePath(): string {
  return `/autor/${AUTHOR_SLUG}`;
}
