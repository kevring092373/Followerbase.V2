"use server";

/**
 * Username aus Eingabe extrahieren (z. B. "instagram.com/user" oder "@user" → "user").
 */
function extractUsername(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  const at = trimmed.match(/^@?([a-z0-9._]+)$/i);
  if (at) return at[1];
  try {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "instagram.com" || host === "www.instagram.com") {
      const path = u.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
      if (path && path !== "p" && path !== "reel" && path !== "stories") return path;
    }
  } catch {
    //
  }
  return null;
}

export type InstagramStats = {
  followers?: number;
  following?: number;
  posts?: number;
};

export type FetchProfilePicResult =
  | {
      ok: true;
      url: string;
      /** Data-URL (base64) zum direkten Anzeigen im img – umgeht Instagram-Blockierung */
      imageDataUrl?: string;
      username: string;
      stats?: InstagramStats;
      fullName?: string;
    }
  | { ok: false; error: string };

/** Bild von URL abrufen und als Data-URL (base64) zurückgeben. */
async function fetchImageAsDataUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": BROWSER_UA },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const buf = await blob.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

function parseProfilePicFromHtml(html: string): string | null {
  // 1. og:image (doppelte oder einfache Anführungszeichen)
  const ogMatch = html.match(/<meta\s+property="og:image"\s+content=["']([^"']+)["']/i);
  if (ogMatch?.[1]?.startsWith("http")) return ogMatch[1];
  // 2. Embedded JSON: profile_pic_url_hd oder profile_pic_url (escaped oder unescaped)
  const hdMatch = html.match(/"profile_pic_url_hd"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (hdMatch?.[1]) return hdMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
  const picMatch = html.match(/"profile_pic_url"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (picMatch?.[1]) return picMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
  // 3. Erstes CDN-Bild das nach Profilbild aussieht (s150x150, s320x320)
  const cdnMatch = html.match(/"(https:\/\/[^"]*cdninstagram[^"]*(?:s150|s320|s640)[^"]*\.(?:jpg|jpeg|webp)[^"]*)"/);
  if (cdnMatch?.[1]) return cdnMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
  return null;
}

function parseFullNameFromHtml(html: string): string | undefined {
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  const title = ogTitle?.[1] || "";
  if (!title) return undefined;
  return title.replace(/\s*\(@[\w.]+\)\s*$/, "").trim() || undefined;
}

/**
 * Profilseite per fetch laden und Bild-URL aus HTML/JSON lesen. Funktioniert in Serverless.
 */
async function fetchWithHttpGet(
  username: string,
  userAgent: string = BROWSER_UA
): Promise<FetchProfilePicResult | null> {
  const profileUrl = `https://www.instagram.com/${encodeURIComponent(username)}/`;
  try {
    const res = await fetch(profileUrl, {
      headers: {
        "User-Agent": userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const imageUrl = parseProfilePicFromHtml(html);
    if (!imageUrl || !imageUrl.startsWith("http")) return null;
    const fullName = parseFullNameFromHtml(html);
    return {
      ok: true,
      url: imageUrl,
      username,
      fullName,
      stats: undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Alten JSON-Endpunkt probieren (?__a=1) – liefert manchmal noch Profildaten.
 */
async function fetchWithJsonEndpoint(username: string): Promise<FetchProfilePicResult | null> {
  const url = `https://www.instagram.com/${encodeURIComponent(username)}/?__a=1&__d=dis`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/json",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://www.instagram.com/",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.graphql?.user ?? data?.user;
    const picUrl = user?.profile_pic_url_hd ?? user?.profile_pic_url;
    if (!picUrl || typeof picUrl !== "string" || !picUrl.startsWith("http")) return null;
    const fullName = user?.full_name;
    return {
      ok: true,
      url: picUrl,
      username,
      fullName: typeof fullName === "string" ? fullName : undefined,
      stats: undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Seite mit Playwright (echter Browser) aufrufen und Bild + Stats aus dem geladenen DOM auslesen.
 */
async function fetchWithBrowser(username: string): Promise<FetchProfilePicResult | null> {
  let playwright: typeof import("playwright");
  try {
    playwright = await import("playwright");
  } catch {
    return null;
  }

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      locale: "de-DE",
    });
    const page = await context.newPage();

    const profileUrl = `https://www.instagram.com/${encodeURIComponent(username)}/`;
    await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Kurz warten, damit JS og:image und ggf. Profil-Daten setzt
    await new Promise((r) => setTimeout(r, 3500));

    const data = await page.evaluate(() => {
      const result: {
        imageUrl: string | null;
        fullName: string | null;
        posts: number | null;
        followers: number | null;
        following: number | null;
      } = {
        imageUrl: null,
        fullName: null,
        posts: null,
        followers: null,
        following: null,
      };

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        const url = ogImage.getAttribute("content");
        if (url) result.imageUrl = url;
      }

      // Fallback: erstes großes Profilbild im Dokument (img mit crossorigin oder in header)
      if (!result.imageUrl) {
        const imgs = document.querySelectorAll('img[src*="cdninstagram"], img[src*="fbcdn.net"]');
        for (const img of Array.from(imgs)) {
          const src = img.getAttribute("src");
          if (src && (src.includes("s150") || src.includes("s320") || src.includes("profile"))) {
            result.imageUrl = src.replace(/\/s\d+x\d+/, "/s640x640");
            break;
          }
        }
      }

      // Stats aus Seitentext (z. B. "123 Beiträge", "456 Follower", "789 folgt")
      const allText = document.body.innerText;
      const parseNum = (s: string) => {
        const n = parseInt(s.replace(/[.,\s]/g, ""), 10);
        return isNaN(n) ? null : n;
      };
      const postsMatch = allText.match(/(\d[\d.,\s]*)\s*Beiträge?/i) || allText.match(/(\d[\d.,\s]*)\s*posts?/i);
      if (postsMatch) result.posts = parseNum(postsMatch[1]);
      const followersMatch = allText.match(/(\d[\d.,\s]*)\s*Follower/i) || allText.match(/(\d[\d.,\s]*)\s*followers?/i);
      if (followersMatch) result.followers = parseNum(followersMatch[1]);
      const followingMatch =
        allText.match(/(\d[\d.,\s]*)\s*(?:wird gefolgt|folgt)/i) ||
        allText.match(/(\d[\d.,\s]*)\s*following/i);
      if (followingMatch) result.following = parseNum(followingMatch[1]);

      // Full name oft in title oder in einem h1/span
      const title = document.querySelector("title");
      if (title?.textContent) {
        const m = title.textContent.match(/^([^(@]+)\(@/);
        if (m) result.fullName = m[1].trim();
      }

      return result;
    });

    if (!data.imageUrl) {
      await browser.close();
      return null;
    }

    // Bild mit derselben Seite laden (gleiche Cookies/Session) → Response-Body als Base64
    let imageDataUrl: string | null = null;
    try {
      const imgResponse = await page.goto(data.imageUrl, {
        waitUntil: "commit",
        timeout: 15000,
      });
      if (imgResponse && imgResponse.status() === 200) {
        const body = await imgResponse.body();
        const contentType =
          imgResponse.headers()["content-type"]?.split(";")[0] || "image/jpeg";
        const base64 = Buffer.from(body).toString("base64");
        imageDataUrl = `data:${contentType};base64,${base64}`;
      }
    } catch {
      // Bild-Laden fehlgeschlagen, Ergebnis trotzdem mit URL zurückgeben
    }

    await browser.close();

    const stats: InstagramStats = {};
    if (data.posts != null) stats.posts = data.posts;
    if (data.followers != null) stats.followers = data.followers;
    if (data.following != null) stats.following = data.following;

    return {
      ok: true,
      url: data.imageUrl,
      username,
      fullName: data.fullName || undefined,
      stats: Object.keys(stats).length ? stats : undefined,
      imageDataUrl: imageDataUrl || undefined,
    };
  } catch {
    try {
      await browser.close();
    } catch {
      //
    }
    return null;
  }
}

/**
 * Instagram-Profilbild (und ggf. Stats): Seite im Browser laden und aus dem DOM auslesen.
 */
export async function fetchInstagramProfilePic(
  input: string
): Promise<FetchProfilePicResult> {
  const username = extractUsername(input);
  if (!username) {
    return {
      ok: false,
      error:
        "Bitte gib einen gültigen Instagram-Namen oder Profillink ein (z. B. @username oder instagram.com/username).",
    };
  }

  // 1. Mit Googlebot-User-Agent (Instagram liefert an Crawler oft volles HTML inkl. og:image)
  let result: FetchProfilePicResult | null = await fetchWithHttpGet(username, GOOGLEBOT_UA);
  if (!result) {
    const httpResult = await fetchWithHttpGet(username, BROWSER_UA);
    if (httpResult) result = httpResult;
  }
  if (!result) {
    const jsonResult = await fetchWithJsonEndpoint(username);
    if (jsonResult) result = jsonResult;
  }
  if (!result) {
    const browserResult = await fetchWithBrowser(username);
    if (browserResult) result = browserResult;
  }

  if (result && result.ok) {
    const dataUrl = await fetchImageAsDataUrl(result.url);
    if (dataUrl) {
      return { ...result, imageDataUrl: dataUrl };
    }
    return result;
  }

  return {
    ok: false,
    error:
      "Profil konnte nicht geladen werden. Bitte prüfe den Nutzernamen (öffentliches Profil). Instagram blockiert oft Zugriffe von Servern – dann später erneut versuchen.",
  };
}
