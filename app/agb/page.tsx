export const metadata = {
  title: "AGB – Followerbase",
  description: "Allgemeine Geschäftsbedingungen des Shops.",
  robots: { index: false, follow: true },
};

export default function AGBPage() {
  return (
    <article className="legal-page">
      <h1 className="heading-hero">Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Geltung, Vertragsschluss, Preise, Zahlung, Widerruf
      </p>
      <div className="legal-content">
        <h2>§ 1 Geltungsbereich</h2>
        <p>Diese AGB gelten für alle Bestellungen über den Online-Shop Followerbase. Abweichende Bedingungen des Kunden werden nicht anerkannt.</p>

        <h2>§ 2 Vertragspartner, Vertragsschluss</h2>
        <p>Der Kaufvertrag kommt zustande, wenn du eine Bestellung absendest und wir sie durch Auftragsbestätigung bzw. Lieferung annehmen. Die Darstellung der Produkte im Shop ist kein rechtlich bindendes Angebot.</p>

        <h2>§ 3 Preise und Zahlung</h2>
        <p>Es gelten die zum Zeitpunkt der Bestellung angegebenen Preise inkl. der gesetzlichen Mehrwertsteuer. Die Zahlung erfolgt über die angebotenen Zahlungsarten (z. B. Karte, PayPal). Die Lieferung bzw. Ausführung erfolgt nach Zahlungseingang.</p>

        <h2>§ 4 Leistung, Lieferzeit</h2>
        <p>Wir liefern digitale bzw. Dienstleistungen gemäß Produktbeschreibung. Die angegebene Lieferzeit ist unverbindlich, sofern nicht ausdrücklich anders vereinbart.</p>

        <h2>§ 5 Widerrufsrecht</h2>
        <p>Als Verbraucher hast du ein Widerrufsrecht. Einzelheiten siehe unsere Widerrufsbelehrung.</p>

        <h2>§ 6 Haftung</h2>
        <p>Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit. Im Übrigen ist die Haftung auf den vorhersehbaren, typischerweise eintretenden Schaden begrenzt.</p>

        <p style={{ marginTop: "1.5rem", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
          Diese AGB sind ein Platzhalter. Lasse sie vor dem Go-Live rechtlich anpassen.
        </p>
      </div>
    </article>
  );
}
