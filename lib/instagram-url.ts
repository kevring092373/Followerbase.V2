/** Prüft Instagram-Beitragslinks (Posts, Reels, Karussells). */
export function isInstagramMediaUrl(value: string): boolean {
  const raw = value.trim();
  if (!raw) return false;
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProto);
    const host = url.hostname.replace(/^www\./i, "").replace(/^m\./i, "").toLowerCase();
    if (host !== "instagram.com" && host !== "instagr.am") return false;
    return /^\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/i.test(url.pathname);
  } catch {
    return false;
  }
}
