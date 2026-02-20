export const metadata = {
  title: "Datenschutz – Followerbase",
  description: "Datenschutzerklärung und Informationen zur Verarbeitung personenbezogener Daten.",
  robots: { index: false, follow: true },
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
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist Venus Management GbR, vertreten durch Kevin Ringsdorf, Ulmenweg 15, 51766 Engelskirchen (E-Mail: info@followerbase.de).</p>

        <h2>2. Cookies und lokale Speicherung</h2>
        <p>Wir setzen technisch notwendige Cookies bzw. lokale Speicherung (z. B. für den Warenkorb und deine Cookie-Einwilligung). Über das Cookie-Banner kannst du „Nur notwendige“ oder „Alle akzeptieren“ wählen. Die Einwilligung speichern wir lokal in deinem Browser.</p>

        <h2>3. Erhobene Daten</h2>
        <p>Beim Besuch der Website können u. a. Zugriffsdaten (IP-Adresse, Datum, aufgerufene Seiten) in Server-Logs erfasst werden. Bei Bestellungen werden die von dir angegebenen Daten (z. B. E-Mail, Zahlungsdaten) verarbeitet.</p>

        <h2>4. Zweck und Rechtsgrundlage</h2>
        <p>Die Verarbeitung erfolgt zur Vertragserfüllung, zur Bereitstellung der Website und ggf. zur Erfüllung gesetzlicher Pflichten (z. B. Aufbewahrung). Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b, f DSGVO sowie ggf. Art. 6 Abs. 1 lit. c DSGVO.</p>

        <h2>5. Speicherdauer</h2>
        <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für den genannten Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.</p>

        <h2>6. Deine Rechte</h2>
        <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Bei Beschwerden kannst du dich an eine Datenschutz-Aufsichtsbehörde wenden.</p>

        <h2>7. Kontakt</h2>
        <p>Für Fragen zum Datenschutz: info@followerbase.de</p>
        <p style={{ marginTop: "1.5rem", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
          Diese Datenschutzerklärung ist ein Platzhalter. Passe sie an dein Angebot an und lasse sie ggf. rechtlich prüfen.
        </p>
      </div>
    </article>
  );
}
