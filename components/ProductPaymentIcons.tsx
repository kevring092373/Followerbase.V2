/**
 * Zahlungsarten-Icons für die Produktseite (PayPal, Kreditkarte, Überweisung).
 * Verwendet SVG-Icons für klare Darstellung.
 */

const iconSize = 48;

function IconPayPal() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.32 21.97a.546.546 0 0 1-.4-.17.526.526 0 0 1-.16-.39V9.03h-.06L4.81 21.69c-.03.2.05.35.22.44.14.09.3.12.46.09l2.83-.25Z"
        fill="#003087"
      />
      <path
        d="M8.32 9.03h3.19c1.94 0 3.36.45 4.27 1.34.88.86 1.31 2.05 1.31 3.57 0 1.52-.43 2.69-1.28 3.52-.86.84-2.02 1.26-3.5 1.26H9.25l-.93 5.5v.01a.38.38 0 0 1-.12.27.348.348 0 0 1-.26.11H6.07a.578.578 0 0 1-.56-.69l1.83-10.89v-.08Z"
        fill="#0070E0"
      />
      <path
        d="M18.24 7.7c-.45-.58-1.2-.98-2.24-1.2-.9-.18-1.88-.12-2.93.2-.24.08-.46.18-.64.3a4.14 4.14 0 0 0-.5.36l-.06.05v-.05H8.32v12.34l.01.02 2.82-.25a.6.6 0 0 0 .38-.17.55.55 0 0 0 .17-.4v-.01l1.26-7.47v-.02c.02-.2.1-.35.24-.44.14-.09.3-.12.46-.09h.35c1.12 0 2-.3 2.63-.9.64-.6.96-1.44.96-2.52 0-.58-.1-1.08-.3-1.5-.2-.42-.46-.78-.78-1.08Z"
        fill="#001C64"
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
    <section className="product-payment-icons" aria-label="Zahlungsarten">
      <p className="product-payment-icons-label">Sichere Zahlung</p>
      <div className="product-payment-icons-list">
        {PAYMENTS.map(({ id, label, Icon }) => (
          <span key={id} className="product-payment-icons-item" title={label}>
            <Icon />
            <span className="product-payment-icons-name">{label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
