/**
 * Blog-Übersicht: Liste aller Beiträge (Bezeichnung, optional Bild, Link).
 */
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog-data";

export const metadata = {
  title: "Blog – Followercloud",
  description: "Blog und Beiträge.",
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
