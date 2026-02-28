/**
 * Alt-Text und Anzeigenamen für Produkte – ohne Node/Server-Imports.
 * Kann in Client- und Server-Komponenten verwendet werden.
 */

/** Anzeigename mit „ kaufen“, falls nicht schon vorhanden (z. B. „Instagram Follower kaufen“). */
export function getProductDisplayName(name: string): string {
  if (!name || !name.trim()) return name;
  const t = name.trimEnd();
  return t.endsWith(" kaufen") ? t : `${t} kaufen`;
}

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
