/**
 * Admin: Bestellungen mit Status-Filter und Löschen (doppelte Prüfung); Vorgänge mit Fehler.
 */
import Link from "next/link";
import { getAllOrders, getOrderErrors } from "@/lib/orders-data";
import { OrdersList } from "./OrdersList";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function AdminOrdersPage() {
  const [orders, errors] = await Promise.all([getAllOrders(), getOrderErrors()]);

  return (
    <>
      <Link
        href="/admin"
        className="text-muted"
        style={{ marginBottom: "1rem", display: "inline-block", fontSize: "0.9375rem" }}
      >
        ← Admin
      </Link>
      <h1 className="heading-hero">Bestellungen</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Bestellungen nach Status filtern. Unten: Vorgänge mit Fehler.
      </p>

      <OrdersList orders={orders} />

      <section className="admin-orders-section admin-orders-errors-section">
        <h2 className="admin-orders-col-heading admin-orders-errors-heading">Vorgänge mit Fehler</h2>
        {errors.length === 0 ? (
          <div className="card admin-errors-empty">
            <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
              Keine Fehlervorgänge.
            </p>
          </div>
        ) : (
          <ul className="admin-errors-list">
            {errors.map((err) => (
              <li key={err.id} className="card admin-error-item">
                <span className="admin-error-date">{formatDateTime(err.createdAt)}</span>
                <span className="admin-error-message">{err.message}</span>
                {err.totalCents != null && (
                  <span className="admin-error-amount">
                    {(err.totalCents / 100).toFixed(2)} €
                  </span>
                )}
                {err.paypalOrderId && (
                  <span className="admin-error-paypal">PayPal: {err.paypalOrderId}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
