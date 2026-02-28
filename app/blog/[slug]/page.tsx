/**
 * Blog-Beitrag: Gesamte Seite = eingegebener HTML-Code (1:1 ausgegeben) + Autor-Box.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog-data";
import { absoluteUrl, truncateDescription, transformFaqToDetailsSummary } from "@/lib/seo";
import { ShareButtons } from "@/components/ShareButtons";
import { BlogAuthor } from "@/components/BlogAuthor";

type Props = { params: { slug: string } };

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

  return (
    <>
      <Link href="/blog" className="blog-back">
        ← Blog
      </Link>
      <ShareButtons
        url={blogUrl}
        title={postTitle}
        text={post.excerpt ?? undefined}
        className="share-buttons--blog"
      />
      <div
        className="blog-page-html"
        dangerouslySetInnerHTML={{
          __html: transformFaqToDetailsSummary((post.content ?? "").trim() || ""),
        }}
      />
      <BlogAuthor />
      <p className="blog-back-wrap">
        <Link href="/blog" className="blog-back blog-back-bottom">
          ← Zurück zum Blog
        </Link>
      </p>
    </>
  );
}
