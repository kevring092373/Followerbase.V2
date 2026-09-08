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
  ]) {
    assert.ok(slugs.has(slug), `Fehlender Zielbeitrag: ${slug}`);
  }
});
