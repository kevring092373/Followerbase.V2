const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8").replace(/^\uFEFF/, "");
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  const blogPath = path.join(__dirname, "..", "content", "blog-posts.json");
  const blog = JSON.parse(fs.readFileSync(blogPath, "utf-8"));
  const ytPosts = (blog.posts || []).filter((p) => /youtube/i.test(p.slug + p.title));
  console.log("BLOG YT:");
  for (const p of ytPosts) console.log(" -", p.slug, "|", p.title);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("No supabase env");
    process.exit(1);
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("products")
    .select("slug,name,meta_title,meta_description,image,article_number,description,quantities,prices_cents,updated_at")
    .eq("slug", "youtube-views-kaufen")
    .maybeSingle();
  if (error) {
    console.error(error);
    process.exit(1);
  }
  const html = data.description || "";
  const out = path.join(__dirname, "..", "content", "product-html", "youtube-views-kaufen.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf-8");
  console.log("META TITLE:", data.meta_title);
  console.log("META DESC:", data.meta_description);
  console.log("IMAGE:", data.image);
  console.log("SKU:", data.article_number);
  console.log("QTY:", data.quantities);
  console.log("PRICES:", data.prices_cents);
  console.log("HTML LEN:", html.length);
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  const h2 = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  console.log("H1s:", h1);
  console.log("H2s:", h2);
  const ctas = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].filter((m) =>
    /bestellen|products|cta/i.test(m[0])
  );
  console.log("CTAs:");
  for (const c of ctas.slice(0, 15)) console.log(c[0].slice(0, 300));
  const faqs = [...html.matchAll(/faq-question[^>]*>([\s\S]*?)<\/button>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").trim()
  );
  console.log("FAQs:", faqs);
}

main();
