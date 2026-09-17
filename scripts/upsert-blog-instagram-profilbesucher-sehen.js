/**
 * Baut den Shop-HTML-Artikel und schreibt ihn nach blog-posts.json.
 * Bleibt Entwurf: draft=true, keine IndexNow-Pings.
 *
 *   node scripts/upsert-blog-instagram-profilbesucher-sehen.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const srcDir = path.join(root, "_tmp-instagram-profilbesucher");
const slug = "instagram-profilbesucher-sehen";
const heroFile = "instagram-profilbesucher-sehen-hero.webp";
const overviewFile = "instagram-profilbesucher-sehen-ueberblick.webp";
const extraCss = `
.fb-profile-guide { max-width: 100%; min-width: 0; }
.fb-profile-guide .article-image img { width: 100%; height: auto; display: block; border-radius: 22px; border: 1px solid #ede8f7; }
.fb-profile-guide .fb-table:focus-visible { outline: 3px solid #7c3aed; outline-offset: 4px; }
`;

const css = fs.readFileSync(path.join(srcDir, "editorial.css"), "utf8");
let body = fs.readFileSync(path.join(srcDir, "content.html"), "utf8");

body = body
  .replace(/src="images\//g, 'src="/icons/')
  .replace(/https:\/\/followerbase\.de(\/blog\/[^"'\s>]+)/g, "$1");

if (/<h1[\s>]/i.test(body)) {
  throw new Error("content.html enthält eine H1 – der Shop-Wrapper setzt die H1.");
}

const hero = `<div class="article-image"><img alt="Instagram-Profilbesucher sehen: Was Insights, Story-Zuschauer und sichtbare Interaktionen tatsächlich verraten" width="1672" height="941" src="/icons/${heroFile}" decoding="async" fetchpriority="high"/></div>`;

if (!body.includes(`src="/icons/${overviewFile}"`)) {
  throw new Error("Übersichtsgrafik fehlt im Fragment.");
}

const html = `<!DOCTYPE html>
<html lang="de-DE">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Instagram Profilbesucher sehen: Was wirklich möglich ist</title>
<style>
${css.trim()}
${extraCss.trim()}
</style>
</head>
<body>
<div class="fb-profile-guide">
${hero}
${body.replace(/^<div class="fb-profile-guide">/, "").replace(/<\/div>\s*$/, "").trim()}
</div>
</body>
</html>
`;

const iconsDir = path.join(root, "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });
for (const file of [heroFile, overviewFile]) {
  fs.copyFileSync(path.join(srcDir, "images", file), path.join(iconsDir, file));
}

const htmlPath = path.join(root, "content", "blog-html", `${slug}.html`);
fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
fs.writeFileSync(htmlPath, html, "utf8");

const post = {
  slug,
  title: "Instagram-Profilbesucher sehen: Wer war auf meinem Profil?",
  excerpt:
    "Kannst du sehen, wer dein Instagram-Profil besucht hat? Wir erklären den Unterschied zwischen Profilaufrufen, Insights und Story-Zuschauern und zeigen, worauf du bei Besucher-Apps achten solltest.",
  content: html,
  metaTitle: "Instagram Profilbesucher sehen: Was wirklich möglich ist",
  metaDescription:
    "Instagram Profilbesucher sehen: Erfahre, was Insights und Story-Listen wirklich zeigen, welche Grenzen Besucher-Apps haben und wie du dein Konto sicher schützt.",
  image: `/icons/${heroFile}`,
  category: "Instagram",
  draft: true,
};

const jsonPath = path.join(root, "content", "blog-posts.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
if (!Array.isArray(data.posts)) data.posts = [];
const idx = data.posts.findIndex((p) => p.slug === post.slug);
if (idx === -1) data.posts.unshift(post);
else data.posts[idx] = post;
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");

const checks = [
  !/<h1[\s>]/i.test(html),
  !/noindex/i.test(html),
  !/application\/ld\+json/i.test(html),
  html.includes('class="fb-profile-guide"'),
  html.includes('href="/blog/instagram-story-anonym-ansehen"'),
  html.includes('href="/blog/instagram-likes-von-anderen-sehen"'),
  html.includes('href="/blog/mehr-instagram-follower-bekommen"'),
  (html.match(/class="fb-faq"/g) || []).length === 7,
  html.includes(`src="/icons/${overviewFile}"`),
  html.includes(`src="/icons/${heroFile}"`),
];
if (checks.some((ok) => !ok)) {
  throw new Error("Inhaltliche Checks nach dem Einbau fehlgeschlagen.");
}

console.log(idx === -1 ? "inserted" : "updated", slug, "posts:", data.posts.length, "html chars:", html.length);

