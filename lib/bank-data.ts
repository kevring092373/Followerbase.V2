/**
 * Bankdaten für Überweisung (Beispiel – echte Daten in .env oder hier eintragen).
 * Verwendungszweck = Bestellnummer.
 */

export interface BankDetails {
  recipient: string;
  iban: string;
  bic: string;
  bankName: string;
  /** Verwendungszweck ist immer die Bestellnummer */
}

const EXAMPLE: BankDetails = {
  recipient: "Followerbase GmbH",
  iban: "DE89 3704 0044 0532 0130 00",
  bic: "COBADEFFXXX",
  bankName: "Commerzbank",
};

export function getBankDetails(): BankDetails {
  return {
    recipient: process.env.BANK_RECIPIENT ?? EXAMPLE.recipient,
    iban: process.env.BANK_IBAN ?? EXAMPLE.iban,
    bic: process.env.BANK_BIC ?? EXAMPLE.bic,
    bankName: process.env.BANK_NAME ?? EXAMPLE.bankName,
  };
}

/** Verwendungszweck für eine Bestellung = Bestellnummer. */
export function getVerwendungszweck(orderNumber: string): string {
  return orderNumber.replace(/\s/g, "").toUpperCase();
}
