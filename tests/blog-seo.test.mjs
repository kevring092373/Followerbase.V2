import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const posts = JSON.parse(readFileSync(join(root, "content", "blog-posts.json"), "utf8")).posts;
const post = posts.find((p) => p.slug === "instagram-story-anonym-ansehen");

test("Neuer Story-Viewer-Beitrag ist vollständig in blog-posts.json", () => {
  assert.ok(post, "Beitrag instagram-story-anonym-ansehen fehlt");
  assert.equal(post.metaTitle, "Instagram Story anonym ansehen: Methoden im Check 2026");
  assert.ok(post.metaTitle.length <= 60, `metaTitle zu lang: ${post.metaTitle.length}`);
  assert.ok(post.metaDescription.length >= 120 && post.metaDescription.length <= 160);
  assert.equal(post.date, "2026-09-06");
  assert.equal(post.category, "Instagram");
  assert.equal(post.image, "/icons/instagram-story-anonym-ansehen-hero-v2.webp");
  assert.equal(post.content.includes("application/ld+json"), false);
  assert.equal(post.content.includes("site-header"), false);
  assert.match(post.content, /<h1>Instagram Story anonym ansehen: Viewer und Methoden im Check<\/h1>/);
  assert.match(post.content, /href="\/blog\/wie-like-ich-bei-instagram"/);
  assert.match(post.content, /href="\/blog\/fake-instagram-follower-erkennen"/);
  assert.match(post.content, /href="\/instagram-profilbild"/);
  assert.match(post.content, /href="\/blog\/instagram-reels-reichweite-erhoehen"/);
  assert.match(post.content, /class="faq-item"/);
  assert.equal((post.content.match(/class="faq-item"/g) || []).length, 6);
});

test("Story-Viewer-Bilder liegen unter public/icons", () => {
  assert.equal(existsSync(join(root, "public", "icons", "instagram-story-anonym-ansehen-hero-v2.webp")), true);
  assert.equal(
    existsSync(join(root, "public", "icons", "instagram-story-anonym-methoden-check-v2.webp")),
    true
  );
});

test("Verlinkte Blog-Slugs existieren", () => {
  const slugs = new Set(posts.map((p) => p.slug));
  for (const slug of ["wie-like-ich-bei-instagram", "fake-instagram-follower-erkennen", "instagram-reels-reichweite-erhoehen"]) {
    assert.ok(slugs.has(slug), `Fehlender Zielbeitrag: ${slug}`);
  }
});
