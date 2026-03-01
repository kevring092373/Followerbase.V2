/**
 * Admin-Übersicht: Bestellungen verwalten.
 * Produkte, Blog und Seiten werden über Supabase bzw. extern gepflegt.
 */
import Link from "next/link";

export default function AdminPage() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="heading-hero">Admin</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Bestellungen verwalten. Ausführung der Bestellungen erfolgt extern.
          </p>
        </div>
        <Link
          href="/api/admin/logout"
          className="btn btn-secondary"
          style={{ flexShrink: 0 }}
        >
          Abmelden
        </Link>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1.5rem" }}>
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
