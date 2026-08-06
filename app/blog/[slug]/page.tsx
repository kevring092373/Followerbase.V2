/**
 * Blog-Beitrag: Layout analog seomuenchen.com (sticky TOC links, Artikel rechts).
 */
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/blog-data";
import { absoluteUrl, truncateDescription } from "@/lib/seo";
import { BLOG_AUTHOR, getAuthorPagePath } from "@/lib/blog-author";
import {
  prepareBlogArticleHtml,
  estimateReadingMinutes,
  formatBlogDateDe,
} from "@/lib/blog-article";
import { ShareButtons } from "@/components/ShareButtons";
import { BlogAuthor } from "@/components/BlogAuthor";
import { BlogReadingProgress } from "@/components/BlogReadingProgress";
import { JsonLd } from "@/components/JsonLd";
import {
  buildBreadcrumbSchema,
  buildPublisherSchema,
  absoluteImageUrl,
  toIsoDateTime,
} from "@/lib/structured-data";

type Props = { params: { slug: string } };

/** Immer aktuell vom Server laden, damit Inhalt bei Navigation sofort sichtbar ist. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Beitrag" };
  const title = post.metaTitle?.trim()
    ? post.metaTitle.trim()
    : `${post.title ?? post.slug} – Followerbase`;
  const rawDesc =
    post.metaDescription ??
    post.excerpt ??
    post.content?.replace(/<[^>]+>/g, "").slice(0, 200) ??
    "";
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

  const postTitle = post.title ?? post.metaTitle ?? post.slug;
  const blogUrl = absoluteUrl(`/blog/${post.slug}`);
  const authorUrl = absoluteUrl(getAuthorPagePath());
  const authorPath = getAuthorPagePath();

  const prepared = prepareBlogArticleHtml(post.content ?? "");
  const readingMinutes =
    estimateReadingMinutes(prepared.htmlContent) ||
    estimateReadingMinutes(post.content ?? "");
  const dateLabel = formatBlogDateDe(post.date);

  const datePublished = toIsoDateTime(post.date);
  const articleImage = post.image ? absoluteImageUrl(post.image) : undefined;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle ?? postTitle,
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
    ...(post.category ? [{ name: post.category, path: "/blog" }] : []),
    { name: postTitle },
  ]);

  const showHero = Boolean(post.image) && !prepared.hasEmbeddedHero;
  const imageSrc =
    post.image && !post.image.startsWith("/") && !post.image.startsWith("http")
      ? `/icons/${post.image}`
      : post.image;

  return (
    <div className="blog-article">
      <BlogReadingProgress />
      <JsonLd data={articleSchema} />
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbSchema} />
      {prepared.styleContent ? (
        <style dangerouslySetInnerHTML={{ __html: prepared.styleContent }} />
      ) : null}

      <div className="blog-article-layout">
        {prepared.toc.length > 0 ? (
          <aside className="blog-toc-rail" aria-label="Inhaltsverzeichnis">
            <p className="blog-toc-rail-label">Inhaltsverzeichnis</p>
            <nav className="blog-toc-rail-nav">
              <ol className="blog-toc-rail-list">
                {prepared.toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        ) : (
          <div className="blog-toc-rail blog-toc-rail--empty" aria-hidden />
        )}

        <article className="blog-article-main">
          <nav className="blog-breadcrumb" aria-label="Brotkrumen">
            <ol>
              <li>
                <Link href="/">Startseite</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              {post.category ? (
                <li>
                  <Link href="/blog">{post.category}</Link>
                </li>
              ) : null}
              <li aria-current="page">
                <span>{postTitle}</span>
              </li>
            </ol>
          </nav>

          {prepared.heroHtml ? (
            <div
              className="blog-article-hero blog-article-hero--embedded"
              dangerouslySetInnerHTML={{ __html: prepared.heroHtml }}
            />
          ) : showHero && imageSrc ? (
            <div className="blog-article-hero">
              {imageSrc.startsWith("/") ? (
                <Image
                  src={imageSrc}
                  alt={postTitle}
                  width={1200}
                  height={630}
                  sizes="(max-width: 900px) 100vw, 760px"
                  className="blog-article-hero-img"
                  priority
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc} alt={postTitle} className="blog-article-hero-img" />
              )}
            </div>
          ) : null}

          <div className="blog-article-author-bar">
            <Link href={authorPath} className="blog-article-author-avatar" aria-hidden>
              <Image
                src={BLOG_AUTHOR.image}
                alt=""
                width={44}
                height={44}
                sizes="44px"
              />
            </Link>
            <div className="blog-article-author-meta">
              <span className="blog-article-author-label">Autor</span>
              <Link href={authorPath} className="blog-article-author-name">
                {BLOG_AUTHOR.name}
              </Link>
            </div>
            <div className="blog-article-readtime" title="Geschätzte Lesezeit">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>{readingMinutes} Min. Lesezeit</span>
            </div>
          </div>

          {!/<h1[\s>]/i.test(prepared.htmlContent) ? (
            <h1 className="blog-article-title">{postTitle}</h1>
          ) : null}

          {(dateLabel || post.category) && !/<div[^>]*class=["'][^"']*\barticle-meta\b/i.test(prepared.htmlContent) ? (
            <p className="blog-article-meta-line">
              {dateLabel ? <>Veröffentlicht: {dateLabel}</> : null}
              {dateLabel ? " · " : null}
              Lesezeit: {readingMinutes} Min.
              {post.category ? <> · {post.category}</> : null}
            </p>
          ) : null}

          <div
            className="blog-page-html"
            dangerouslySetInnerHTML={{ __html: prepared.htmlContent }}
          />

          <ShareButtons
            url={blogUrl}
            title={post.metaTitle ?? postTitle}
            text={post.excerpt ?? undefined}
            className="share-buttons--blog"
          />

          <BlogAuthor />

          <div className="blog-back-wrap">
            <form action="/blog" method="get" className="blog-back-form">
              <button type="submit" className="blog-back-bottom">
                ← Zurück zum Blog
              </button>
            </form>
          </div>
        </article>
      </div>
    </div>
  );
}
