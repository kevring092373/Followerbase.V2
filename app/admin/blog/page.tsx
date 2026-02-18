/**
 * Admin: Blog-Beiträge verwalten.
 */
import Link from "next/link";
import { getAllPosts } from "@/lib/blog-data";
import { DeletePostButton } from "./DeletePostButton";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return (
    <>
      <Link href="/admin" className="admin-back">
        ← Admin
      </Link>
      <h1 className="heading-hero">Blog</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Beiträge erstellen, bearbeiten und löschen. URL + Bezeichnung + HTML.
      </p>

      <p style={{ marginBottom: "1rem" }}>
        <Link href="/admin/blog/new" className="btn btn-primary">
          Neuer Beitrag
        </Link>
      </p>

      <ul className="admin-list">
        {posts.map((post) => (
          <li key={post.slug} className="admin-list-item card">
            <div>
              <strong>{post.title}</strong>
              <span className="admin-list-meta">/blog/{post.slug}</span>
            </div>
            <div className="admin-list-actions">
              <Link href={`/admin/blog/${post.slug}/edit`} className="admin-list-link">
                Bearbeiten
              </Link>
              <DeletePostButton slug={post.slug} title={post.title} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
