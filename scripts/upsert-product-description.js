/**
 * Spielt eine Produktbeschreibung aus content/product-html/<slug>.html ein:
 * nach content/products.json und – falls .env.local Supabase enthält – in die Tabelle products.
 *
 * Aufruf: node scripts/upsert-product-description.js <slug> [--dry]
 * z. B.:  node scripts/upsert-product-description.js instagram-follower-kaufen
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

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

const slug = process.argv[2];
const dryRun = process.argv.includes("--dry");
if (!slug) {
  console.error("Aufruf: node scripts/upsert-product-description.js <slug> [--dry]");
  process.exit(1);
}

const htmlPath = path.join(ROOT, "content", "product-html", `${slug}.html`);
if (!fs.existsSync(htmlPath)) {
  console.error("Datei fehlt: content/product-html/%s.html", slug);
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, "utf-8").replace(/^\uFEFF/, "").trim();

const productsPath = path.join(ROOT, "content", "products.json");
const data = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
const index = data.products.findIndex((p) => p.slug === slug);
if (index === -1) {
  console.error("Produkt %s nicht in content/products.json gefunden.", slug);
  process.exit(1);
}

console.log("HTML: %d Zeichen", html.length);
if (dryRun) {
  console.log("Probelauf – nichts geschrieben.");
  process.exit(0);
}

data.products[index].description = html;
fs.writeFileSync(productsPath, JSON.stringify(data, null, 2), "utf-8");
console.log("OK: description in products.json gesetzt (%s).", slug);

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("Kein Supabase in .env.local – nur products.json aktualisiert.");
  process.exit(0);
}

(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("products").update({ description: html }).eq("slug", slug);
  if (error) {
    console.error("Supabase:", error.message);
    process.exit(1);
  }
  console.log("OK: Supabase-Produkt %s aktualisiert.", slug);
})();
