/**
 * Blog-Beitrag: Gesamte Seite = eingegebener HTML-Code (1:1 ausgegeben) + Autor-Box.
 */
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/blog-data";
import { absoluteUrl, truncateDescription, stripEmbeddedDuplicateSeoFromHtml } from "@/lib/seo";
import { BLOG_AUTHOR, getAuthorPagePath } from "@/lib/blog-author";
import { ShareButtons } from "@/components/ShareButtons";
import { BlogAuthor } from "@/components/BlogAuthor";
import { JsonLd } from "@/components/JsonLd";
import {
  buildBreadcrumbSchema,
  buildPublisherSchema,
  absoluteImageUrl,
  toIsoDateTime,
} from "@/lib/structured-data";

type Props = { params: { slug: string } };

/** Immer aktuell vom Server laden, damit Inhalt bei Navigation sofort sichtbar ist (nicht erst nach Reload). */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Beitrag" };
  // Supabase-Meta-Titel unverändert nutzen, sonst einmal „ – Followerbase“ anhängen
  const title = post.metaTitle?.trim()
    ? post.metaTitle.trim()
    : `${post.title ?? post.slug} – Followerbase`;
  const rawDesc = post.metaDescription ?? post.excerpt ?? post.content?.replace(/<[^>]+>/g, "").slice(0, 200) ?? "";
  const description = truncateDescription(rawDesc);
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    title,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      url,
      type: "article",
    },
    twitter: { card: "summary", title, description: description || undefined },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);

  if (!post) notFound();

  const postTitle = post.metaTitle ?? post.title ?? post.slug;
  const blogUrl = absoluteUrl(`/blog/${post.slug}`);
  const authorUrl = absoluteUrl(getAuthorPagePath());

  const datePublished = toIsoDateTime(post.date);
  const articleImage = post.image ? absoluteImageUrl(post.image) : undefined;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: postTitle,
    ...(post.excerpt?.trim() && { description: post.excerpt.trim() }),
    ...(articleImage && { image: [articleImage] }),
    ...(datePublished && { datePublished }),
    author: {
      "@type": "Person",
      name: BLOG_AUTHOR.name,
      url: authorUrl,
    },
    publisher: buildPublisherSchema(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogUrl,
    },
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: BLOG_AUTHOR.name,
    jobTitle: BLOG_AUTHOR.role,
    description: BLOG_AUTHOR.bio,
    url: authorUrl,
    image: absoluteUrl(BLOG_AUTHOR.image),
  };

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Startseite", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title ?? postTitle },
  ]);

  return (
    <div className="blog-post-page">
      <JsonLd data={articleSchema} />
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbSchema} />
      <a href="/blog" className="blog-back">
        ← Blog
      </a>
      <ShareButtons
        url={blogUrl}
        title={postTitle}
        text={post.excerpt ?? undefined}
        className="share-buttons--blog"
      />
      {post.image && (
        <div className="blog-post-image-wrap">
          {post.image.startsWith("/") ? (
            <Image
              src={post.image}
              alt={postTitle}
              width={1200}
              height={630}
              sizes="(max-width: 768px) 100vw, 1200px"
              className="blog-post-image"
              priority
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image} alt={postTitle} className="blog-post-image" />
          )}
        </div>
      )}
      <p className="blog-post-byline">
        Von <Link href={getAuthorPagePath()} className="blog-post-byline-link">{BLOG_AUTHOR.name}</Link>
      </p>
      <div
        className="blog-page-html"
        dangerouslySetInnerHTML={{
          __html: stripEmbeddedDuplicateSeoFromHtml((post.content ?? "").trim() || ""),
        }}
      />
      <BlogAuthor />
      <div className="blog-back-wrap">
        <form action="/blog" method="get" className="blog-back-form">
          <button type="submit" className="blog-back-bottom">
            ← Zurück zum Blog
          </button>
        </form>
      </div>
    </div>
  );
}
