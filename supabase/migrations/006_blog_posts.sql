-- Blog-Beiträge (für Admin auf Netlify: read-only Dateisystem)
-- Im Supabase-Dashboard: SQL Editor → New Query → einfügen → Run.

CREATE TABLE IF NOT EXISTS blog_posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  date TEXT,
  meta_title TEXT,
  meta_description TEXT,
  image TEXT,
  category TEXT
);

COMMENT ON TABLE blog_posts IS 'Blog-Beiträge – auf Netlify statt content/blog-posts.json';
