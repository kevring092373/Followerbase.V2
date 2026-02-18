/**
 * Admin: Blog-Beitrag bearbeiten.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog-data";
import { BlogPostForm } from "../../BlogPostForm";

type Props = { params: { slug: string } };

export default async function AdminBlogEditPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);

  if (!post) notFound();

  return (
    <>
      <Link href="/admin/blog" className="admin-back">
        ← Blog
      </Link>
      <h1 className="heading-hero">Beitrag bearbeiten</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        {post.title}
      </p>
      <BlogPostForm post={post} />
    </>
  );
}
