/**
 * Admin: Bestellungen mit Status-Filter und Löschen (doppelte Prüfung); Vorgänge mit Fehler.
 */
import Link from "next/link";
import { getAllOrders, getOrderErrors } from "@/lib/orders-data";
import { getOrderAmountCents } from "@/lib/orders";
import { OrdersList } from "./OrdersList";

/**
 * Nie cachen: neue Bestellungen entstehen in den Checkout-Routen, die den Admin-Pfad
 * nicht revalidieren. Ohne das blieb die Liste auf einem alten Stand stehen.
 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export default async function AdminOrdersPage() {
  const [orders, errors] = await Promise.all([getAllOrders(), getOrderErrors()]);

  const paid = orders.filter((o) => o.status !== "pending_payment" && o.status !== "storniert");
  const completed = orders.filter((o) => o.status === "abgeschlossen");
  const awaitingPayment = orders.filter((o) => o.status === "pending_payment");
  const cancelled = orders.filter((o) => o.status === "storniert");

  const sum = (list: typeof orders) =>
    list.reduce((total, order) => total + getOrderAmountCents(order), 0);

  const totalCents = sum(paid);
  const completedCents = sum(completed);
  const awaitingCents = sum(awaitingPayment);
  const cancelledCents = sum(cancelled);

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

      <section className="admin-stats-section">
        <div className="admin-stats">
          <div className="card admin-stat">
            <span className="admin-stat-label">Gesamtumsatz</span>
            <span className="admin-stat-value">{formatEuro(totalCents)}</span>
            <span className="admin-stat-hint">
              {paid.length} {paid.length === 1 ? "Bestellung" : "Bestellungen"}
            </span>
          </div>
          <div className="card admin-stat">
            <span className="admin-stat-label">Umsatz abgeschlossen</span>
            <span className="admin-stat-value">{formatEuro(completedCents)}</span>
            <span className="admin-stat-hint">
              {completed.length} {completed.length === 1 ? "Bestellung" : "Bestellungen"}
            </span>
          </div>
        </div>
        {(awaitingPayment.length > 0 || cancelled.length > 0) && (
          <p className="admin-stats-note">
            Nicht enthalten:
            {awaitingPayment.length > 0 && (
              <>
                {" "}
                {formatEuro(awaitingCents)} aus {awaitingPayment.length}{" "}
                {awaitingPayment.length === 1 ? "Bestellung" : "Bestellungen"} mit ausstehender Zahlung
              </>
            )}
            {awaitingPayment.length > 0 && cancelled.length > 0 ? ";" : ""}
            {cancelled.length > 0 && (
              <>
                {" "}
                {formatEuro(cancelledCents)} aus {cancelled.length}{" "}
                {cancelled.length === 1 ? "stornierter Bestellung" : "stornierten Bestellungen"}
              </>
            )}
            .
          </p>
        )}
      </section>

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
