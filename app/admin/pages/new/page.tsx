/**
 * Admin: Neue Seite erstellen.
 */
import Link from "next/link";
import { PageForm } from "../PageForm";

export default function AdminPagesNewPage() {
  return (
    <>
      <Link href="/admin/pages" className="admin-back">
        ← Seiten
      </Link>
      <h1 className="heading-hero">Neue Seite</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Alle Felder mit * sind Pflicht.
      </p>
      <PageForm />
    </>
  );
}
