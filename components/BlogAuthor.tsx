/**
 * Autor-Box für Blog-Beiträge: Name, Foto, Kurzbiografie, Link zur Autorenseite.
 */
import Image from "next/image";
import Link from "next/link";
import { BLOG_AUTHOR, getAuthorPagePath } from "@/lib/blog-author";

export function BlogAuthor() {
  const authorPath = getAuthorPagePath();
  return (
    <aside className="blog-author" aria-label="Autor">
      <div className="blog-author-inner">
        <div className="blog-author-avatar" aria-hidden>
          <Link href={authorPath}>
            <Image
              src={BLOG_AUTHOR.image}
              alt={BLOG_AUTHOR.name}
              width={56}
              height={56}
              sizes="56px"
              className="blog-author-avatar-img"
            />
          </Link>
        </div>
        <div className="blog-author-text">
          <p className="blog-author-name">
            <Link href={authorPath} className="blog-author-name-link">
              {BLOG_AUTHOR.name}
            </Link>
          </p>
          <p className="blog-author-role">{BLOG_AUTHOR.role}</p>
          <p className="blog-author-bio">{BLOG_AUTHOR.bio}</p>
          <p className="blog-author-page-link">
            <Link href={authorPath}>Alle Artikel von {BLOG_AUTHOR.name}</Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
