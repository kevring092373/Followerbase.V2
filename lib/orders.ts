/**
 * Bestell-Status und Labels – client- und server-seitig nutzbar.
 */

export type OrderStatus =
  | "pending_payment"
  | "eingegangen"
  | "gestartet"
  | "in_ausfuehrung"
  | "abgeschlossen";

export interface OrderItem {
  productSlug: string;
  productName: string;
  quantity: number;
  priceCents: number;
  target: string;
}

export type PaymentMethod = "paypal" | "ueberweisung" | "viva";

export interface Order {
  orderNumber: string;
  status: OrderStatus;
  remarks?: string;
  createdAt: string;
  updatedAt?: string;
  /** Zahlungsart */
  paymentMethod?: PaymentMethod;
  /** Nur bei Zahlung per PayPal: PayPal-Order-ID für Capture */
  paypalOrderId?: string;
  /** Bestellte Positionen (bei Checkout gesetzt) */
  items?: OrderItem[];
  /** Nachricht an den Verkäufer */
  sellerNote?: string;
  /** Tatsächlicher Bestellbetrag in Cent (nicht aus Menge×Preis berechnet) */
  totalCents?: number;
  /** Kundendaten (aus Checkout) */
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddressLine1?: string;
  customerAddressLine2?: string;
  customerCity?: string;
  customerPostalCode?: string;
  customerCountry?: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Zahlung ausstehend",
  eingegangen: "Bestellung eingegangen",
  gestartet: "Bestellung gestartet",
  in_ausfuehrung: "In Ausführung",
  abgeschlossen: "Abgeschlossen",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "eingegangen",
  "gestartet",
  "in_ausfuehrung",
  "abgeschlossen",
];

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status];
}

/** Gesamtsumme einer Bestellung in Cent: Summe der Preise der Einzelpositionen. Menge = was der Kunde erhält, Preis = Betrag für die Position (nicht Menge × Preis). */
export function getOrderTotalCents(order: Order): number {
  if (!order.items?.length) return 0;
  return order.items.reduce((sum, i) => sum + i.priceCents, 0);
}

/** Anzeige der Zahlungsart. */
export function getPaymentMethodLabel(order: Order): string {
  if (order.paymentMethod === "paypal" || order.paypalOrderId) return "PayPal";
  if (order.paymentMethod === "ueberweisung") return "Überweisung";
  if (order.paymentMethod === "viva") return "Kreditkarte (Viva)";
  return "—";
}
