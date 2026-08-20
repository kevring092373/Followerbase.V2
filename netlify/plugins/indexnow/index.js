/**
 * Nach erfolgreichem Netlify-Deploy geänderte öffentliche URLs an IndexNow senden.
 * Ein Fehler hier darf den Deploy nicht abbrechen.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const HOST = "followerbase.de";
const SITE = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

function log(...args) {
  console.log("[indexnow]", ...args);
}

function warn(...args) {
  console.error("[indexnow]", ...args);
}

function git(args, cwd) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function productSlugsFromJson(raw) {
  try {
    const data = JSON.parse(raw);
    const list = Array.isArray(data.products) ? data.products : [];
    return list
      .map((p) => (typeof p.slug === "string" ? p.slug.trim() : ""))
      .filter((slug) => slug && !slug.includes("?") && !slug.includes("#"));
  } catch {
    return [];
  }
}

function readFileAt(cwd, ref, file) {
  if (!ref) return "";
  return git(["show", `${ref}:${file}`], cwd);
}

function readFileNow(cwd, file) {
  try {
    return fs.readFileSync(path.join(cwd, file), "utf8");
  } catch {
    return "";
  }
}

function canonical(pathname) {
  let p = pathname.split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return `${SITE}${p}`;
}

function isPublicPath(pathname) {
  return !pathname.startsWith("/admin") && !pathname.startsWith("/api");
}

function fileToUrls(file, cwd, prevRef) {
  const urls = [];
  const add = (p) => {
    if (p && isPublicPath(p)) urls.push(canonical(p));
  };

  if (file === "content/products.json") {
    const prev = new Set(productSlugsFromJson(readFileAt(cwd, prevRef, file)));
    const next = new Set(productSlugsFromJson(readFileNow(cwd, file)));
    for (const slug of next) add(`/product/${slug}`);
    for (const slug of prev) {
      if (!next.has(slug)) add(`/product/${slug}`);
    }
    add("/products");
    return urls;
  }

  if (file.startsWith("app/product/") || file === "lib/structured-data.ts" || file === "lib/product-seo.ts") {
    for (const slug of productSlugsFromJson(readFileNow(cwd, "content/products.json"))) {
      add(`/product/${slug}`);
    }
    return urls;
  }

  if (file.startsWith("app/products/") || file === "lib/categories.ts") {
    add("/products");
    try {
      const cats = require(path.join(cwd, "lib/categories.ts"));
      void cats;
    } catch {
      // TS nicht per require – Kategorien aus products.json ableiten
    }
    add("/products/instagram");
    add("/products/tiktok");
    add("/products/youtube");
    add("/products/snapchat");
    add("/products/telegram");
    add("/products/facebook");
    add("/products/reddit");
    add("/products/threads");
    return urls;
  }

  if (file === "app/page.tsx") add("/");
  if (file.startsWith("app/blog/") || file.startsWith("content/blog")) add("/blog");
  if (file.startsWith("app/ueber-uns/")) add("/ueber-uns");
  if (file.startsWith("app/sitemap.ts")) {
    add("/");
    add("/products");
  }

  return urls;
}

function changedFiles(cwd, prevRef, commitRef) {
  if (!prevRef || !commitRef || prevRef === commitRef) return [];
  const out = git(["diff", "--name-only", prevRef, commitRef], cwd);
  return out ? out.split(/\r?\n/).filter(Boolean) : [];
}

function unique(list) {
  return Array.from(new Set(list));
}

async function submit(urls, key) {
  const body = {
    host: HOST,
    key,
    keyLocation: `${SITE}/${key}.txt`,
    urlList: urls,
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  return res.status;
}

module.exports = {
  async onSuccess({ constants }) {
    try {
      const key = (process.env.INDEXNOW_KEY || "").trim() || "a8c39dc9f6e64c79b59409b682c15d4c";
      const cwd = constants.PUBLISH_DIR ? path.resolve(constants.PUBLISH_DIR, "..") : process.cwd();
      const repo = fs.existsSync(path.join(process.cwd(), "content", "products.json"))
        ? process.cwd()
        : cwd;

      const prevRef = process.env.CACHED_COMMIT_REF || "";
      const commitRef = process.env.COMMIT_REF || "";
      const files = changedFiles(repo, prevRef, commitRef);

      let urls = [];
      if (files.length === 0) {
        for (const slug of productSlugsFromJson(readFileNow(repo, "content/products.json"))) {
          urls.push(canonical(`/product/${slug}`));
        }
        urls.push(canonical("/"), canonical("/products"));
      } else {
        for (const file of files) {
          urls.push(...fileToUrls(file, repo, prevRef));
        }
      }

      urls = unique(urls).filter((u) => u.startsWith(SITE) && !u.includes("?"));
      if (urls.length === 0) {
        log("Keine öffentlichen URLs zu senden.");
        return;
      }

      log(`Sende ${urls.length} URL(s) an IndexNow.`);
      const status = await submit(urls, key);
      if (status === 200 || status === 202) {
        log(`IndexNow akzeptiert (${status}).`);
      } else {
        warn(`Unerwarteter Status ${status} – Deploy bleibt erfolgreich.`);
      }
    } catch (err) {
      warn("Plugin-Fehler, Deploy wird nicht abgebrochen:", err instanceof Error ? err.message : err);
    }
  },
};
