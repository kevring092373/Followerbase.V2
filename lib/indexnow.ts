/**
 * IndexNow: meldet geänderte URLs sofort an Bing (und die übrigen teilnehmenden Suchmaschinen).
 *
 * Der Schlüssel ist absichtlich nicht geheim – er muss unter /<key>.txt öffentlich erreichbar
 * sein, weil die Suchmaschine damit prüft, ob wir die Domain besitzen. Geheim ist nur
 * INDEXNOW_SECRET, mit dem der Aufruf unserer eigenen API-Route autorisiert wird.
 */
import { getBaseUrl } from "@/lib/seo";

export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY?.trim() || "a8c39dc9f6e64c79b59409b682c15d4c";

const ENDPOINT = "https://api.indexnow.org/indexnow";

/** IndexNow erlaubt maximal 10.000 URLs pro Anfrage. */
const MAX_URLS_PER_REQUEST = 10000;

export function getKeyLocation(): string {
  return `${getBaseUrl()}/${INDEXNOW_KEY}.txt`;
}

/**
 * Macht aus Pfaden und URLs absolute URLs der eigenen Domain.
 * URLs anderer Hosts werden verworfen – IndexNow beantwortet sie mit 422.
 */
export function normalizeUrls(input: readonly string[]): string[] {
  const base = getBaseUrl();
  const ownHost = new URL(base).host;
  const seen = new Set<string>();

  for (const raw of input) {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) continue;
    try {
      const url = new URL(value, base);
      if (url.host !== ownHost) continue;
      url.hash = "";
      url.search = "";
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) continue;
      let href = url.toString();
      if (url.pathname.length > 1 && href.endsWith("/")) {
        href = href.replace(/\/+$/, "");
      }
      seen.add(href);
    } catch {
      // Unbrauchbare Angabe überspringen
    }
  }

  return Array.from(seen);
}

export interface IndexNowResult {
  ok: boolean;
  submitted: number;
  /** HTTP-Status je Teilanfrage – 200 = akzeptiert, 202 = Schlüsselprüfung läuft noch. */
  statuses: number[];
  error?: string;
}

/**
 * Übergibt die URLs an IndexNow. Wirft nicht: ein fehlgeschlagener Ping darf
 * den auslösenden Vorgang (z. B. das Speichern eines Beitrags) nie abbrechen.
 */
export async function submitToIndexNow(urls: readonly string[]): Promise<IndexNowResult> {
  const list = normalizeUrls(urls);
  if (list.length === 0) {
    return { ok: false, submitted: 0, statuses: [], error: "Keine gültigen URLs" };
  }

  const host = new URL(getBaseUrl()).host;
  const statuses: number[] = [];

  try {
    for (let i = 0; i < list.length; i += MAX_URLS_PER_REQUEST) {
      const batch = list.slice(i, i + MAX_URLS_PER_REQUEST);
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        cache: "no-store",
        body: JSON.stringify({
          host,
          key: INDEXNOW_KEY,
          keyLocation: getKeyLocation(),
          urlList: batch,
        }),
      });
      statuses.push(response.status);
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unbekannter Fehler";
    console.error("[indexnow] Ping fehlgeschlagen:", error);
    return { ok: false, submitted: 0, statuses, error };
  }

  // 200 = angenommen, 202 = angenommen, Schlüsselprüfung noch offen.
  const ok = statuses.length > 0 && statuses.every((s) => s === 200 || s === 202);
  if (!ok) console.error("[indexnow] Unerwartete Statuscodes:", statuses.join(", "));

  return { ok, submitted: ok ? list.length : 0, statuses };
}
