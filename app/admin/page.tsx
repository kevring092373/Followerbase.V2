/**
 * Admin-Übersicht: Produkte & Bestellungen verwalten.
 */
import Link from "next/link";

export default function AdminPage() {
  return (
    <>
      <h1 className="heading-hero">Admin</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Verwaltung von Produkten und Bestellungen. Ausführung der Bestellungen erfolgt extern.
      </p>
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Link
          href="/admin/products"
          className="card"
          style={{ display: "block", padding: "1rem 1.25rem", color: "var(--text-primary)" }}
        >
          Produkte verwalten
        </Link>
        <Link
          href="/admin/blog"
          className="card"
          style={{ display: "block", padding: "1rem 1.25rem", color: "var(--text-primary)" }}
        >
          Blog-Beiträge
        </Link>
        <Link
          href="/admin/orders"
          className="card"
          style={{ display: "block", padding: "1rem 1.25rem", color: "var(--text-primary)" }}
        >
          Bestellungen
        </Link>
      </nav>
    </>
  );
}
