/**
 * Admin: Eigene Seiten verwalten (bearbeiten, hinzufügen, löschen).
 * Zeigt auch vorhandene statische Seiten (Impressum, Datenschutz, …).
 */
import Link from "next/link";
import { getAllPages } from "@/lib/pages-data";
import { DeletePageButton } from "./DeletePageButton";

/** Statische Seiten (im Code), nur Anzeige/Link – nicht bearbeitbar im CMS. */
const STATIC_PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Start" },
  { path: "/products", label: "Produktübersicht" },
  { path: "/blog", label: "Blog" },
  { path: "/bestellung-verfolgen", label: "Bestellung verfolgen" },
  { path: "/instagram-profilbild", label: "Instagram-Profilbild" },
  { path: "/impressum", label: "Impressum" },
  { path: "/datenschutz", label: "Datenschutz" },
  { path: "/agb", label: "AGB" },
  { path: "/kontakt", label: "Kontakt" },
  { path: "/widerrufsbelehrung", label: "Widerrufsbelehrung" },
];

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

      <p style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/pages/new" className="btn btn-primary">
          Neue Seite
        </Link>
      </p>

      <h2 className="admin-section-title">Im CMS verwaltete Seiten</h2>
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
        {pages.length === 0 && (
          <li className="admin-list-item card" style={{ opacity: 0.8 }}>
            <span>Noch keine CMS-Seiten. Mit „Neue Seite“ anlegen.</span>
          </li>
        )}
      </ul>

      <h2 className="admin-section-title" style={{ marginTop: "2rem" }}>
        Vorhandene statische Seiten
      </h2>
      <p className="subtitle" style={{ marginBottom: "0.75rem", fontSize: "0.95rem" }}>
        Diese Seiten liegen im Quellcode und werden hier nur zur Übersicht angezeigt.
      </p>
      <ul className="admin-list">
        {STATIC_PAGES.map(({ path, label }) => (
          <li key={path} className="admin-list-item card">
            <div>
              <strong>{label}</strong>
              <span className="admin-list-meta">{path}</span>
            </div>
            <div className="admin-list-actions">
              <a href={path} target="_blank" rel="noopener noreferrer" className="admin-list-link">
                Ansehen
              </a>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
