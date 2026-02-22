/**
 * Zahlungsarten-Icons für die Produktseite (PayPal, Kreditkarte, Überweisung).
 * Verwendet SVG-Icons für klare Darstellung.
 */

const iconSize = 48;

function IconPayPal() {
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Offizielles PayPal-Logo (P), Markenfarben #003087 / #009CDE */}
      <path
        fill="#003087"
        d="M9.77 4.18H5.94v15.5h2.58V12.9h1.22c1.7 0 3.04-1.38 3.04-3.1 0-1.72-1.34-3.1-3.04-3.1H9.77V4.18z"
      />
      <path
        fill="#009CDE"
        d="M17.9 7.38c-.42-.42-1-.68-1.66-.76-.72-.08-1.44.08-2.08.4v-.14h-2.52v8.6h2.52v-3.1l.12.12c.32.26.74.42 1.2.42 1.02 0 1.88-.42 2.42-1.12.54-.7.8-1.62.8-2.74 0-.82-.16-1.56-.5-2.12-.34-.56-.86-.94-1.5-1.18z"
      />
    </svg>
  );
}

function IconCard() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconBank() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 10h18v8H3v-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 10l9-4 9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10v8M12 10v8M17 10v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const PAYMENTS = [
  { id: "paypal", label: "PayPal", Icon: IconPayPal },
  { id: "card", label: "Kreditkarte", Icon: IconCard },
  { id: "bank", label: "Überweisung", Icon: IconBank },
] as const;

export function ProductPaymentIcons() {
  return (
    <section className="product-payment-icons product-payment-icons--cards" aria-label="Zahlungsarten">
      {PAYMENTS.map(({ id, label, Icon }) => (
        <div key={id} className="product-payment-card" title={label}>
          <Icon />
          <span className="product-payment-card-label">{label}</span>
        </div>
      ))}
    </section>
  );
}
