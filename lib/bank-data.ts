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
  iban: "DE19670923000034108552",
  bic: "GENODE61WNM",
  bankName: "Volksbank Kurpfalz",
};

/** IBAN ohne Leerzeichen für Verwendungszweck/Export, Anzeige mit Leerzeichen (alle 4 Zeichen). */
function formatIbanDisplay(iban: string): string {
  const clean = iban.replace(/\s/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

export function getBankDetails(): BankDetails {
  const rawIban = process.env.BANK_IBAN ?? EXAMPLE.iban;
  return {
    recipient: process.env.BANK_RECIPIENT ?? EXAMPLE.recipient,
    iban: formatIbanDisplay(rawIban),
    bic: process.env.BANK_BIC ?? EXAMPLE.bic,
    bankName: process.env.BANK_NAME ?? EXAMPLE.bankName,
  };
}

/** Verwendungszweck für eine Bestellung = Bestellnummer. */
export function getVerwendungszweck(orderNumber: string): string {
  return orderNumber.replace(/\s/g, "").toUpperCase();
}
