/**
 * Admin: Nur bezahlte Bestellungen; extra Bereich „Vorgänge mit Fehler“.
 */
import Link from "next/link";
import { getAllOrders, getOrderErrors } from "@/lib/orders-data";
import { getStatusLabel } from "@/lib/orders";

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

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

function statusColorClass(status: string): string {
  const map: Record<string, string> = {
    pending_payment: "admin-order-status--pending",
    eingegangen: "admin-order-status--eingegangen",
    gestartet: "admin-order-status--gestartet",
    in_ausfuehrung: "admin-order-status--ausfuehrung",
    abgeschlossen: "admin-order-status--abgeschlossen",
  };
  return map[status] ?? "admin-order-status--default";
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
        Nur von Kunden bezahlte Bestellungen. Unten: Vorgänge, bei denen ein Fehler vorlag.
      </p>

      <section className="admin-orders-section">
        <h2 className="admin-orders-col-heading">Bezahlte Bestellungen</h2>
        {orders.length === 0 ? (
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
              Noch keine Bestellungen.
            </p>
          </div>
        ) : (
          <ul className="admin-orders-compact-list">
            {orders.map((order) => (
              <li key={order.orderNumber}>
                <Link
                  href={`/admin/orders/${encodeURIComponent(order.orderNumber)}`}
                  className="admin-order-row card"
                >
                  <span className="admin-order-row-number">{order.orderNumber}</span>
                  <span className="admin-order-row-date">{formatDateShort(order.createdAt)}</span>
                  <span
                    className={`admin-order-status-badge admin-order-status-badge--compact ${statusColorClass(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

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
