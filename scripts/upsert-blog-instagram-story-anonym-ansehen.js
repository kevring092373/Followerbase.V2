/**
 * Fügt oder aktualisiert den Blog-Beitrag "instagram-story-anonym-ansehen"
 * aus content/blog-html/instagram-story-anonym-ansehen.html in blog-posts.json.
 *
 *   node scripts/upsert-blog-instagram-story-anonym-ansehen.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "content", "blog-html", "instagram-story-anonym-ansehen.html");
const jsonPath = path.join(root, "content", "blog-posts.json");

const post = {
  slug: "instagram-story-anonym-ansehen",
  title: "Instagram Story anonym ansehen: Viewer und Methoden im Check",
  excerpt:
    "Instagram Story anonym ansehen: Erfahre, welche Viewer und Methoden funktionieren, wo ihre Grenzen liegen und wie du deine Zugangsdaten schützt.",
  content: fs.readFileSync(htmlPath, "utf8"),
  date: "2026-09-06",
  dateModified: "2026-09-06",
  metaTitle: "Instagram Story anonym ansehen: Methoden im Check 2026",
  metaDescription:
    "Instagram Story anonym ansehen: Erfahre, welche Viewer und Methoden funktionieren, wo ihre Grenzen liegen und wie du deine Zugangsdaten schützt.",
  image: "/icons/instagram-story-anonym-ansehen-hero-v2.webp",
  category: "Instagram",
};

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
if (!Array.isArray(data.posts)) data.posts = [];
const idx = data.posts.findIndex((p) => p.slug === post.slug);
if (idx === -1) data.posts.unshift(post);
else data.posts[idx] = post;

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
console.log(
  idx === -1 ? "inserted" : "updated",
  post.slug,
  "posts:",
  data.posts.length,
  "html chars:",
  post.content.length
);
