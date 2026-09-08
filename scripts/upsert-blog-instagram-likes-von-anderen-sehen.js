/**
 * Baut den Shop-HTML-Artikel und schreibt ihn nach blog-posts.json.
 *
 *   node scripts/upsert-blog-instagram-likes-von-anderen-sehen.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const srcDir = String.raw`c:\Users\kevin\Documents\ChatGPT\Agentic_SEO_2.0\sites\followerbase-de\output\published\instagram-likes-von-anderen-sehen`;
const srcHtml = fs.readFileSync(path.join(srcDir, "html", "index.html"), "utf8");
const css = fs.readFileSync(path.join(srcDir, "editorial.css"), "utf8");

const hero = srcHtml.match(/<div class="hero">([\s\S]*?)<\/div>/i);
const article = srcHtml.match(/<main class="article-container">([\s\S]*?)<\/main>/i);
if (!hero || !article) throw new Error("Quelle: Hero oder Artikel nicht gefunden.");

let inner = article[1]
  .replace(/src="images\//g, 'src="/icons/')
  .replace(/https:\/\/followerbase\.de\/blog\/mehr-instagram-likes-guide/g, "/blog/mehr-instagram-likes-guide")
  .replace(/class="fb-faq"/g, 'class="fb-faq faq-item"')
  .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, "")
  .replace(/<div class="article-meta">[\s\S]*?<\/div>/i, "");

const heroImg = hero[1]
  .replace(/src="images\//g, 'src="/icons/')
  .trim();

const html = `<!DOCTYPE html>
<html lang="de-DE">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Instagram Likes von anderen sehen: Was geht 2026?</title>
<style>
${css.trim()}
</style>
</head>
<body>
<div class="fb-likes-guide">
  <div class="article-image">
    ${heroImg}
  </div>
  ${inner.trim()}
</div>
</body>
</html>
`;

const htmlPath = path.join(root, "content", "blog-html", "instagram-likes-von-anderen-sehen.html");
fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
fs.writeFileSync(htmlPath, html, "utf8");

const post = {
  slug: "instagram-likes-von-anderen-sehen",
  title: "Instagram Likes von anderen sehen: Was ist möglich?",
  excerpt:
    "Welche Likes anderer Nutzer kannst du auf Instagram sehen? Wir erklären einzelne Beiträge, den Freunde-Tab bei Reels und die Grenzen der Sichtbarkeit. Dazu erfährst du, wie du deine eigenen Aktivitäten einschränkst.",
  content: html,
  date: "2026-09-08",
  dateModified: "2026-09-08",
  metaTitle: "Instagram Likes von anderen sehen: Was geht 2026?",
  metaDescription:
    "Instagram Likes von anderen sehen: So prüfst du Beiträge und den Freunde-Tab bei Reels. Erfahre, was sichtbar ist und wie du deine Aktivität begrenzt.",
  image: "/icons/instagram-likes-von-anderen-sehen-hero.webp",
  category: "Instagram",
};

const jsonPath = path.join(root, "content", "blog-posts.json");
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
  html.length
);
