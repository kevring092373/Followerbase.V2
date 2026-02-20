/**
 * Admin: Eigene Seiten verwalten (bearbeiten, hinzufügen, löschen).
 */
import Link from "next/link";
import { getAllPages } from "@/lib/pages-data";
import { DeletePageButton } from "./DeletePageButton";

export default async function AdminPagesPage() {
  const pages = await getAllPages();

  return (
    <>
      <Link href="/admin" className="admin-back">
        ← Admin
      </Link>
      <h1 className="heading-hero">Seiten</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Eigene Seiten erstellen, bearbeiten und löschen. URL + Titel + HTML-Inhalt. Anzeige unter /p/[slug].
      </p>

      <p style={{ marginBottom: "1rem" }}>
        <Link href="/admin/pages/new" className="btn btn-primary">
          Neue Seite
        </Link>
      </p>

      <ul className="admin-list">
        {pages.map((page) => (
          <li key={page.slug} className="admin-list-item card">
            <div>
              <strong>{page.title}</strong>
              <span className="admin-list-meta">/p/{page.slug}</span>
            </div>
            <div className="admin-list-actions">
              <Link href={`/admin/pages/${page.slug}/edit`} className="admin-list-link">
                Bearbeiten
              </Link>
              <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="admin-list-link">
                Ansehen
              </a>
              <DeletePageButton slug={page.slug} title={page.title} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
