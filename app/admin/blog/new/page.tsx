/**
 * Admin: Neuen Blog-Beitrag erstellen.
 */
import Link from "next/link";
import { BlogPostForm } from "../BlogPostForm";

export default function AdminBlogNewPage() {
  return (
    <>
      <Link href="/admin/blog" className="admin-back">
        ← Blog
      </Link>
      <h1 className="heading-hero">Neuer Beitrag</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Alle Felder mit * sind Pflicht.
      </p>
      <BlogPostForm />
    </>
  );
}
