/**
 * Admin-Übersicht: Umsatz nach Status und Zeit. Bestellliste bleibt unter /admin/orders.
 */
import Link from "next/link";
import { getAllOrders } from "@/lib/orders-data";
import { toAdminRevenuePoints } from "@/lib/admin-stats";
import { AdminStatsDashboard } from "@/components/AdminStatsDashboard";
import styles from "./admin-stats.module.css";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminPage() {
  const orders = await getAllOrders();
  const points = toAdminRevenuePoints(orders);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="heading-hero">Übersicht</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Umsatz, Status und Verlauf. Bestellungen verwaltest du unverändert separat.
          </p>
        </div>
        <Link href="/api/admin/logout" className="btn btn-secondary" style={{ flexShrink: 0 }}>
          Abmelden
        </Link>
      </div>

      <nav className={styles.adminNav} aria-label="Admin-Bereich">
        <Link href="/admin" className={`${styles.navLink} ${styles.navLinkActive}`}>
          Übersicht
        </Link>
        <Link href="/admin/orders" className={styles.navLink}>
          Bestellungen
        </Link>
      </nav>

      <AdminStatsDashboard points={points} />
    </>
  );
}
