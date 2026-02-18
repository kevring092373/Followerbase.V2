/**
 * Blog-Beitrag: Gesamte Seite = eingegebener HTML-Code (1:1 ausgegeben).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog-data";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Beitrag – Followercloud" };
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? undefined;
  return {
    title: `${title} – Followercloud`,
    description,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);

  if (!post) notFound();

  return (
    <>
      <Link href="/blog" className="blog-back">
        ← Blog
      </Link>
      <div
        className="blog-page-html"
        dangerouslySetInnerHTML={{ __html: (post.content ?? "").trim() || "" }}
      />
    </>
  );
}
