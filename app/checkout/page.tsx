"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

function CheckoutContent() {
  const router = useRouter();
  const { items, sellerNote, itemCount, clearCart, openCart } = useCart();
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Deutschland");
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "ueberweisung">("paypal");
  const [ueberweisungLoading, setUeberweisungLoading] = useState(false);

  const totalCents = useMemo(() => items.reduce((sum, i) => sum + i.priceCents, 0), [items]);

  const orderItems = useMemo(
    () =>
      items.map((i) => ({
        productSlug: i.productSlug,
        productName: i.productName,
        quantity: i.quantity,
        priceCents: i.priceCents,
        target: i.target,
      })),
    [items]
  );

  const customerPayload = useMemo(() => {
    const e = email.trim();
    if (!e) return undefined;
    return {
      email: e,
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      addressLine1: addressLine1.trim() || undefined,
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      country: country.trim() || undefined,
    };
  }, [email, name, phone, addressLine1, addressLine2, city, postalCode, country]);

  const createOrder = useCallback(async () => {
    setPaypalError(null);
    if (!email.trim()) {
      setPaypalError("Bitte gib deine E-Mail-Adresse ein.");
      throw new Error("E-Mail fehlt.");
    }
    if (!email.includes("@")) {
      setPaypalError("Die E-Mail-Adresse muss ein @ enthalten.");
      throw new Error("E-Mail ungültig.");
    }
    if (!agbAccepted) {
      setPaypalError("Bitte akzeptiere die AGB (links), um fortzufahren.");
      throw new Error("AGB nicht akzeptiert.");
    }
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: totalCents,
          items: orderItems,
          sellerNote: sellerNote || undefined,
          customer: customerPayload,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Order konnte nicht erstellt werden.");
      }
      const id = data.paypalOrderId;
      if (!id || typeof id !== "string") {
        throw new Error("Server hat keine gültige PayPal-Order zurückgegeben.");
      }
      return id;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      setPaypalError(msg);
      throw e;
    }
  }, [email, agbAccepted, totalCents, orderItems, sellerNote, customerPayload]);

  const onApprove = useCallback(
    async (data: { orderID: string }) => {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalOrderId: data.orderID }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Zahlung konnte nicht abgeschlossen werden.");
      }
      const result = await res.json();
      clearCart();
      router.push(`/bestellung-verfolgen?success=${encodeURIComponent(result.orderNumber)}`);
    },
    [clearCart, router]
  );

  const submitUeberweisung = useCallback(async () => {
    setPaypalError(null);
    if (!email.trim()) {
      setPaypalError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }
    if (!email.includes("@")) {
      setPaypalError("Die E-Mail-Adresse muss ein @ enthalten.");
      return;
    }
    if (!agbAccepted) {
      setPaypalError("Bitte akzeptiere die AGB (links), um fortzufahren.");
      return;
    }
    if (!customerPayload) return;
    setUeberweisungLoading(true);
    try {
      const res = await fetch("/api/checkout/create-order-ueberweisung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: totalCents,
          items: orderItems,
          sellerNote: sellerNote || undefined,
          customer: customerPayload,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Bestellung konnte nicht erstellt werden.");
      }
      const orderNumber = data.orderNumber;
      if (!orderNumber) throw new Error("Keine Bestellnummer erhalten.");
      clearCart();
      router.push(`/kasse/ueberweisung?order=${encodeURIComponent(orderNumber)}`);
    } catch (e) {
      setPaypalError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setUeberweisungLoading(false);
    }
  }, [email, agbAccepted, customerPayload, totalCents, orderItems, sellerNote, clearCart, router]);

  if (itemCount === 0) {
    return (
      <div className="checkout-page">
        <h1 className="checkout-title">Kasse</h1>
        <div className="card checkout-empty">
          <p>Dein Warenkorb ist leer.</p>
          <Link href="/products" className="btn btn-primary">
            Zu den Produkten
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <button type="button" className="checkout-back" onClick={openCart}>
        ← Warenkorb
      </button>
      <h1 className="checkout-title">Kasse</h1>

      {paypalError && (
        <div className="checkout-error-banner" role="alert">
          {paypalError}
        </div>
      )}

      <div className="checkout-grid">
        {/* Links: Kundendaten */}
        <section className="checkout-left card">
          <h2 className="checkout-section-heading">Deine Daten</h2>
          <p className="checkout-customer-hint">
            E-Mail wird für die Bestellbestätigung benötigt. Weitere Angaben sind optional.
          </p>
          <div className="checkout-customer-fields">
            <div className="checkout-field">
              <label htmlFor="checkout-email">E-Mail *</label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="checkout-input"
                autoComplete="email"
              />
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-name">Name</label>
              <input
                id="checkout-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vor- und Nachname"
                className="checkout-input"
                autoComplete="name"
              />
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-phone">Telefon</label>
              <input
                id="checkout-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="z. B. 0123 456789"
                className="checkout-input"
                autoComplete="tel"
              />
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-address">Straße & Hausnummer</label>
              <input
                id="checkout-address"
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Musterstraße 1"
                className="checkout-input"
                autoComplete="street-address"
              />
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-address2">Adresszusatz</label>
              <input
                id="checkout-address2"
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="z. B. 2. OG"
                className="checkout-input"
                autoComplete="off"
              />
            </div>
            <div className="checkout-field-row">
              <div className="checkout-field">
                <label htmlFor="checkout-postal">PLZ</label>
                <input
                  id="checkout-postal"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="12345"
                  className="checkout-input"
                  autoComplete="postal-code"
                />
              </div>
              <div className="checkout-field checkout-field--grow">
                <label htmlFor="checkout-city">Ort</label>
                <input
                  id="checkout-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Stadt"
                  className="checkout-input"
                  autoComplete="address-level2"
                />
              </div>
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-country">Land</label>
              <input
                id="checkout-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Deutschland"
                className="checkout-input"
                autoComplete="country-name"
              />
            </div>
          </div>
          <div className="checkout-agb">
            <label className="checkout-agb-label">
              <input
                type="checkbox"
                checked={agbAccepted}
                onChange={(e) => setAgbAccepted(e.target.checked)}
                className="checkout-agb-checkbox"
              />
              <span>
                Ich habe die{" "}
                <Link href="/agb" target="_blank" rel="noopener noreferrer" className="checkout-agb-link">
                  AGB
                </Link>{" "}
                gelesen und akzeptiert. *
              </span>
            </label>
          </div>
        </section>

        {/* Rechts: Produktübersicht + Zahlung */}
        <section className="checkout-right">
          <div className="checkout-summary card">
            <h2 className="checkout-section-heading">Deine Bestellung</h2>
            <ul className="checkout-list">
              {items.map((item) => (
                <li key={item.id} className="checkout-item">
                  <span className="checkout-item-name">{item.productName}</span>
                  <span className="checkout-item-detail">
                    {item.quantity} · {item.target}
                  </span>
                  <span className="checkout-item-price">{(item.priceCents / 100).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
            <div className="checkout-total-row">
              <span className="checkout-total-label">Gesamt</span>
              <span className="checkout-total-value">{(totalCents / 100).toFixed(2)} €</span>
            </div>
          </div>

          <div className="checkout-pay card">
            <h2 className="checkout-section-heading">Zahlungsart</h2>
            <div className="checkout-payment-method-choice">
              <label className="checkout-payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                  className="checkout-payment-radio"
                />
                <span>PayPal</span>
              </label>
              <label className="checkout-payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "ueberweisung"}
                  onChange={() => setPaymentMethod("ueberweisung")}
                  className="checkout-payment-radio"
                />
                <span>Überweisung</span>
              </label>
            </div>

            {paymentMethod === "ueberweisung" ? (
              <div className="checkout-ueberweisung-wrap">
                <p className="checkout-ueberweisung-text">
                  Nach dem Abschluss erhältst du unsere Bankdaten und den Verwendungszweck (deine
                  Bestellnummer). Bitte überweise den Betrag dann zeitnah.
                </p>
                <button
                  type="button"
                  onClick={submitUeberweisung}
                  disabled={ueberweisungLoading}
                  className="btn btn-primary"
                >
                  {ueberweisungLoading ? "Wird erstellt …" : "Bestellung per Überweisung abschließen"}
                </button>
              </div>
            ) : PAYPAL_CLIENT_ID ? (
              <div className="checkout-paypal-wrap">
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={(err) => {
                    console.error("PayPal Fehler:", err);
                    const msg =
                      err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
                        ? (err as { message: string }).message
                        : "PayPal-Fehler. Bitte erneut versuchen.";
                    setPaypalError(msg);
                  }}
                />
              </div>
            ) : (
              <p className="checkout-pay-missing">
                PayPal ist noch nicht konfiguriert. In <code>.env.local</code> muss{" "}
                <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> stehen. Danach Server neu starten.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


export default function CheckoutPage() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId || "sb",
        currency: "EUR",
        intent: "capture",
        "disable-funding": "sepa",
      }}
      deferLoading={!clientId}
    >
      <CheckoutContent />
    </PayPalScriptProvider>
  );
}
