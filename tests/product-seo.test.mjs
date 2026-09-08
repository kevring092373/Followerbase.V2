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
  assert.match(productPage, /validateInstagramMediaUrl=\{likesPage \|\| savesPage \|\| likesDeutschPage\}/);
  assert.match(productPage, /structuredProductPage \? "section" : "div"/);
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
  assert.equal((html.match(/DATEN VOR VERÖFFENTLICHUNG|data-editorial-placeholder|fblikes-editorial/gi) || []).length, 0);
  assert.doesNotMatch(html, /Vor Veröffentlichung/);
});

test("Instagram-Saves-Seite nutzt feste SEO-Felder und Paketpreise", () => {
  const product = products.find((p) => p.slug === "instagram-saves-kaufen");
  assert.ok(product);
  assert.equal(product.articleNumber, "FC-012");
  assert.equal(product.metaTitle, "Instagram Saves kaufen ab 0,85 € | Followerbase");
  assert.equal(
    product.metaDescription,
    "Instagram Saves kaufen ab 0,85 €. Paket wählen, Beitragslink eingeben und ohne Passwort bestellen. Einmalzahlung bei Followerbase."
  );
  assert.deepEqual(product.quantities, [100, 250, 500, 1000, 2500, 5000, 10000]);
  assert.deepEqual(product.pricesCents, [85, 145, 245, 445, 990, 1790, 3290]);
  assert.match(productPage, /INSTAGRAM_SAVES_TITLE/);
  assert.match(productPage, /INSTAGRAM_SAVES_DESCRIPTION/);
  assert.match(productPage, /instagram-saves-beitragslink/);
  assert.match(productPage, /isInstagramSavesProduct/);
  const savesSeo = read("lib/instagram-saves-seo.ts");
  assert.match(savesSeo, /data-fbsaves-packages/);
  assert.match(savesSeo, /aria-controls/);
  const html = read("content/product-html/instagram-saves-kaufen.html");
  assert.match(html, /Was Instagram Saves leisten/);
  assert.match(html, /fbsaves-button/);
  assert.match(html, /href="#produkt-auswahl"/);
  assert.match(html, /\/product\/instagram-likes-kaufen/);
  assert.match(html, /\/products\/instagram/);
  assert.match(html, /\/blog\/instagram-reels-reichweite-erhoehen/);
  assert.match(html, /data-fbsaves-packages/);
  assert.equal((html.match(/stärkstes Signal|Algorithmus-Push|Power-Tool/gi) || []).length, 0);
  assert.equal((html.match(/<details>/g) || []).length, 6);
  assert.equal((html.match(/<h1\b/gi) || []).length, 0);
});

test("TikTok-Saves-Seite nutzt konservativen Contentblock und Live-Preise", () => {
  const product = products.find((p) => p.slug === "tiktok-saves-kaufen");
  assert.ok(product);
  assert.equal(product.articleNumber, "FC-016");
  assert.equal(product.metaTitle, "TikTok Saves kaufen ab 0,90 € | Followerbase");
  assert.equal(
    product.metaDescription,
    "TikTok Saves kaufen ab 0,90 €. Sechs Pakete wählen, Videolink eingeben und ohne Passwort bestellen. Einmalzahlung bei Followerbase."
  );
  assert.deepEqual(product.quantities, [100, 500, 1000, 2500, 5000, 10000]);
  assert.deepEqual(product.pricesCents, [90, 285, 490, 1090, 1890, 3490]);
  assert.match(productPage, /TIKTOK_SAVES_TITLE/);
  assert.match(productPage, /isTiktokSavesProduct/);
  assert.match(productPage, /validateInstagramMediaUrl=\{likesPage \|\| savesPage \|\| likesDeutschPage\}/);
  assert.doesNotMatch(productPage, /validateInstagramMediaUrl=\{likesPage \|\| savesPage \|\| tiktokSavesPage\}/);
  const seo = read("lib/tiktok-saves-seo.ts");
  assert.match(seo, /data-fbtsaves-packages/);
  const html = read("content/product-html/tiktok-saves-kaufen.html");
  assert.match(html, /TikTok Saves kaufen bei Followerbase/);
  assert.match(html, /fbtsaves-button/);
  assert.match(html, /href="#produkt-auswahl"/);
  assert.match(html, /\/product\/tiktok-likes-kaufen/);
  assert.match(html, /\/products\/tiktok/);
  assert.equal((html.match(/<details>/g) || []).length, 6);
  assert.equal((html.match(/<h1\b/gi) || []).length, 0);
  assert.equal((html.match(/For You Page push|Algorithmus-Push|stärkstes Signal/gi) || []).length, 0);
});

test("Instagram-Follower-Deutsch-Seite nutzt eigene Definition und Live-Preise", () => {
  const product = products.find((p) => p.slug === "instagram-follower-deutsch-kaufen");
  assert.ok(product);
  assert.equal(product.articleNumber, "FC-003");
  assert.equal(product.metaTitle, "Deutsche Instagram Follower kaufen ab 7,90 € | Followerbase");
  assert.equal(
    product.metaDescription,
    "Deutsche Instagram Follower ab 7,90 € bestellen. Sechs Pakete, kein Passwort und klare Produktdetails bei Followerbase."
  );
  assert.deepEqual(product.quantities, [50, 100, 250, 500, 1000, 2500]);
  assert.deepEqual(product.pricesCents, [790, 1290, 2490, 4490, 7900, 17900]);
  assert.match(productPage, /INSTAGRAM_FOLLOWER_DEUTSCH_TITLE/);
  assert.match(productPage, /INSTAGRAM_FOLLOWER_DEUTSCH_H1/);
  assert.match(productPage, /isInstagramFollowerDeutschProduct/);
  assert.match(productPage, /instagram-follower-deutsch-ziel/);
  const seo = read("lib/instagram-follower-deutsch-seo.ts");
  assert.match(seo, /data-fbdef-packages/);
  assert.match(seo, /Keine Lieferanten-API/);
  const html = read("content/product-html/instagram-follower-deutsch-kaufen.html");
  assert.match(html, /Was „deutsche Instagram Follower“ hier bedeutet/);
  assert.match(html, /Bestellung in vier Schritten/);
  assert.match(html, /\/product\/instagram-follower-kaufen/);
  assert.match(html, /\/product\/instagram-follower-tuerkisch-kaufen/);
  assert.match(html, /\/product\/instagram-likes-deutsch-kaufen/);
  assert.match(html, /\/products\/instagram/);
  assert.match(html, /fbdef-button/);
  assert.match(html, /data-fbdef-packages/);
  assert.match(html, /href="#produkt-auswahl"/);
  assert.equal((html.match(/<h1\b/gi) || []).length, 0);
  assert.equal((html.match(/<details>/g) || []).length, 6);
  assert.equal((html.match(/DACH-Reichweite aufbauen|echte Profile|aktive deutsche Nutzer|risikofrei|diskret/gi) || []).length, 0);
});

test("Instagram-Follower-Türkisch-Seite nutzt eigene Definition und Live-Preise", () => {
  const product = products.find((p) => p.slug === "instagram-follower-tuerkisch-kaufen");
  assert.ok(product);
  assert.equal(product.articleNumber, "FC-002");
  assert.equal(product.metaTitle, "Türkische Instagram Follower kaufen | Followerbase");
  assert.equal(
    product.metaDescription,
    "Türkische Instagram Follower ab 2,49 € bestellen. Sechs Pakete, kein Passwort und transparente Produktdetails bei Followerbase."
  );
  assert.ok(product.metaTitle.length <= 60);
  assert.deepEqual(product.quantities, [100, 250, 500, 1000, 2500, 5000]);
  assert.deepEqual(product.pricesCents, [249, 490, 845, 1490, 3290, 5990]);
  assert.match(productPage, /INSTAGRAM_FOLLOWER_TUERKISCH_TITLE/);
  assert.match(productPage, /INSTAGRAM_FOLLOWER_TUERKISCH_H1/);
  assert.match(productPage, /isInstagramFollowerTuerkischProduct/);
  assert.match(productPage, /instagram-follower-tuerkisch-ziel/);
  const seo = read("lib/instagram-follower-tuerkisch-seo.ts");
  assert.match(seo, /data-fbtr-packages/);
  assert.match(seo, /Keine Lieferanten-API/);
  const html = read("content/product-html/instagram-follower-tuerkisch-kaufen.html");
  assert.match(html, /Passt der türkischsprachige Schwerpunkt zu deinem Profil\?/);
  assert.match(html, /Was mit dem türkischen Profil-Schwerpunkt gemeint ist/);
  assert.match(html, /Türkische Instagram Follower: Pakete und Preise/);
  assert.match(html, /\/product\/instagram-follower-kaufen/);
  assert.match(html, /\/product\/instagram-follower-deutsch-kaufen/);
  assert.match(html, /\/product\/instagram-likes-kaufen/);
  assert.match(html, /\/products\/instagram/);
  assert.doesNotMatch(html, /tiktok-follower-tuerkisch-kaufen/);
  assert.match(html, /fbtr-button/);
  assert.match(html, /data-fbtr-packages/);
  assert.match(html, /href="#produkt-auswahl"/);
  assert.equal((html.match(/<h1\b/gi) || []).length, 0);
  assert.equal((html.match(/<details>/g) || []).length, 6);
  assert.equal(
    (html.match(/65 Mio|65 Millionen|größten Instagram-Markt|echte türkische Profile|aktive türkische Nutzer|risikofrei|diskret|30-Tage-Nachfüll/gi) || []).length,
    0
  );
});

test("Instagram-Likes-Deutsch-Seite bereinigt Claims und nutzt Live-Pakete", () => {
  const product = products.find((p) => p.slug === "instagram-likes-deutsch-kaufen");
  assert.ok(product);
  assert.equal(product.articleNumber, "FC-007");
  assert.equal(product.metaTitle, "Deutsche Instagram Likes kaufen | Followerbase");
  assert.equal(
    product.metaDescription,
    "Deutsche Instagram Likes ab 3,90 €: Accounts mit deutschsprachigen Profilmerkmalen. Paket auswählen und per Beitragslink bestellen. Ohne Instagram-Passwort."
  );
  assert.ok(product.metaTitle.length <= 60);
  assert.ok(product.metaDescription.length <= 160);
  assert.deepEqual(product.quantities, [50, 100, 250, 500, 1000, 2500]);
  assert.deepEqual(product.pricesCents, [390, 690, 1290, 2190, 3890, 8900]);
  assert.match(productPage, /INSTAGRAM_LIKES_DEUTSCH_TITLE/);
  assert.match(productPage, /INSTAGRAM_LIKES_DEUTSCH_H1/);
  assert.match(productPage, /isInstagramLikesDeutschProduct/);
  assert.match(productPage, /instagram-likes-deutsch-beitragslink/);
  assert.match(productPage, /restrictToListedQuantities=\{likesDeutschPage\}/);
  assert.match(productPage, /sliderMinFromPackages=\{likesDeutschPage\}/);
  assert.match(productPage, /defaultPackageOffer: true/);
  assert.match(structured, /defaultPackageOffer/);
  const seo = read("lib/instagram-likes-deutsch-seo.ts");
  assert.match(seo, /data-fbdl-price-for/);
  assert.match(seo, /data-fbdl-unit-for/);
  assert.match(seo, /deutschsprachige Accountmerkmale/);
  const html = read("content/product-html/instagram-likes-deutsch-kaufen.html");
  assert.match(html, /fbde-likes-copy/);
  assert.match(html, /Dein Beitrag/);
  assert.match(html, /Likes mit Sprachbezug/);
  assert.match(html, /href="#produkt-auswahl"/);
  assert.match(html, /data-fbdl-price-for="50"/);
  assert.match(html, /\/product\/instagram-likes-kaufen/);
  assert.match(html, /fbdl-faq/);
  assert.doesNotMatch(html, /href=["']\/products["']/);
  assert.equal((html.match(/<h1\b/gi) || []).length, 0);
  assert.equal((html.match(/<!DOCTYPE|<html\b|<head\b|<body\b/gi) || []).length, 0);
  assert.equal((html.match(/:root\b|\bfonts\.google|\bhtml\s*\{|\bbody\s*\{/gi) || []).length, 0);
  assert.equal((html.match(/<details>/g) || []).length, 6);
  assert.equal(
    (html.match(/Explore München|Explore Delhi|88\s*%|60\s*% der Marketer|6,81\s*%|bis zu 79\s*%|Audit-Tools|Brand Deal|Klarna|Drip-Feed|6–24 Stunden|Für Privatpersonen ja|garantiert aus Deutschland|echte deutsche Nutzer/gi) || []).length,
    0
  );
  const orderBlock = read("components/ProductOrderBlock.tsx");
  assert.match(orderBlock, /restrictToListedQuantities/);
  assert.match(orderBlock, /snapToListedQuantity/);
  const paypal = read("app/api/paypal/create-order/route.ts");
  assert.match(paypal, /authorizeCheckoutPrices/);
});

test("Sitemap und IndexNow-Key-Datei sind vorhanden", () => {
  assert.match(read("app/sitemap.ts"), /productCanonicalUrl/);
  assert.match(read("app/sitemap.ts"), /canonicalUrl/);
  const key = read("public/a8c39dc9f6e64c79b59409b682c15d4c.txt").trim();
  assert.equal(key, "a8c39dc9f6e64c79b59409b682c15d4c");
});
