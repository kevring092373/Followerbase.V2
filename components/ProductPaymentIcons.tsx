/**
 * Zahlungsarten-Icons für die Produktseite (PayPal, Kreditkarte, Überweisung).
 */

const iconSize = 48;

function IconPayPal() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path fill="#003087" d="M10 4h-4v16h2.5V13h1.2c2 0 3.5-1.5 3.5-3.5S13.7 4 10 4zm.2 5c.5 0 .8-.3.8-.8 0-.5-.3-.8-.8-.8H8.5v1.6h1.7z" />
      <path fill="#009CDE" d="M18.2 7.8c-.5-.5-1.2-.8-2-.9-.9-.1-1.8.1-2.5.5l-.2.1v-.2h-2.2v9.4h2.2v-3.5l.1.1c.4.3.9.5 1.5.5 1.2 0 2.2-.5 2.8-1.3.6-.8.9-1.8.9-3 0-.9-.2-1.7-.6-2.3-.4-.6-1-1-1.7-1.3z" />
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
