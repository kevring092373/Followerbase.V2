/** Prüft TikTok-Profilziel: @Nutzername oder Profillink, keine Videos/Hashtags/Shortlinks. */
const USERNAME = /^@?[A-Za-z0-9._]{2,24}$/;

export function isTikTokProfileTarget(value: string): boolean {
  const raw = value.trim();
  if (!raw) return false;
  if (!raw.includes("/") && USERNAME.test(raw)) return true;
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProto);
    const host = url.hostname.replace(/^www\./i, "").replace(/^m\./i, "").toLowerCase();
    if (host !== "tiktok.com") return false;
    if (/\/(video|music|tag|discover|live)\b/i.test(url.pathname)) return false;
    return /^\/@[A-Za-z0-9._]{2,24}\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}
