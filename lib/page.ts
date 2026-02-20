/**
 * Eigene Seiten (CMS): URL + Titel + HTML-Inhalt + optionale Meta-Tags.
 * Werden unter /p/[slug] angezeigt.
 */

export interface Page {
  /** URL-Teil, z. B. "ueber-uns" → /p/ueber-uns */
  slug: string;
  /** Seitentitel (Überschrift) */
  title: string;
  /** HTML-Inhalt der Seite */
  content: string;
  /** Meta-Titel (SEO) */
  metaTitle?: string;
  /** Meta-Beschreibung (SEO) */
  metaDescription?: string;
}
