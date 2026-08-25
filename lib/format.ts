/**
 * Zentrale deutsche Formatierung für sichtbare Preise und Mengen.
 * Schema.org-Preise gehören nicht hierher – die brauchen einen Dezimalpunkt
 * und laufen weiterhin über formatSchemaPrice() in lib/product-seo.
 */
export const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const numberFormatter = new Intl.NumberFormat("de-DE");

/** Centbetrag als sichtbarer Preis, z. B. 99 → "0,99 €". */
export function formatEuroFromCents(cents: number): string {
  const value = Number.isFinite(cents) ? cents / 100 : 0;
  return euroFormatter.format(value);
}

/** Preisspanne für Produktkarten, z. B. "ab 0,99 €". */
export function formatFromPriceFromCents(cents: number): string {
  return `ab ${formatEuroFromCents(cents)}`;
}

/** Menge mit deutschem Tausendertrennzeichen, z. B. 25000 → "25.000". */
export function formatQuantity(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}
