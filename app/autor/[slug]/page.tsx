/**
 * Autorenseite: Kurzbiografie und alle Artikel des Autors.
 */
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog-data";
import { BLOG_AUTHOR, getAuthorPagePath, AUTHOR_SLUG } from "@/lib/blog-author";
import { absoluteUrl } from "@/lib/seo";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  if (params.slug !== AUTHOR_SLUG) return { title: "Autor" };
  const title = `${BLOG_AUTHOR.name} – Autor – Followerbase`;
  const description = `${BLOG_AUTHOR.role}. ${BLOG_AUTHOR.bio}`;
  const url = absoluteUrl(getAuthorPagePath());
  return {
    title,
    description,
    openGraph: { title, description, url, type: "profile" as const },
    twitter: { card: "summary" as const, title, description },
    alternates: { canonical: url },
  };
}

export function generateStaticParams() {
  return [{ slug: AUTHOR_SLUG }];
}

function buildPersonSchema() {
  const url = absoluteUrl(getAuthorPagePath());
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: BLOG_AUTHOR.name,
    jobTitle: BLOG_AUTHOR.role,
    description: BLOG_AUTHOR.bio,
    url,
    image: absoluteUrl(BLOG_AUTHOR.image),
  };
}

export default async function AutorPage({ params }: Props) {
  const slug = typeof params.slug === "string" ? params.slug : "";
  if (slug !== AUTHOR_SLUG) notFound();

  const posts = await getAllPosts();
  const personSchema = buildPersonSchema();

  return (
    <article className="legal-page autor-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <p className="autor-back">
        <Link href="/blog">← Blog</Link>
      </p>
      <div className="autor-header">
        <div className="autor-avatar">
          <Image
            src={BLOG_AUTHOR.image}
            alt={BLOG_AUTHOR.name}
            width={120}
            height={120}
            sizes="120px"
            className="autor-avatar-img"
          />
        </div>
        <div className="autor-header-text">
          <h1 className="heading-hero">{BLOG_AUTHOR.name}</h1>
          <p className="autor-role">{BLOG_AUTHOR.role}</p>
          <p className="autor-bio">{BLOG_AUTHOR.bio}</p>
        </div>
      </div>
      <h2 className="autor-articles-heading">Alle Artikel</h2>
      <ul className="autor-articles-list">
        {posts.map((post) => {
          const title = post.metaTitle ?? post.title ?? post.slug;
          const dateStr = post.date ? new Date(post.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : null;
          return (
            <li key={post.slug} className="autor-article-item">
              <Link href={`/blog/${post.slug}`} className="autor-article-link">
                <span className="autor-article-title">{title}</span>
                {dateStr && <span className="autor-article-date">{dateStr}</span>}
              </Link>
              {post.excerpt && <p className="autor-article-excerpt">{post.excerpt}</p>}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
