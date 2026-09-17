/** Prüft YouTube-Kanalziele: Kanallink oder @Handle, keine Videos/Shorts/Playlists. */
const HANDLE = /^@?[A-Za-z0-9._-]{3,30}$/;
const REJECT_FIRST_SEGMENT = /^(watch|shorts|playlist|embed|clip|results|feed|hashtag|live)$/i;

function youtubeHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./i, "").replace(/^m\./i, "").toLowerCase();
  return host === "youtube.com";
}

function isChannelPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  const first = path.slice(1).split("/")[0] || "";
  if (REJECT_FIRST_SEGMENT.test(first)) return false;
  if (/^\/@[A-Za-z0-9._-]{3,30}(\/.*)?$/i.test(path)) return true;
  if (/^\/channel\/UC[A-Za-z0-9_-]{22}(\/.*)?$/i.test(path)) return true;
  if (/^\/c\/[A-Za-z0-9._-]{2,40}(\/.*)?$/i.test(path)) return true;
  if (/^\/user\/[A-Za-z0-9._-]{2,40}(\/.*)?$/i.test(path)) return true;
  return false;
}

export function isYouTubeChannelTarget(value: string): boolean {
  const raw = value.trim();
  if (!raw) return false;
  if (!raw.includes("/") && HANDLE.test(raw)) return true;
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProto);
    if (!youtubeHost(url.hostname)) return false;
    return isChannelPath(url.pathname);
  } catch {
    return false;
  }
}
