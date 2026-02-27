/**
 * Alt-Text für Produktbilder – nur diese Logik, ohne Node/Server-Imports.
 * Kann in Client-Komponenten (ProductCarousel, HomeProductCarousel) verwendet werden.
 */

/** Alt-Text: Dateiname ohne Endung, URL-dekodiert (z. B. „TikTok Likes kaufen“). */
export function getProductImageAlt(imagePath: string | undefined, fallback: string): string {
  if (!imagePath) return fallback;
  const filename = imagePath.split("/").pop() ?? "";
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  if (!withoutExt) return fallback;
  try {
    return decodeURIComponent(withoutExt) || fallback;
  } catch {
    return withoutExt || fallback;
  }
}
