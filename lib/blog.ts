/**
 * Blog: Nur URL (Slug) + Bezeichnung für die Liste + voller HTML-Seiteninhalt.
 */

export interface BlogPost {
  /** URL-Teil, z. B. "mein-beitrag" → /blog/mein-beitrag */
  slug: string;
  /** Anzeige in der Blog-Übersicht (Link-Text) */
  title: string;
  /** Kurzbeschreibung für die Blog-Übersicht */
  excerpt?: string;
  /** Vollständiger HTML-Code der Seite */
  content: string;
  /** Optional: für Sortierung in der Liste (YYYY-MM-DD) */
  date?: string;
  /** Meta-Titel (SEO), z. B. für <title> */
  metaTitle?: string;
  /** Meta-Beschreibung (SEO), z. B. für <meta name="description"> */
  metaDescription?: string;
  /** Beitragsbild (URL oder Pfad, z. B. /uploads/blog/xyz.jpg) – für die Blog-Übersicht */
  image?: string;
}
