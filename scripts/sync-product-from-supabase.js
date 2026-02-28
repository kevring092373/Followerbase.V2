/**
 * Liest ein Produkt aus Supabase (per slug) und schreibt description (und ggf. andere Felder)
 * in content/products.json. Nützlich nach Änderungen in Supabase, um die JSON-Datei zu syncen.
 *
 * Aufruf: node scripts/sync-product-from-supabase.js <slug>
 * z.B. node scripts/sync-product-from-supabase.js tiktok-follower-kaufen
 *     node scripts/sync-product-from-supabase.js tiktok-views-kaufen
 *
 * Erfordert .env.local mit NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY
 */
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvLocal();

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/sync-product-from-supabase.js <slug>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.");
  process.exit(1);
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: row, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase:", error.message);
    process.exit(1);
  }
  if (!row) {
    console.error("Produkt mit slug '%s' nicht in Supabase gefunden.", slug);
    process.exit(1);
  }

  const productsPath = path.join(__dirname, "..", "content", "products.json");
  const raw = fs.readFileSync(productsPath, "utf-8");
  const data = JSON.parse(raw);
  const idx = data.products.findIndex((p) => p.slug === slug);
  if (idx === -1) {
    console.error("Produkt mit slug '%s' nicht in content/products.json gefunden.", slug);
    process.exit(1);
  }

  const p = data.products[idx];
  if (row.description != null) p.description = row.description;
  if (row.meta_title != null) p.metaTitle = row.meta_title;
  if (row.meta_description != null) p.metaDescription = row.meta_description;
  if (row.bullets != null) p.bullets = row.bullets;
  if (row.image != null) p.image = row.image;
  if (row.article_number != null) p.articleNumber = row.article_number;

  fs.writeFileSync(productsPath, JSON.stringify(data, null, 2), "utf-8");
  console.log("OK: %s in products.json aktualisiert (description u.a. aus Supabase).", slug);
}

main();
