/**
 * Blog-Übersicht: Liste aller Beiträge (Bezeichnung, optional Bild, Link).
 */
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog-data";

import { absoluteUrl } from "@/lib/seo";

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
      <header className="blog-page-header">
        <h1 className="heading-hero">Blog</h1>
        <p className="subtitle blog-subtitle">
          Wähle einen Beitrag.
        </p>
      </header>

      <div className="blog-list">
        {posts.map((post) => (
          <article key={post.slug} className="blog-card card">
            <Link href={`/blog/${post.slug}`} className="blog-card-link">
              {post.image && (
                <div className="blog-card-image-wrap">
                  {post.image.startsWith("/") ? (
                    <Image
                      src={post.image}
                      alt=""
                      width={400}
                      height={220}
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="blog-card-image"
                    />
                  ) : (
                    <img src={post.image} alt="" className="blog-card-image" />
                  )}
                </div>
              )}
              <div className="blog-card-body">
                <h2 className="blog-card-title">{post.title}</h2>
                {post.excerpt && (
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                )}
                <span className="blog-card-more">Weiterlesen →</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
