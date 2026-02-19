/**
 * Admin: Einzelne Bestellung – Details, Summe, Zahlungsart, Verlauf, Bearbeitung.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders-data";
import { getStatusLabel, ORDER_STATUSES, getOrderTotalCents, getPaymentMethodLabel } from "@/lib/orders";
import { updateOrderStatusAction } from "../actions";
import { DeleteOrderButton } from "../DeleteOrderButton";

type Props = { params: { orderNumber: string } };

function formatDate(iso: string) {
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

export default async function AdminOrderDetailPage({ params }: Props) {
  const order = await getOrderByNumber(params.orderNumber);
  if (!order) notFound();

  const totalCents = getOrderTotalCents(order);
  const paymentLabel = getPaymentMethodLabel(order);
  const totalDisplay = `${(totalCents / 100).toFixed(2)} €`;

  return (
    <>
      <Link
        href="/admin/orders"
        className="text-muted"
        style={{ marginBottom: "1rem", display: "inline-block", fontSize: "0.9375rem" }}
      >
        ← Bestellungen
      </Link>
      <h1 className="heading-hero">{order.orderNumber}</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Bestelldetails, Summe, Zahlungsart und Verlauf.
      </p>

      <div className="admin-order-detail card">
        {/* Verlauf (Timeline) */}
        <section className="admin-order-detail-section">
          <h2 className="admin-order-detail-heading">Verlauf</h2>
          <ul className="admin-order-timeline">
            <li className="admin-order-timeline-item">
              <span className="admin-order-timeline-dot" />
              <span className="admin-order-timeline-label">Bestellung aufgegeben</span>
              <span className="admin-order-timeline-date">{formatDate(order.createdAt)}</span>
            </li>
            {order.updatedAt && order.updatedAt !== order.createdAt && (
              <li className="admin-order-timeline-item">
                <span className="admin-order-timeline-dot" />
                <span className="admin-order-timeline-label">Zuletzt aktualisiert</span>
                <span className="admin-order-timeline-date">{formatDate(order.updatedAt)}</span>
              </li>
            )}
            <li className="admin-order-timeline-item admin-order-timeline-item--status">
              <span className={`admin-order-timeline-dot ${statusColorClass(order.status)}`} />
              <span className="admin-order-timeline-label">Aktueller Status</span>
              <span className={`admin-order-status-badge ${statusColorClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </li>
          </ul>
        </section>

        {/* Zahlungsart & Summe */}
        <section className="admin-order-detail-section admin-order-detail-meta">
          <div className="admin-order-meta-row">
            <span className="admin-order-meta-label">Zahlungsart</span>
            <span className="admin-order-meta-value">{paymentLabel}</span>
          </div>
          <div className="admin-order-meta-row">
            <span className="admin-order-meta-label">Gesamtsumme</span>
            <span className="admin-order-meta-value admin-order-total">
              {totalDisplay}
            </span>
            <span className="admin-order-meta-hint">(aus Einzelpositionen)</span>
          </div>
        </section>

        {/* Kundendaten */}
        {(order.customerEmail || order.customerName || order.customerPhone || order.customerAddressLine1) && (
          <section className="admin-order-detail-section">
            <h2 className="admin-order-detail-heading">Kundendaten</h2>
            <dl className="admin-order-customer-dl">
              {order.customerEmail && (
                <>
                  <dt>E-Mail</dt>
                  <dd>{order.customerEmail}</dd>
                </>
              )}
              {order.customerName && (
                <>
                  <dt>Name</dt>
                  <dd>{order.customerName}</dd>
                </>
              )}
              {order.customerPhone && (
                <>
                  <dt>Telefon</dt>
                  <dd>{order.customerPhone}</dd>
                </>
              )}
              {(order.customerAddressLine1 || order.customerCity) && (
                <>
                  <dt>Adresse</dt>
                  <dd>
                    {[
                      order.customerAddressLine1,
                      order.customerAddressLine2,
                      [order.customerPostalCode, order.customerCity].filter(Boolean).join(" "),
                      order.customerCountry,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </>
              )}
            </dl>
          </section>
        )}

        {/* Artikel */}
        {order.items && order.items.length > 0 && (
          <section className="admin-order-detail-section">
            <h2 className="admin-order-detail-heading">Artikel</h2>
            <ul className="admin-order-detail-items">
              {order.items.map((item, i) => (
                <li key={i} className="admin-order-detail-item">
                  <span className="admin-order-detail-item-name">{item.productName}</span>
                  <span className="admin-order-detail-item-meta">
                    {item.quantity} × {(item.priceCents / 100).toFixed(2)} € · {item.target}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {order.sellerNote && (
          <section className="admin-order-detail-section">
            <h2 className="admin-order-detail-heading">Nachricht des Kunden</h2>
            <p className="admin-order-detail-note">{order.sellerNote}</p>
          </section>
        )}

        {order.remarks && (
          <section className="admin-order-detail-section">
            <h2 className="admin-order-detail-heading">Bemerkungen</h2>
            <p className="admin-order-detail-remarks">{order.remarks}</p>
          </section>
        )}

        {/* Status & Bemerkungen bearbeiten */}
        <section className="admin-order-detail-section admin-order-detail-form-section">
          <h2 className="admin-order-detail-heading">Status & Bemerkungen bearbeiten</h2>
          <form action={updateOrderStatusAction} className="admin-order-form">
            <input type="hidden" name="orderNumber" value={order.orderNumber} />
            <div className="admin-order-form-row">
              <label htmlFor="order-status">Status</label>
              <select
                id="order-status"
                name="status"
                defaultValue={order.status}
                className="admin-order-select"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-order-form-row">
              <label htmlFor="order-remarks">Bemerkungen</label>
              <textarea
                id="order-remarks"
                name="remarks"
                defaultValue={order.remarks ?? ""}
                rows={3}
                className="admin-order-textarea"
                placeholder="Interne Notizen (optional)"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Speichern
            </button>
          </form>
        </section>

        <section className="admin-order-detail-section admin-order-detail-delete-section">
          <h2 className="admin-order-detail-heading">Bestellung löschen</h2>
          <p className="admin-order-delete-hint">
            Die Bestellung wird unwiderruflich gelöscht. Es erscheinen zwei Bestätigungsschritte.
          </p>
          <DeleteOrderButton orderNumber={order.orderNumber} redirectToOrders={true} />
        </section>
      </div>
    </>
  );
}
