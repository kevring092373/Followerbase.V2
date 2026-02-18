export const metadata = {
  title: "Datenschutz – Followerbase",
  description: "Datenschutzerklärung und Informationen zur Verarbeitung personenbezogener Daten.",
};

export default function DatenschutzPage() {
  return (
    <article className="legal-page">
      <h1 className="heading-hero">Datenschutzerklärung</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Informationen zur Verarbeitung deiner Daten
      </p>
      <div className="legal-content">
        <h2>1. Verantwortlicher</h2>
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist [Name/Anschrift].</p>

        <h2>2. Erhobene Daten</h2>
        <p>Beim Besuch der Website können u. a. Zugriffsdaten (IP-Adresse, Datum, aufgerufene Seiten) in Server-Logs erfasst werden. Bei Bestellungen werden die von dir angegebenen Daten (z. B. E-Mail, Zahlungsdaten) verarbeitet.</p>

        <h2>3. Zweck und Rechtsgrundlage</h2>
        <p>Die Verarbeitung erfolgt zur Vertragserfüllung, zur Bereitstellung der Website und ggf. zur Erfüllung gesetzlicher Pflichten (z. B. Aufbewahrung). Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b, f DSGVO sowie ggf. Art. 6 Abs. 1 lit. c DSGVO.</p>

        <h2>4. Speicherdauer</h2>
        <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für den genannten Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.</p>

        <h2>5. Deine Rechte</h2>
        <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Bei Beschwerden kannst du dich an eine Datenschutz-Aufsichtsbehörde wenden.</p>

        <h2>6. Kontakt</h2>
        <p>Für Fragen zum Datenschutz: [E-Mail-Adresse]</p>
        <p style={{ marginTop: "1.5rem", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
          Diese Datenschutzerklärung ist ein Platzhalter. Passe sie an dein Angebot an und lasse sie ggf. rechtlich prüfen.
        </p>
      </div>
    </article>
  );
}
