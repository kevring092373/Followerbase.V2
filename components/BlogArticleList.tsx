import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { blogCategoryPath } from "@/lib/blog-data";

type Props = { posts: BlogPost[]; activeCategory?: string };

export function BlogArticleList({ posts, activeCategory }: Props) {
  const categories = [
    "Alle",
    ...Array.from(
      new Set(
        posts
          .map((p) => p.category?.trim())
          .filter((name): name is string => Boolean(name))
      )
    ).sort(),
  ];

  const filteredPosts = activeCategory
    ? posts.filter((p) => (p.category ?? "").trim() === activeCategory)
    : posts;

  return (
    <section className="blog-articles-section">
      <h2 className="blog-articles-heading">Blog-Artikel</h2>
      <p className="blog-articles-filter-label">Kategorie filtern</p>
      <div className="blog-articles-filters" role="tablist" aria-label="Kategorie filter">
        {categories.map((cat) => {
          const href = cat === "Alle" ? "/blog" : blogCategoryPath(cat);
          const isActive = cat === "Alle" ? !activeCategory : cat === activeCategory;
          return (
            <Link
              key={cat}
              href={href}
              role="tab"
              aria-selected={isActive}
              className={`blog-articles-filter-chip${isActive ? " blog-articles-filter-chip--active" : ""}`}
            >
              {cat}
            </Link>
          );
        })}
      </div>
      <div className="blog-list blog-list--articles">
        {filteredPosts.map((post) => (
          <article key={post.slug} className="blog-card blog-card--article card">
            <a href={`/blog/${post.slug}`} className="blog-card-link">
              {post.image && (
                <div className="blog-card-image-wrap">
                  {post.image.startsWith("/") ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={220}
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="blog-card-image"
                    />
                  ) : (
                    <img src={post.image} alt={post.title} className="blog-card-image" />
                  )}
                </div>
              )}
              <div className="blog-card-body">
                {post.category && (
                  <span className="blog-card-category">{post.category}</span>
                )}
                <h3 className="blog-card-title blog-card-title--article">{post.title}</h3>
                {post.excerpt && (
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                )}
                <span className="blog-card-more">Artikel lesen</span>
              </div>
            </a>
          </article>
        ))}
      </div>
      {filteredPosts.length === 0 && (
        <p className="blog-articles-empty">Keine Beiträge in dieser Kategorie.</p>
      )}
    </section>
  );
}
