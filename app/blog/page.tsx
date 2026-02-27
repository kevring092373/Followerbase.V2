/**
 * Blog-Übersicht im Stil SEO München: Hero, Kategorie-Filter, Artikel-Karten.
 */
import { getAllPosts } from "@/lib/blog-data";
import { absoluteUrl } from "@/lib/seo";
import { BlogArticleList } from "@/components/BlogArticleList";

export const revalidate = 3600;

export const metadata = {
  title: "Blog",
  description:
    "Tipps, Anleitungen und News zu Followern, Likes und Reichweite für Instagram, TikTok & mehr.",
  openGraph: {
    title: "Blog – Followerbase",
    description: "Tipps und Anleitungen zu Reichweite und Social Media.",
    url: absoluteUrl("/blog"),
    type: "website" as const,
  },
  twitter: { card: "summary" as const, title: "Blog – Followerbase", description: "Tipps zu Followern und Reichweite." },
  alternates: { canonical: absoluteUrl("/blog") },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <>
      <header className="blog-hero">
        <h1 className="blog-hero-title">Blog</h1>
        <p className="blog-hero-subtitle">
          Tipps, Anleitungen und Insights zu Followern, Likes und Reichweite für Instagram, TikTok & mehr.
        </p>
      </header>

      <BlogArticleList posts={posts} />
    </>
  );
}
