import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const posts = JSON.parse(readFileSync(join(root, "content", "blog-posts.json"), "utf8")).posts;
const story = posts.find((p) => p.slug === "instagram-story-anonym-ansehen");
const likes = posts.find((p) => p.slug === "instagram-likes-von-anderen-sehen");

test("Neuer Story-Viewer-Beitrag ist vollständig in blog-posts.json", () => {
  assert.ok(story, "Beitrag instagram-story-anonym-ansehen fehlt");
  assert.equal(story.metaTitle, "Instagram Story anonym ansehen: Methoden im Check 2026");
  assert.ok(story.metaTitle.length <= 60, `metaTitle zu lang: ${story.metaTitle.length}`);
  assert.ok(story.metaDescription.length >= 120 && story.metaDescription.length <= 160);
  assert.equal(story.date, "2026-09-06");
  assert.equal(story.category, "Instagram");
  assert.equal(story.image, "/icons/instagram-story-anonym-ansehen-hero-v2.webp");
  assert.equal(story.content.includes("application/ld+json"), false);
  assert.equal(story.content.includes("site-header"), false);
  assert.match(story.content, /<h1>Instagram Story anonym ansehen: Viewer und Methoden im Check<\/h1>/);
  assert.match(story.content, /href="\/blog\/wie-like-ich-bei-instagram"/);
  assert.match(story.content, /href="\/blog\/fake-instagram-follower-erkennen"/);
  assert.match(story.content, /href="\/instagram-profilbild"/);
  assert.match(story.content, /href="\/blog\/instagram-reels-reichweite-erhoehen"/);
  assert.match(story.content, /class="faq-item"/);
  assert.equal((story.content.match(/class="faq-item"/g) || []).length, 6);
});

test("Story-Viewer-Bilder liegen unter public/icons", () => {
  assert.equal(existsSync(join(root, "public", "icons", "instagram-story-anonym-ansehen-hero-v2.webp")), true);
  assert.equal(
    existsSync(join(root, "public", "icons", "instagram-story-anonym-methoden-check-v2.webp")),
    true
  );
});

test("Likes-von-anderen-Beitrag ist vollständig in blog-posts.json", () => {
  assert.ok(likes, "Beitrag instagram-likes-von-anderen-sehen fehlt");
  assert.equal(likes.metaTitle, "Instagram Likes von anderen sehen: Was geht 2026?");
  assert.equal(likes.metaTitle.length, 49);
  assert.equal(likes.metaDescription.length, 150);
  assert.equal(likes.title, "Instagram Likes von anderen sehen: Was ist möglich?");
  assert.equal(likes.date, "2026-09-08");
  assert.equal(likes.category, "Instagram");
  assert.equal(likes.image, "/icons/instagram-likes-von-anderen-sehen-hero.webp");
  assert.equal(likes.content.includes("application/ld+json"), false);
  assert.equal(/<header\b/i.test(likes.content), false);
  assert.match(likes.content, /class="fb-likes-guide"/);
  assert.equal(/<h1[\s>]/i.test(likes.content), false);
  assert.match(likes.content, /href="\/blog\/mehr-instagram-likes-guide"/);
  assert.match(likes.content, /id="sichtbare-likes"/);
  assert.match(likes.content, /id="passende-ansicht"/);
  assert.equal((likes.content.match(/class="fb-faq faq-item"/g) || []).length, 6);
  assert.match(likes.content, /src="\/icons\/instagram-likes-von-anderen-sehen-hero\.webp"/);
  assert.match(likes.content, /src="\/icons\/instagram-likes-verbergen-unterschiede\.webp"/);
});

test("Likes-von-anderen-Bilder liegen unter public/icons", () => {
  assert.equal(existsSync(join(root, "public", "icons", "instagram-likes-von-anderen-sehen-hero.webp")), true);
  assert.equal(existsSync(join(root, "public", "icons", "instagram-likes-verbergen-unterschiede.webp")), true);
});

test("Verlinkte Blog-Slugs existieren", () => {
  const slugs = new Set(posts.map((p) => p.slug));
  for (const slug of [
    "wie-like-ich-bei-instagram",
    "fake-instagram-follower-erkennen",
    "instagram-reels-reichweite-erhoehen",
    "mehr-instagram-likes-guide",
    "instagram-story-anonym-ansehen",
    "instagram-likes-von-anderen-sehen",
    "mehr-instagram-follower-bekommen",
  ]) {
    assert.ok(slugs.has(slug), `Fehlender Zielbeitrag: ${slug}`);
  }
});

test("Profilbesucher-Beitrag ist veröffentlicht und vollständig", () => {
  const post = posts.find((p) => p.slug === "instagram-profilbesucher-sehen");
  assert.ok(post, "Beitrag instagram-profilbesucher-sehen fehlt");
  assert.notEqual(post.draft, true);
  assert.equal(post.metaTitle, "Instagram Profilbesucher sehen: Was wirklich möglich ist");
  assert.equal(post.metaTitle.length, 56);
  assert.equal(post.metaDescription.length, 160);
  assert.equal(post.title, "Instagram-Profilbesucher sehen: Wer war auf meinem Profil?");
  assert.equal(post.category, "Instagram");
  assert.equal(post.image, "/icons/instagram-profilbesucher-sehen-hero.webp");
  assert.equal(post.date, "2026-09-17");
  assert.equal(post.dateModified, "2026-09-17");
  assert.equal(post.content.includes("application/ld+json"), false);
  assert.equal(post.content.includes("noindex"), false);
  assert.equal(/<h1[\s>]/i.test(post.content), false);
  assert.match(post.content, /class="fb-profile-guide"/);
  assert.match(post.content, /class="fb-toc"/);
  assert.match(post.content, /id="profilbesucher-sehen"/);
  assert.match(post.content, /id="kennzahlen-verstehen"/);
  assert.match(post.content, /href="\/blog\/instagram-story-anonym-ansehen"/);
  assert.match(post.content, /href="\/blog\/instagram-likes-von-anderen-sehen"/);
  assert.match(post.content, /href="\/blog\/mehr-instagram-follower-bekommen"/);
  assert.doesNotMatch(post.content, /href=["']https:\/\/followerbase\.de\/blog\//);
  assert.equal((post.content.match(/class="fb-faq"/g) || []).length, 7);
  assert.match(post.content, /src="\/icons\/instagram-profilbesucher-sehen-hero\.webp"/);
  assert.match(post.content, /src="\/icons\/instagram-profilbesucher-sehen-ueberblick\.webp"/);
  assert.equal((post.content.match(/<table\b/g) || []).length, 1);
  const page = readFileSync(join(root, "app", "blog", "[slug]", "page.tsx"), "utf8");
  assert.match(page, /max-image-preview/);
  assert.match(page, /instagram-profilbesucher-sehen" \? null : buildFaqPageSchema/);
  const sitemap = readFileSync(join(root, "app", "sitemap.ts"), "utf8");
  assert.match(sitemap, /getPublishedPosts/);
});

test("Instagram-Follower-Ratgeber ist informational und verlinkt einmal zur Produktseite", () => {
  const post = posts.find((p) => p.slug === "instagram-follower-kaufen-ratgeber");
  assert.ok(post, "Beitrag instagram-follower-kaufen-ratgeber fehlt");
  assert.equal(post.metaTitle, "Instagram Follower kaufen 2026: Risiken & seriöse Anbieter");
  assert.equal(post.metaTitle.length, 58);
  assert.equal(post.metaDescription.length, 159);
  assert.equal(
    post.title,
    "Instagram Follower kaufen: Risiken, Kosten und woran du seriöse Anbieter erkennst (Ratgeber 2026)"
  );
  assert.equal(post.dateModified, "2026-11-25");
  assert.equal(/<h1[\s>]/i.test(post.content), false);
  assert.equal(post.content.includes("application/ld+json"), false);
  assert.match(post.content, /href="\/product\/instagram-follower-kaufen">Instagram Follower kaufen/);
  assert.equal((post.content.match(/\/product\/instagram-follower-kaufen/g) || []).length, 1);
  assert.equal((post.content.match(/class="faq-item"/g) || []).length, 6);
  assert.match(post.content, /src="\/icons\/instagram-follower-kaufen-gruende-follower-kauf\.webp"/);
  assert.match(post.content, /src="\/icons\/instagram-follower-kaufen-preisvergleich\.webp"/);
  const page = readFileSync(join(root, "app", "blog", "[slug]", "page.tsx"), "utf8");
  assert.match(page, /jobTitle: BLOG_AUTHOR.role/);
  assert.match(page, /worksFor:/);
  assert.match(page, /blog-article-author-bio-toggle/);
});

test("YouTube-Abonnenten-Ratgeber ist vollständig und intern verlinkt", () => {
  const post = posts.find((p) => p.slug === "youtube-abonnenten-kaufen-ratgeber");
  assert.ok(post, "Beitrag youtube-abonnenten-kaufen-ratgeber fehlt");
  assert.equal(post.metaTitle, "YouTube Abonnenten kaufen: Risiken & Kosten (2026)");
  assert.equal(post.metaTitle.length, 50);
  assert.equal(post.metaDescription.length, 156);
  assert.equal(
    post.title,
    "YouTube Abonnenten kaufen: Risiken, Kosten und seriöse Anbieter (Ratgeber 2026)"
  );
  assert.equal(post.date, "2026-11-25");
  assert.equal(post.dateModified, "2026-11-25");
  assert.equal(post.category, "YouTube");
  assert.equal(post.image, "/icons/youtube-abonnenten-kaufen-hero.webp");
  assert.equal(/<h1[\s>]/i.test(post.content), false);
  assert.equal(post.content.includes("application/ld+json"), false);
  assert.equal((post.content.match(/class="faq-item"/g) || []).length, 6);
  assert.match(post.content, /src="\/icons\/youtube-abonnenten-kaufen-hero\.webp"/);
  assert.match(post.content, /src="\/icons\/youtube-abonnenten-kaufen-schwelle\.webp"/);
  assert.match(post.content, /href="\/blog\/youtube-abonnenten-bekommen"/);
  assert.match(post.content, /href="\/product\/youtube-follower-kaufen">YouTube Abonnenten kaufen bei Followerbase/);
  assert.equal(existsSync(join(root, "public", "icons", "youtube-abonnenten-kaufen-hero.webp")), true);
  assert.equal(existsSync(join(root, "public", "icons", "youtube-abonnenten-kaufen-schwelle.webp")), true);
  const bekommen = posts.find((p) => p.slug === "youtube-abonnenten-bekommen");
  const preise = posts.find((p) => p.slug === "was-kosten-follower");
  assert.match(bekommen.content, /href="\/blog\/youtube-abonnenten-kaufen-ratgeber">YouTube Abonnenten kaufen Ratgeber/);
  assert.match(preise.content, /href="\/blog\/youtube-abonnenten-kaufen-ratgeber">im großen YouTube-Ratgeber/);
  assert.match(
    readFileSync(join(root, "content", "product-html", "youtube-follower-kaufen.html"), "utf8"),
    /href="\/blog\/youtube-abonnenten-kaufen-ratgeber">Ratgeber zu Risiken und Kosten beim Abonnenten-Kauf/
  );
  assert.match(
    readFileSync(join(root, "app", "products", "[categorySlug]", "page.tsx"), "utf8"),
    /Ratgeber: YouTube Abonnenten kaufen/
  );
});

test("Profilbesucher-Bilder liegen unter public/icons", () => {
  assert.equal(existsSync(join(root, "public", "icons", "instagram-profilbesucher-sehen-hero.webp")), true);
  assert.equal(
    existsSync(join(root, "public", "icons", "instagram-profilbesucher-sehen-ueberblick.webp")),
    true
  );
});
