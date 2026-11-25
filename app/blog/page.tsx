/**
 * Blog-Übersicht im Stil SEO München: Hero, Kategorie-Filter, Artikel-Karten.
 */
import { getPublishedPosts } from "@/lib/blog-data";
import { absoluteUrl, brandOgImage } from "@/lib/seo";
import { pageMetaDescription } from "@/lib/page-meta-descriptions";
import { BlogArticleList } from "@/components/BlogArticleList";

export const revalidate = 3600;

const description = pageMetaDescription("/blog");

export const metadata = {
  title: "Blog – Followerbase",
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title: "Blog – Followerbase",
    description,
    url: absoluteUrl("/blog"),
    type: "website" as const,
    images: [brandOgImage()],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Blog – Followerbase",
    description,
    images: [brandOgImage().url],
  },
  alternates: { canonical: absoluteUrl("/blog") },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

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
