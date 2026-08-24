const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "content", "blog-html", "youtube-aufrufe-erhoehen.html");
const jsonPath = path.join(root, "content", "blog-posts.json");

const content = fs.readFileSync(htmlPath, "utf8");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const post = {
  slug: "youtube-aufrufe-erhoehen",
  title: "YouTube-Aufrufe erhöhen: 15 organische Strategien",
  excerpt:
    "YouTube-Aufrufe organisch erhöhen: 15 konkrete Strategien für Themen, Titel, Thumbnails, Zuschauerbindung, Shorts und Analytics – plus Diagnose und 30-Tage-Plan.",
  content,
  date: "2026-08-24",
  metaTitle: "YouTube-Aufrufe erhöhen: 15 organische Strategien",
  metaDescription:
    "YouTube-Aufrufe organisch erhöhen: 15 konkrete Strategien für Themen, Titel, Thumbnails, Zuschauerbindung, Shorts und Analytics.",
  image: "/icons/youtube-aufrufe-erhoehen-thumbnail.webp",
  category: "YouTube Aufrufe",
};

data.posts = (data.posts || []).filter((p) => p.slug !== post.slug);
data.posts.unshift(post);
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
console.log("Blog-Post eingefügt:", post.slug, "content bytes", content.length);
