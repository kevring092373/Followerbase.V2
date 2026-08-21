/**
 * 1) Entfernt die irrtümlich am Produkt gespeicherte Beschreibung.
 * 2) Legt den Text als Blogbeitrag /blog/instagram-follower-kaufen an.
 *
 * Aufruf: node scripts/inject-instagram-follower-html.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HTML_PATH = path.join(ROOT, "content", "product-html", "instagram-follower-kaufen.html");
const PRODUCTS_PATH = path.join(ROOT, "content", "products.json");
const BLOG_PATH = path.join(ROOT, "content", "blog-posts.json");
const PRODUCT_SLUG = "instagram-follower-kaufen";
const BLOG_SLUG = "instagram-follower-kaufen";

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8").replace(/^\uFEFF/, "");
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) process.env[key] = value;
  }
}

const html = fs.readFileSync(HTML_PATH, "utf-8").replace(/^\uFEFF/, "").trim();

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"));
const pIdx = products.products.findIndex((p) => p.slug === PRODUCT_SLUG);
if (pIdx === -1) {
  console.error("Produkt %s nicht in products.json gefunden.", PRODUCT_SLUG);
  process.exit(1);
}
delete products.products[pIdx].description;
delete products.products[pIdx].metaTitle;
delete products.products[pIdx].metaDescription;
delete products.products[pIdx].ogTitle;
delete products.products[pIdx].bullets;
fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf-8");
console.log("OK: Produktbeschreibung von %s entfernt.", PRODUCT_SLUG);

const blog = JSON.parse(fs.readFileSync(BLOG_PATH, "utf-8"));
const post = {
  slug: BLOG_SLUG,
  title: "Instagram Follower kaufen",
  excerpt:
    "Instagram Follower kaufen: Pakete ab 0,99 €, Normal und Premium vergleichen, ohne Passwort bestellen und Lieferzeiten transparent prüfen.",
  content: html,
  date: "2026-08-22",
  metaTitle: "Instagram Follower kaufen: Pakete ab 0,99 € | Followerbase",
  metaDescription:
    "Instagram Follower kaufen: Pakete ab 0,99 €, Normal und Premium vergleichen, ohne Passwort bestellen und Lieferzeiten transparent prüfen.",
  image: "/icons/instagram-follower-kaufen-thumbnail.webp",
  category: "Instagram Follower",
};
const bIdx = blog.posts.findIndex((p) => p.slug === BLOG_SLUG);
if (bIdx === -1) blog.posts.unshift(post);
else blog.posts[bIdx] = { ...blog.posts[bIdx], ...post };
fs.writeFileSync(BLOG_PATH, JSON.stringify(blog, null, 2), "utf-8");
console.log("OK: Blogbeitrag /blog/%s geschrieben.", BLOG_SLUG);

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("Kein Supabase in .env.local – Produkt nur lokal zurückgesetzt.");
  process.exit(0);
}

(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase
    .from("products")
    .update({
      description: null,
      meta_title: null,
      meta_description: null,
      bullets: null,
    })
    .eq("slug", PRODUCT_SLUG);
  if (error) {
    console.error("Supabase:", error.message);
    process.exit(1);
  }
  console.log("OK: Supabase-Produkt %s zurückgesetzt.", PRODUCT_SLUG);
})();
