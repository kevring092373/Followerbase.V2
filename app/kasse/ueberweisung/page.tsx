/**
 * Seite nach Abschluss einer Überweisungsbestellung: Bankdaten + Verwendungszweck.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders-data";
import { getOrderTotalCents } from "@/lib/orders";
import { getBankDetails, getVerwendungszweck } from "@/lib/bank-data";

type Props = {
  searchParams: Promise<{ order?: string }>;
};

export default async function UeberweisungPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderNumber = params.order?.trim();
  if (!orderNumber) notFound();

  const order = await getOrderByNumber(orderNumber);
  if (!order || order.paymentMethod !== "ueberweisung") notFound();

  const totalCents = getOrderTotalCents(order);
  const bank = getBankDetails();
  const verwendungszweck = getVerwendungszweck(order.orderNumber);

  return (
    <div className="ueberweisung-page">
      <h1 className="heading-hero">Überweisung</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Bitte überweise den Betrag mit dem angegebenen Verwendungszweck. Sobald die Zahlung bei uns
        eingegangen ist, bearbeiten wir deine Bestellung.
      </p>

      <div className="card ueberweisung-card">
        <h2 className="ueberweisung-heading">Deine Bestellung</h2>
        <p className="ueberweisung-order-number">
          Bestellnummer: <strong>{order.orderNumber}</strong>
        </p>
        <p className="ueberweisung-amount">
          Betrag: <strong>{(totalCents / 100).toFixed(2)} €</strong>
        </p>

        <h2 className="ueberweisung-heading">Bankverbindung</h2>
        <dl className="ueberweisung-bank-dl">
          <dt>Empfänger</dt>
          <dd>{bank.recipient}</dd>
          <dt>IBAN</dt>
          <dd className="ueberweisung-iban">{bank.iban}</dd>
          <dt>BIC</dt>
          <dd>{bank.bic}</dd>
          <dt>Bank</dt>
          <dd>{bank.bankName}</dd>
          <dt>Verwendungszweck</dt>
          <dd className="ueberweisung-zweck">
            <strong>{verwendungszweck}</strong>
          </dd>
        </dl>
        <p className="ueberweisung-hint">
          Bitte gib den Verwendungszweck <strong>genau so</strong> bei der Überweisung an, damit wir
          deine Zahlung zuordnen können.
        </p>
      </div>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/bestellung-verfolgen" className="btn btn-primary">
          Bestellung verfolgen
        </Link>
      </p>
    </div>
  );
}
