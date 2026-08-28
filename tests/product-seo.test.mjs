import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function productSlugs(products) {
  return new Set(products.map((p) => p.slug));
}

function categorySlugsFromTs(source) {
  const slugs = [];
  const re = /prod\("([^"]+)"/g;
  let m;
  while ((m = re.exec(source))) slugs.push(m[1]);
  return slugs;
}

function headerQuickSlugs(source) {
  const slugs = [];
  const re = /productSlug:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(source))) slugs.push(m[1]);
  return slugs;
}

function collectPrices(product) {
  const lists = product.tiers?.length
    ? product.tiers.map((t) => t.pricesCents)
    : [product.pricesCents];
  const out = [];
  for (const list of lists) {
    for (const value of list || []) {
      if (typeof value === "number" && value >= 0) out.push(value);
    }
  }
  return out;
}

function formatPrice(cents) {
  return (cents / 100).toFixed(2);
}

function extractFaqs(html) {
  const pairs = [];
  const seen = new Set();
  const add = (q, a) => {
    const question = q.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const answer = a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!question || !answer) return;
    const key = question.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ question, answer });
  };
  const faqRe =
    /<div\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>\s*<button\b[^>]*class=["'][^"']*\bfaq-question\b[^"']*["'][^>]*>([\s\S]*?)<\/button>\s*<div\b[^>]*class=["'][^"']*\bfaq-answer\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let m;
  while ((m = faqRe.exec(html))) add(m[1], m[2]);
  const faqSection = html.match(/<section\b[^>]*aria-labelledby=["']faq["'][^>]*>([\s\S]*?)<\/section>/i);
  if (faqSection) {
    const itemRe = /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi;
    while ((m = itemRe.exec(faqSection[1]))) add(m[1], m[2]);
  }
  return pairs;
}

const products = JSON.parse(read("content/products.json")).products;
const redirects = JSON.parse(read("content/discontinued-product-redirects.json"));
const categoriesTs = read("lib/categories.ts");
const productPage = read("app/product/[slug]/page.tsx");
const structured = read("lib/structured-data.ts");

test("Navigation verweist nur auf vorhandene Produkte", () => {
  const existing = productSlugs(products);
  for (const slug of categorySlugsFromTs(categoriesTs)) {
    assert.ok(existing.has(slug), `Header-Kategorie verweist auf fehlendes Produkt: ${slug}`);
  }
  for (const slug of headerQuickSlugs(categoriesTs)) {
    assert.ok(existing.has(slug), `Quick-Link verweist auf fehlendes Produkt: ${slug}`);
  }
});

test("Entfernte Produkt-URLs haben fachliche 301-Ziele", () => {
  const existing = productSlugs(products);
  const required = [
    "/product/instagram-follower-blauer-haken-kaufen",
    "/product/instagram-likes-tuerkisch-kaufen",
    "/product/instagram-kommentare-kaufen",
    "/product/instagram-story-views-kaufen",
    "/product/instagram-bundle-kaufen",
    "/product/snapchat-story-views-kaufen",
    "/product/facebook-follower-kaufen",
  ];
  const bySource = Object.fromEntries(redirects.map((r) => [r.source, r.destination]));
  for (const source of required) {
    const dest = bySource[source];
    assert.ok(dest, `Kein Redirect für ${source}`);
    assert.notEqual(dest, "/", `Keine pauschale Startseiten-Weiterleitung für ${source}`);
    if (dest.startsWith("/product/")) {
      const slug = dest.replace("/product/", "");
      assert.ok(existing.has(slug), `Redirect-Ziel existiert nicht: ${dest}`);
    }
  }
});

test("Instagram-Follower-Angebot nutzt echte Paketpreise", () => {
  const product = products.find((p) => p.slug === "instagram-follower-kaufen");
  assert.ok(product);
  const prices = collectPrices(product);
  assert.equal(formatPrice(Math.min(...prices)), "0.99");
  assert.ok(prices.length > 1);
  assert.equal(formatPrice(99).includes(","), false);
});

test("TikTok-Follower- und Instagram-Likes-Preise sind vorhanden", () => {
  for (const slug of ["tiktok-follower-kaufen", "instagram-likes-kaufen"]) {
    const product = products.find((p) => p.slug === slug);
    assert.ok(product, slug);
    const prices = collectPrices(product);
    assert.ok(prices.length >= 1);
    assert.ok(Math.min(...prices) >= 0);
  }
});

test("Produktseite hat genau eine H1-Vorlage und Canonical-Metadaten", () => {
  const h1 = productPage.match(/<h1\b/g) || [];
  assert.equal(h1.length, 1);
  assert.match(productPage, /alternates:\s*\{\s*canonical:\s*url/);
  assert.match(productPage, /card:\s*"summary_large_image"/);
  assert.match(productPage, /index:\s*true/);
  assert.match(productPage, /follow:\s*true/);
  assert.match(productPage, /id=\{PRODUCT_ORDER_ANCHOR_ID\}/);
});

test("Offer-SKUs sind je Variante eindeutig", () => {
  const product = products.find((p) => p.slug === "instagram-follower-kaufen");
  assert.ok(product);
  const skus = [];
  for (const tier of product.tiers) {
    for (const quantity of tier.quantities) {
      skus.push(`${product.articleNumber}-${quantity}-${tier.name.toUpperCase()}`);
    }
  }
  assert.equal(skus.length, 15);
  assert.equal(new Set(skus).size, skus.length);
  assert.ok(skus.includes("FC-001-100-NORMAL"));
  assert.ok(skus.includes("FC-001-100-PREMIUM"));
  assert.ok(skus.includes("FC-001-25000-NORMAL"));
  assert.equal(skus.includes("FC-001-25000-PREMIUM"), false);
});

test("Sichtbare Preise nutzen deutsches Format, Schema-Preise den Dezimalpunkt", () => {
  const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  assert.match(euro.format(0.99), /^0,99\s\u00a0?€$|^0,99\u00a0€$/);
  assert.equal(euro.format(15.9).replace(/\u00a0/g, " "), "15,90 €");
  assert.equal(formatPrice(1590), "15.90");
  assert.match(read("lib/format.ts"), /Intl\.NumberFormat\("de-DE"/);
  assert.equal(productPage.includes('.toFixed(2)} €'), false);
});

test("Product-Schema enthält keine erfundenen AggregateRatings", () => {
  assert.equal(structured.includes('"aggregateRating"'), false);
  assert.match(structured, /AggregateOffer/);
});

test("FAQ-Extraktion nimmt nur sichtbare Fragen", () => {
  const html = `
    <div class="faq-item">
      <button class="faq-question">Frage A?</button>
      <div class="faq-answer"><p>Antwort A</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-question">Frage A?</button>
      <div class="faq-answer"><p>Doppelt</p></div>
    </div>
    <div class="faq-item">
      <button class="faq-question"></button>
      <div class="faq-answer"><p>leer</p></div>
    </div>
  `;
  const faqs = extractFaqs(html);
  assert.equal(faqs.length, 1);
  assert.equal(faqs[0].question, "Frage A?");
  assert.equal(faqs[0].answer, "Antwort A");
});

test("YouTube-Views-FAQs werden aus sichtbaren H3-Blöcken gelesen", () => {
  const html = read("content/product-html/youtube-views-kaufen.html");
  const faqs = extractFaqs(html);
  assert.ok(faqs.length >= 10);
  assert.ok(faqs.some((f) => f.question.includes("YouTube-Passwort")));
  assert.ok(faqs.some((f) => /nicht garantiert/i.test(f.answer)));
  assert.equal(html.includes('href="#produkt-auswahl"'), true);
  assert.equal(/10,45 €/.test(html), false);
  assert.match(html, /5,23 €/);
  assert.match(html, /yt-views-content/);
});

test("YouTube-Views-Produkt nutzt die vorgegebenen SEO-Felder und Paketpreise", () => {
  const product = products.find((p) => p.slug === "youtube-views-kaufen");
  assert.ok(product);
  assert.equal(product.metaTitle, "YouTube Views kaufen: 100 Aufrufe ab 0,52 €");
  assert.equal(
    product.metaDescription,
    "YouTube Views kaufen: Pakete mit 100 bis 25.000 Aufrufen ab 0,52 €. Kein Passwort nötig, transparente Preise und Bestellung per Videolink."
  );
  assert.equal(product.image, "/icons/youtube-views-kaufen.webp");
  const prices = collectPrices(product);
  assert.equal(prices.length, 5);
  assert.equal(formatPrice(Math.min(...prices)), "5.23");
  assert.equal(formatPrice(Math.max(...prices)), "99.50");
  assert.match(productPage, /absolute:\s*title/);
  assert.match(productPage, /YOUTUBE_VIEWS_DESCRIPTION/);
});

test("Instagram-Likes-Seite nutzt feste SEO-Felder und Paketpreise", () => {
  const product = products.find((p) => p.slug === "instagram-likes-kaufen");
  assert.ok(product);
  assert.equal(product.articleNumber, "FC-006");
  assert.equal(product.metaTitle, "Instagram Likes kaufen ab 0,85 € | Followerbase");
  assert.equal(
    product.metaDescription,
    "Instagram Likes ab 0,85 € bestellen. Flexible Pakete für Posts, Reels und Karussells. Ohne Passwort und mit transparenter Lieferung."
  );
  assert.deepEqual(product.quantities, [100, 250, 500, 1000, 2500, 5000, 10000]);
  assert.deepEqual(product.pricesCents, [85, 149, 245, 445, 990, 1690, 2990]);
  assert.match(productPage, /INSTAGRAM_LIKES_TITLE/);
  assert.match(productPage, /INSTAGRAM_LIKES_DESCRIPTION/);
  assert.match(productPage, /id=\{PRODUCT_ORDER_ANCHOR_ID\}/);
  assert.match(productPage, /instagram-likes-beitragslink/);
  assert.match(productPage, /instagram-likes-quantity-slider/);
  assert.match(productPage, /validateInstagramMediaUrl=\{likesPage\}/);
  assert.match(productPage, /likesPage \? "section" : "div"/);
  const likesSeo = read("lib/instagram-likes-seo.ts");
  assert.match(likesSeo, /data-fblikes-packages/);
  assert.match(likesSeo, /aria-controls/);
  assert.match(likesSeo, /#\$\{INSTAGRAM_LIKES_ORDER_ID\}/);
  const urlHelper = read("lib/instagram-url.ts");
  assert.match(urlHelper, /p\|reel\|reels\|tv/);
  const html = read("content/product-html/instagram-likes-kaufen.html");
  assert.equal((html.match(/<table\b/g) || []).length, 3);
  assert.match(html, /Häufige Fragen vor dem Kauf/);
  assert.match(html, /fblikes-button/);
  assert.match(html, /href="#produkt-auswahl"/);
  assert.match(html, /\/product\/instagram-likes-deutsch-kaufen/);
  assert.match(html, /\/blog\/mehr-instagram-likes-guide/);
  assert.equal((html.match(/<details>/g) || []).length, 6);
});

test("Sitemap und IndexNow-Key-Datei sind vorhanden", () => {
  assert.match(read("app/sitemap.ts"), /productCanonicalUrl/);
  assert.match(read("app/sitemap.ts"), /canonicalUrl/);
  const key = read("public/a8c39dc9f6e64c79b59409b682c15d4c.txt").trim();
  assert.equal(key, "a8c39dc9f6e64c79b59409b682c15d4c");
});
