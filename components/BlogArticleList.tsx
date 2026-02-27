"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog";

type Props = { posts: BlogPost[] };

export function BlogArticleList({ posts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Alle");

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    return ["Alle", ...Array.from(set).sort()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Alle") return posts;
    return posts.filter((p) => (p.category ?? "").trim() === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <section className="blog-articles-section">
      <h2 className="blog-articles-heading">Blog-Artikel</h2>
      <p className="blog-articles-filter-label">Kategorie filtern</p>
      <div className="blog-articles-filters" role="tablist" aria-label="Kategorie filter">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`blog-articles-filter-chip ${selectedCategory === cat ? "blog-articles-filter-chip--active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="blog-list blog-list--articles">
        {filteredPosts.map((post) => (
          <article key={post.slug} className="blog-card blog-card--article card">
            <Link href={`/blog/${post.slug}`} className="blog-card-link">
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
            </Link>
          </article>
        ))}
      </div>
      {filteredPosts.length === 0 && (
        <p className="blog-articles-empty">Keine Beiträge in dieser Kategorie.</p>
      )}
    </section>
  );
}
