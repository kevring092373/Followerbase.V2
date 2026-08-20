/**
 * Holt ALLE Blog-Beiträge aus Supabase und schreibt sie nach content/blog-posts.json.
 * Kein einzelnes Hochladen – ein Aufruf reicht.
 *
 *   node scripts/export-blog-from-supabase.js
 *
 * Erfordert .env.local mit NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY
 */
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const buf = fs.readFileSync(envPath);
  let content;
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    content = buf.toString("utf16le");
  } else {
    content = buf.toString("utf8").replace(/^\uFEFF/, "");
  }
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.");
  process.exit(1);
}

function cleanSlug(slug) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function rowToPost(r) {
  const slug = cleanSlug(r.slug) || String(r.slug || "").trim();
  const post = {
    slug,
    title: typeof r.title === "string" ? r.title : slug,
    excerpt: r.excerpt || undefined,
    content: typeof r.content === "string" ? r.content : "",
    date: r.date || undefined,
    metaTitle: r.meta_title || undefined,
    metaDescription: r.meta_description || undefined,
    image: typeof r.image === "string" && r.image.trim() ? r.image.trim() : undefined,
    category: typeof r.category === "string" && r.category.trim() ? r.category.trim() : undefined,
  };
  for (const key of Object.keys(post)) {
    if (post[key] === undefined) delete post[key];
  }
  return post;
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const pageSize = 100;
  let from = 0;
  const rows = [];

  for (;;) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug,title,excerpt,content,date,meta_title,meta_description,image,category")
      .order("date", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Supabase:", error.message);
      process.exit(1);
    }
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  const posts = rows.map(rowToPost).filter((p) => p.slug);
  const outPath = path.join(__dirname, "..", "content", "blog-posts.json");
  fs.writeFileSync(outPath, JSON.stringify({ posts }, null, 2), "utf-8");
  console.log("OK: %d Beitrag/Beiträge nach content/blog-posts.json geschrieben.", posts.length);
  for (const p of posts) {
    console.log(" - %s (%s)", p.slug, p.date || "ohne Datum");
  }
}

main();
