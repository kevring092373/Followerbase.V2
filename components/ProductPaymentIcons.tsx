/**
 * Zahlungsarten-Icons für die Produktseite (PayPal, Kreditkarte, Überweisung).
 */

const iconSize = 48;

function IconPayPal() {
  return (
    <img
      src="/icons/PayPal%20Icon.webp"
      alt=""
      width={iconSize}
      height={iconSize}
      className="product-payment-icon-img"
      aria-hidden
    />
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
