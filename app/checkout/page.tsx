"use client";

import { useCallback, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/Logo";
import { formatEuroFromCents } from "@/lib/format";
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

const VIVA_ERROR_MESSAGES: Record<string, string> = {
  viva_missing: "Keine Transaktionsdaten erhalten. Bitte versuche es erneut.",
  viva_verify: "Die Zahlung konnte nicht bestätigt werden.",
  viva_order:
    "Die Zahlung war erfolgreich, aber die Bestellung konnte nicht automatisch angelegt werden. Bitte schreib uns mit deinen Kundendaten und dem Betrag (Kontakt oder info@followerbase.de), wir erledigen den Rest.",
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, sellerNote, itemCount, clearCart, openCart } = useCart();
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const urlError = searchParams.get("error");
  const urlErrorMessage = urlError ? VIVA_ERROR_MESSAGES[urlError] : null;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Deutschland");
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "ueberweisung" | "card">("paypal");
  const [ueberweisungLoading, setUeberweisungLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

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
      setPaypalError("Bitte akzeptiere die AGB, um fortzufahren.");
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
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "Zahlung konnte nicht abgeschlossen werden.";
        setPaypalError(msg);
        throw new Error(msg);
      }
      if (!result.orderNumber) {
        const msg =
          "Die Zahlung war möglicherweise erfolgreich, aber wir haben keine Bestellnummer erhalten. Bitte melde dich beim Support.";
        setPaypalError(msg);
        throw new Error(msg);
      }
      clearCart();
      router.push(`/bestellung/danke?order=${encodeURIComponent(result.orderNumber)}`);
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
      setPaypalError("Bitte akzeptiere die AGB, um fortzufahren.");
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
      router.push(`/bestellung/danke?order=${encodeURIComponent(orderNumber)}`);
    } catch (e) {
      setPaypalError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setUeberweisungLoading(false);
    }
  }, [email, agbAccepted, customerPayload, totalCents, orderItems, sellerNote, clearCart, router]);

  const paypalButtonError = useCallback((err: Record<string, unknown>) => {
    console.error("PayPal Fehler:", err);
    const msg =
      err && typeof err === "object" && "message" in err && typeof err.message === "string"
        ? err.message
        : "PayPal-Fehler. Bitte erneut versuchen.";
    setPaypalError(msg);
  }, []);

  if (itemCount === 0) {
    return (
      <div className="shopify-checkout">
        <div className="sc-empty">
          <Logo />
          <h1>Dein Warenkorb ist leer</h1>
          <p>Lege zuerst ein Paket in den Warenkorb, um zur Kasse zu gehen.</p>
          <Link href="/products" className="sc-primary-btn">
            Zu den Produkten
          </Link>
        </div>
      </div>
    );
  }

  const paymentBox = (method: "paypal" | "card" | "ueberweisung") => (
    <div className={`sc-pay-box${paymentMethod === method ? " is-active" : ""}`}>
      <label className="sc-pay-head">
        <input
          type="radio"
          name="paymentMethod"
          checked={paymentMethod === method}
          onChange={() => setPaymentMethod(method)}
        />
        <span className="sc-pay-radio" aria-hidden />
        <span className="sc-pay-title">
          {method === "paypal" ? "PayPal" : method === "card" ? "Kreditkarte" : "Überweisung"}
        </span>
      </label>
      {paymentMethod === method ? (
        <div className="sc-pay-body">
          {method === "ueberweisung" ? (
            <>
              <p>
                Nach dem Abschluss erhältst du unsere Bankdaten und den Verwendungszweck (deine
                Bestellnummer). Bitte überweise den Betrag dann zeitnah.
              </p>
              <button
                type="button"
                onClick={submitUeberweisung}
                disabled={ueberweisungLoading}
                className="sc-primary-btn"
              >
                {ueberweisungLoading ? "Wird erstellt …" : "Jetzt bestellen"}
              </button>
            </>
          ) : PAYPAL_CLIENT_ID ? (
            <>
              {method === "card" ? (
                <p>Zahle mit Debit- oder Kreditkarte. Ein PayPal-Konto ist nicht nötig.</p>
              ) : (
                <p>Du wirst zu PayPal weitergeleitet, um die Zahlung abzuschließen.</p>
              )}
              <div
                className={`checkout-paypal-wrap${
                  method === "card" ? " checkout-paypal-wrap--card" : " checkout-paypal-wrap--paypal"
                }`}
              >
                <PayPalButtons
                  key={method}
                  fundingSource={method === "card" ? FUNDING.CARD : FUNDING.PAYPAL}
                  style={{
                    layout: "vertical",
                    height: 48,
                    shape: "rect",
                    color: method === "card" ? "black" : "gold",
                    label: method === "card" ? "pay" : "paypal",
                  }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={paypalButtonError}
                />
              </div>
            </>
          ) : (
            <p className="checkout-pay-missing">
              PayPal ist noch nicht konfiguriert. In <code>.env.local</code> muss{" "}
              <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> stehen. Danach Server neu starten.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="shopify-checkout">
      <div className="sc-layout">
        <div className="sc-form-col">
          <header className="sc-brand">
            <Logo />
          </header>

          <nav className="sc-crumbs" aria-label="Checkout">
            <button type="button" onClick={openCart}>
              Warenkorb
            </button>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Kasse</span>
          </nav>

          {(paypalError || urlErrorMessage) && (
            <div className="sc-alert" role="alert">
              {urlErrorMessage ?? paypalError}
            </div>
          )}

          <section className="sc-block" aria-labelledby="sc-kontakt">
            <div className="sc-block-head">
              <h2 id="sc-kontakt">Kontakt</h2>
              <p>E-Mail wird für die Bestellbestätigung benötigt.</p>
            </div>
            <label className="sc-field">
              <span>E-Mail *</span>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail"
                autoComplete="email"
              />
            </label>
          </section>

          <section className="sc-block" aria-labelledby="sc-lieferung">
            <div className="sc-block-head">
              <h2 id="sc-lieferung">Lieferung</h2>
              <p>Weitere Angaben sind optional und helfen bei Rückfragen.</p>
            </div>
            <div className="sc-fields">
              <label className="sc-field">
                <span>Name</span>
                <input
                  id="checkout-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vor- und Nachname"
                  autoComplete="name"
                />
              </label>
              <label className="sc-field">
                <span>Telefon</span>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefon"
                  autoComplete="tel"
                />
              </label>
              <label className="sc-field">
                <span>Straße und Hausnummer</span>
                <input
                  id="checkout-address"
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Straße und Hausnummer"
                  autoComplete="street-address"
                />
              </label>
              <label className="sc-field">
                <span>Adresszusatz</span>
                <input
                  id="checkout-address2"
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Wohnung, Stockwerk (optional)"
                  autoComplete="off"
                />
              </label>
              <div className="sc-field-row">
                <label className="sc-field sc-field-plz">
                  <span>PLZ</span>
                  <input
                    id="checkout-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="PLZ"
                    autoComplete="postal-code"
                  />
                </label>
                <label className="sc-field sc-field-grow">
                  <span>Ort</span>
                  <input
                    id="checkout-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ort"
                    autoComplete="address-level2"
                  />
                </label>
              </div>
              <label className="sc-field">
                <span>Land</span>
                <input
                  id="checkout-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Land"
                  autoComplete="country-name"
                />
              </label>
            </div>
          </section>

          <section className="sc-block" aria-labelledby="sc-zahlung">
            <div className="sc-block-head">
              <h2 id="sc-zahlung">Zahlung</h2>
              <p>Alle Transaktionen sind sicher und verschlüsselt.</p>
            </div>
            <div className="sc-pay-stack">
              {paymentBox("paypal")}
              {paymentBox("card")}
              {paymentBox("ueberweisung")}
            </div>
          </section>

          <section className="sc-block sc-block-legal">
            <label className="sc-agb">
              <input
                type="checkbox"
                checked={agbAccepted}
                onChange={(e) => setAgbAccepted(e.target.checked)}
              />
              <span>
                Ich habe die{" "}
                <Link href="/agb" target="_blank" rel="noopener noreferrer">
                  AGB
                </Link>{" "}
                gelesen und akzeptiert.
              </span>
            </label>
            <p className="sc-privacy">
              Hinweise zur Datenverarbeitung stehen in der{" "}
              <Link href="/datenschutz" target="_blank" rel="noopener noreferrer">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>

          <footer className="sc-footer-links">
            <Link href="/agb">AGB</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
            <Link href="/widerrufsbelehrung">Widerruf</Link>
          </footer>
        </div>

        <aside className="sc-summary-col" aria-labelledby="sc-summary-title">
          <button
            type="button"
            className="sc-summary-toggle"
            aria-expanded={summaryOpen}
            onClick={() => setSummaryOpen((open) => !open)}
          >
            <span>{summaryOpen ? "Bestellübersicht ausblenden" : "Bestellübersicht anzeigen"}</span>
            <strong>{formatEuroFromCents(totalCents)}</strong>
          </button>
          <div className={`sc-summary${summaryOpen ? " is-open" : ""}`}>
            <h2 id="sc-summary-title" className="sc-summary-heading">
              Bestellung
            </h2>
            <ul className="sc-lines">
              {items.map((item) => (
                <li key={item.id} className="sc-line">
                  <span className="sc-thumb" aria-hidden="true">
                    <span className="sc-thumb-letter">{item.productName.slice(0, 1)}</span>
                    <span className="sc-qty">1</span>
                  </span>
                  <span className="sc-line-text">
                    <span className="sc-line-name">{item.productName}</span>
                    <span className="sc-line-meta">
                      Menge: {item.quantity.toLocaleString("de-DE")} · {item.target}
                    </span>
                  </span>
                  <span className="sc-line-price">{formatEuroFromCents(item.priceCents)}</span>
                </li>
              ))}
            </ul>
            {sellerNote.trim() ? (
              <p className="sc-note">
                <strong>Hinweis:</strong> {sellerNote}
              </p>
            ) : null}
            <div className="sc-totals">
              <div className="sc-total-row">
                <span>Zwischensumme</span>
                <span>{formatEuroFromCents(totalCents)}</span>
              </div>
              <div className="sc-total-row">
                <span>Versand</span>
                <span>Kostenlos</span>
              </div>
              <div className="sc-total-row sc-total-row-grand">
                <span>Gesamt</span>
                <strong>{formatEuroFromCents(totalCents)}</strong>
              </div>
            </div>
          </div>
        </aside>
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
        "enable-funding": "card",
      }}
      deferLoading={!clientId}
    >
      <Suspense
        fallback={
          <div className="shopify-checkout">
            <div className="sc-empty">
              <p>Kasse wird geladen …</p>
            </div>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </PayPalScriptProvider>
  );
}
