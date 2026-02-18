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
  | { ok: true; url: string; username: string; stats?: InstagramStats; fullName?: string }
  | { ok: false; error: string };

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
        for (const img of imgs) {
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

    await browser.close();

    if (!data.imageUrl) return null;

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

  const result = await fetchWithBrowser(username);
  if (result) return result;

  return {
    ok: false,
    error:
      "Profil konnte nicht geladen werden. Bitte prüfe den Nutzernamen (öffentliches Profil). Wenn Instagram eine Anmeldung anzeigt, blockiert Instagram den Zugriff von Servern.",
  };
}
