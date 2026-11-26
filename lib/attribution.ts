/**
 * First-Touch-Herkunft der Bestellung (Google, Bing, Direkt, Social, Sonst).
 * Client: localStorage 30 Tage, nicht überschreiben.
 * Server: nur validieren/sanitizen, was der Checkout mitschickt.
 */

export const ATTRIBUTION_STORAGE_KEY = "followerbase_attribution";
export const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type AttributionSource = "google" | "bing" | "direct" | "social" | "other";

export interface OrderAttribution {
  source: AttributionSource;
  label: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPath?: string;
  referrerHost?: string;
  capturedAt?: string;
}

export const ATTRIBUTION_SOURCES: AttributionSource[] = [
  "google",
  "bing",
  "direct",
  "social",
  "other",
];

export const ATTRIBUTION_SOURCE_LABELS: Record<AttributionSource, string> = {
  google: "Google",
  bing: "Bing",
  direct: "Direkt",
  social: "Social",
  other: "Sonst",
};

const SOCIAL_HOST_MARKERS = [
  "facebook.com",
  "fb.com",
  "fb.me",
  "instagram.com",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
];

function clip(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function isAttributionSource(value: unknown): value is AttributionSource {
  return typeof value === "string" && ATTRIBUTION_SOURCES.includes(value as AttributionSource);
}

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

function isInternalHost(host: string): boolean {
  const h = normalizeHost(host);
  if (!h) return true;
  if (h === "localhost" || h === "127.0.0.1") return true;
  if (h === "followerbase.de") return true;
  if (typeof window !== "undefined") {
    const current = normalizeHost(window.location.hostname);
    if (current && h === current) return true;
  }
  return false;
}

function isGoogleHost(host: string): boolean {
  const h = normalizeHost(host);
  return h === "google" || h.includes("google.");
}

function isBingHost(host: string): boolean {
  const h = normalizeHost(host);
  return (
    h === "bing" ||
    h === "msn" ||
    h.includes("bing.") ||
    h.includes("msn.")
  );
}

function isSocialHost(host: string): boolean {
  const h = normalizeHost(host);
  return SOCIAL_HOST_MARKERS.some((marker) => h === marker || h.endsWith(`.${marker}`));
}

function utmLooksLike(utm: string, vendor: "google" | "bing"): boolean {
  const v = utm.trim().toLowerCase();
  return v === vendor || v.startsWith(`${vendor}_`) || v.startsWith(`${vendor}-`);
}

export function classifyAttributionSource(input: {
  utmSource?: string;
  referrerHost?: string;
  hasGclid?: boolean;
  hasMsclkid?: boolean;
}): AttributionSource {
  const utm = (input.utmSource ?? "").trim().toLowerCase();
  if (input.hasGclid) return "google";
  if (input.hasMsclkid) return "bing";
  if (utmLooksLike(utm, "google")) return "google";
  if (utmLooksLike(utm, "bing")) return "bing";
  const host = input.referrerHost ?? "";
  if (isGoogleHost(host)) return "google";
  if (isBingHost(host)) return "bing";
  if (isSocialHost(host)) return "social";
  if (utm || host) return "other";
  return "direct";
}

function labelForSource(
  source: AttributionSource,
  utmSource?: string,
  referrerHost?: string
): string {
  if (source !== "other") return ATTRIBUTION_SOURCE_LABELS[source];
  return clip(utmSource, 40) || clip(referrerHost, 40) || ATTRIBUTION_SOURCE_LABELS.other;
}

function sanitizeLandingPath(raw: unknown): string | undefined {
  const value = clip(raw, 200);
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  if (value.includes("://")) return undefined;
  return value;
}

export function isAttributionExpired(attribution: OrderAttribution, now = Date.now()): boolean {
  if (!attribution.capturedAt) return false;
  const t = Date.parse(attribution.capturedAt);
  if (!Number.isFinite(t)) return false;
  return now - t > ATTRIBUTION_TTL_MS;
}

/** Server und Client: unbekannte Payloads in ein sicheres Attribution-Objekt. */
export function parseOrderAttribution(raw: unknown): OrderAttribution | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  if (!isAttributionSource(r.source)) return undefined;
  const utmSource = clip(r.utmSource, 80);
  const utmMedium = clip(r.utmMedium, 80);
  const utmCampaign = clip(r.utmCampaign, 120);
  const landingPath = sanitizeLandingPath(r.landingPath);
  const referrerHost = clip(r.referrerHost, 253);
  const capturedAt = clip(r.capturedAt, 40);
  const label =
    clip(r.label, 40) || labelForSource(r.source, utmSource, referrerHost);
  return {
    source: r.source,
    label,
    ...(utmSource && { utmSource }),
    ...(utmMedium && { utmMedium }),
    ...(utmCampaign && { utmCampaign }),
    ...(landingPath && { landingPath }),
    ...(referrerHost && { referrerHost }),
    ...(capturedAt && { capturedAt }),
  };
}

export function attributionFromRequestBody(body: unknown): OrderAttribution | undefined {
  if (!body || typeof body !== "object") return undefined;
  return parseOrderAttribution((body as Record<string, unknown>).attribution);
}

function buildLandingPath(pathname: string, params: URLSearchParams): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const kept = new URLSearchParams();
  for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    const value = params.get(key);
    if (value) kept.set(key, value);
  }
  const qs = kept.toString();
  return qs ? `${path}?${qs}` : path;
}

function referrerHostFromDocument(): string | undefined {
  if (typeof document === "undefined" || !document.referrer) return undefined;
  try {
    const host = new URL(document.referrer).hostname;
    const normalized = normalizeHost(host);
    if (!normalized || isInternalHost(normalized)) return undefined;
    return normalized.slice(0, 253);
  } catch {
    return undefined;
  }
}

function readStoredRaw(): unknown {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function getStoredAttribution(): OrderAttribution | undefined {
  const parsed = parseOrderAttribution(readStoredRaw());
  if (!parsed || isAttributionExpired(parsed)) return undefined;
  return parsed;
}

/** Einmalig First-Touch merken. Interne Referrer und Folgebesuche überschreiben nichts. */
export function captureFirstTouchAttribution(): OrderAttribution | undefined {
  if (typeof window === "undefined") return undefined;
  const pathname = window.location.pathname || "/";
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return getStoredAttribution();
  }

  const existing = parseOrderAttribution(readStoredRaw());
  if (existing && !isAttributionExpired(existing)) return existing;

  const params = new URLSearchParams(window.location.search);
  const utmSource = clip(params.get("utm_source"), 80);
  const utmMedium = clip(params.get("utm_medium"), 80);
  const utmCampaign = clip(params.get("utm_campaign"), 120);
  const referrerHost = referrerHostFromDocument();
  const source = classifyAttributionSource({
    utmSource,
    referrerHost,
    hasGclid: Boolean(params.get("gclid")),
    hasMsclkid: Boolean(params.get("msclkid")),
  });
  const captured: OrderAttribution = {
    source,
    label: labelForSource(source, utmSource, referrerHost),
    ...(utmSource && { utmSource }),
    ...(utmMedium && { utmMedium }),
    ...(utmCampaign && { utmCampaign }),
    landingPath: buildLandingPath(pathname, params),
    ...(referrerHost && { referrerHost }),
    capturedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(captured));
  } catch {
    /* private mode / quota */
  }
  return captured;
}

export function getAttributionListLabel(attribution?: OrderAttribution | null): string {
  if (!attribution) return "unbekannt";
  return attribution.label || ATTRIBUTION_SOURCE_LABELS[attribution.source] || "unbekannt";
}

/** true, wenn die DB-Spalte attribution noch fehlt (Migration nicht ausgeführt). */
export function isMissingAttributionColumnError(message?: string): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("attribution") && (m.includes("does not exist") || m.includes("schema cache"));
}
