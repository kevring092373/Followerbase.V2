/**
 * Bestellübersicht nach der Zahlung: Danke-Seite mit gekauften Artikeln und Summe.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders-data";
import { getOrderTotalCents, getPaymentMethodLabel } from "@/lib/orders";

type Props = {
  searchParams: Promise<{ order?: string; success?: string }>;
};

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

export default async function BestellungDankePage({ searchParams }: Props) {
  const params = await searchParams;
  const orderNumber = (params.order ?? params.success ?? "").trim();
  if (!orderNumber) notFound();

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const totalCents = getOrderTotalCents(order);
  const paymentLabel = getPaymentMethodLabel(order);
  const isUeberweisung = order.paymentMethod === "ueberweisung";

  return (
    <div className="danke-page">
      <h1 className="danke-title">Vielen Dank für deine Bestellung</h1>
      <p className="danke-intro">
        Wir haben deine Bestellung erhalten. {isUeberweisung && "Bitte schließe die Überweisung ab, damit wir starten können."}
      </p>

      <div className="danke-card card">
        <h2 className="danke-heading">Deine Bestellübersicht</h2>
        <p className="danke-order-number">
          Bestellnummer: <strong>{order.orderNumber}</strong>
        </p>
        <p className="danke-meta">
          {formatDate(order.createdAt)} · {paymentLabel}
        </p>

        {order.items && order.items.length > 0 && (
          <>
            <h3 className="danke-items-heading">Gekaufte Artikel</h3>
            <ul className="danke-items-list">
              {order.items.map((item, i) => (
                <li key={i} className="danke-item">
                  <span className="danke-item-name">{item.productName}</span>
                  <span className="danke-item-meta">
                    {item.quantity} × {(item.priceCents / 100).toFixed(2)} €
                    {item.target ? ` · ${item.target}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="danke-total">
              Gesamtbetrag: <strong>{(totalCents / 100).toFixed(2)} €</strong>
            </p>
          </>
        )}

        {order.sellerNote && (
          <p className="danke-note">
            <span className="danke-note-label">Deine Nachricht an uns:</span> {order.sellerNote}
          </p>
        )}
      </div>

      <div className="danke-actions">
        {isUeberweisung && (
          <Link
            href={`/kasse/ueberweisung?order=${encodeURIComponent(order.orderNumber)}`}
            className="btn btn-primary"
          >
            Zur Überweisung (Bankdaten & Verwendungszweck)
          </Link>
        )}
        <Link
          href={`/bestellung-verfolgen?success=${encodeURIComponent(order.orderNumber)}`}
          className={isUeberweisung ? "btn btn-secondary" : "btn btn-primary"}
        >
          Bestellung verfolgen
        </Link>
        <Link href="/" className="btn btn-secondary">
          Zurück zum Shop
        </Link>
      </div>
    </div>
  );
}
