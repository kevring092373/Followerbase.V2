/**
 * Prüft YouTube-Videoziele nur für Watchtime (FC-031):
 * youtube.com/watch?v=… und youtu.be/…. Kein Remote-Abruf, keine Längenprüfung.
 */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const REJECT_PATH = /^(shorts|playlist|embed|clip|results|feed|hashtag|live|channel|c|user|@)/i;

export type YoutubeWatchVideoReason = "empty" | "multiple" | "not-youtube-video";

export type YoutubeWatchVideoResult =
  | { ok: true; videoId: string }
  | { ok: false; reason: YoutubeWatchVideoReason };

function youtubeWatchHost(hostname: string): "youtube" | "youtu.be" | null {
  const host = hostname.replace(/^www\./i, "").replace(/^m\./i, "").toLowerCase();
  if (host === "youtube.com") return "youtube";
  if (host === "youtu.be") return "youtu.be";
  return null;
}

function looksLikeUrlToken(value: string): boolean {
  return /https?:\/\//i.test(value) || /(?:^|\/\/)(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\//i.test(value);
}

export function hasMultipleYoutubeTargets(value: string): boolean {
  const raw = value.trim();
  if (!raw) return false;
  if ((raw.match(/https?:\/\//gi) || []).length > 1) return true;
  const tokens = raw.split(/[\s,;]+/).filter(Boolean);
  return tokens.filter(looksLikeUrlToken).length > 1;
}

function videoIdFromWatchUrl(url: URL): string | null {
  const host = youtubeWatchHost(url.hostname);
  if (!host) return null;
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const first = path.slice(1).split("/")[0] || "";

  if (host === "youtu.be") {
    const id = first;
    return VIDEO_ID.test(id) && path.split("/").filter(Boolean).length === 1 ? id : null;
  }

  if (REJECT_PATH.test(first)) return null;
  if (path !== "/watch") return null;
  const id = url.searchParams.get("v")?.trim() || "";
  return VIDEO_ID.test(id) ? id : null;
}

export function inspectYouTubeWatchVideoTarget(value: string): YoutubeWatchVideoResult {
  const raw = value.trim();
  if (!raw) return { ok: false, reason: "empty" };
  if (hasMultipleYoutubeTargets(raw)) return { ok: false, reason: "multiple" };
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProto);
    const videoId = videoIdFromWatchUrl(url);
    if (!videoId) return { ok: false, reason: "not-youtube-video" };
    return { ok: true, videoId };
  } catch {
    return { ok: false, reason: "not-youtube-video" };
  }
}

export function isYouTubeWatchVideoTarget(value: string): boolean {
  return inspectYouTubeWatchVideoTarget(value).ok;
}
