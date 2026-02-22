/**
 * Blog-Beitrag: Gesamte Seite = eingegebener HTML-Code (1:1 ausgegeben).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog-data";
import { absoluteUrl, truncateDescription } from "@/lib/seo";
import { ShareButtons } from "@/components/ShareButtons";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Beitrag" };
  const title = post.metaTitle ?? post.title ?? post.slug;
  const rawDesc = post.metaDescription ?? post.excerpt ?? post.content?.replace(/<[^>]+>/g, "").slice(0, 200) ?? "";
  const description = truncateDescription(rawDesc);
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    title,
    description: description || undefined,
    openGraph: {
      title: `${title} – Followerbase`,
      description: description || undefined,
      url,
      type: "article",
    },
    twitter: { card: "summary", title: `${title} – Followerbase`, description: description || undefined },
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
        dangerouslySetInnerHTML={{ __html: (post.content ?? "").trim() || "" }}
      />
    </>
  );
}
