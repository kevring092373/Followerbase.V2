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
        <p>Wir setzen keine Cookies zu Analyse- oder Werbezwecken. Im lokalen Speicher deines Browsers (localStorage) speichern wir nur: (1) den Warenkorb-Inhalt (ausgewählte Produkte, Mengen und eine optionale Notiz an den Verkäufer), damit dein Einkauf zwischen Besuchen erhalten bleibt; (2) deine Cookie-Einwilligung („Nur notwendige“ oder „Alle akzeptieren“), die du über das Cookie-Banner erteilst. Diese Daten verlassen nicht dein Gerät und werden von uns nicht auf einem Server ausgewertet.</p>

        <h2>3. Erhobene und verarbeitete Daten</h2>
        <p>Beim Aufruf der Website können durch den Hosting-Anbieter Zugriffsdaten (z. B. IP-Adresse, Datum, aufgerufene Seiten) in Server-Logs erfasst werden.</p>
        <p>Bei einer Bestellung erheben wir: E-Mail-Adresse, Name, optional Telefon und Adresse (Straße, PLZ, Ort, Land). Diese Daten sowie die Bestelldetails (bestellte Produkte, Mengen, Betrag, Bestellnummer) speichern wir in einer Datenbank zur Vertragserfüllung, zur Bestellabwicklung und zur Kommunikation mit dir. Die Zahlung erfolgt über PayPal oder per Überweisung; Zahlungsdaten (z. B. Karten- oder Bankverbindung) werden von uns nicht gespeichert, sondern ausschließlich von PayPal bzw. deiner Bank verarbeitet.</p>
        <p>Über das Kontaktformular werden Name, E-Mail und Nachricht an uns übermittelt und per E-Mail-Dienst (Resend) an uns weitergeleitet; die Angaben werden zur Bearbeitung deiner Anfrage genutzt.</p>

        <h2>4. Zweck und Rechtsgrundlage</h2>
        <p>Die Verarbeitung erfolgt zur Vertragserfüllung (Bestellung, Lieferung, Support), zur Bereitstellung der Website (Warenkorb, Cookie-Einwilligung) und zur Erfüllung gesetzlicher Pflichten (z. B. Aufbewahrung). Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b, f DSGVO sowie ggf. Art. 6 Abs. 1 lit. c DSGVO. Die Cookie-Einwilligung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO.</p>

        <h2>5. Speicherdauer</h2>
        <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für die Bestellabwicklung, den Support und die Erfüllung gesetzlicher Aufbewahrungsfristen (z. B. steuer- und handelsrechtlich) erforderlich ist. Daten im localStorage (Warenkorb, Cookie-Einwilligung) kannst du jederzeit durch Löschen der Website-Daten in deinem Browser entfernen.</p>

        <h2>6. Deine Rechte</h2>
        <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Bei Beschwerden kannst du dich an eine Datenschutz-Aufsichtsbehörde wenden.</p>

        <h2>7. Kontakt</h2>
        <p>Für Fragen zum Datenschutz: info@followerbase.de</p>
        <p style={{ marginTop: "1.5rem", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
          Stand 20.02.2026
        </p>
      </div>
    </article>
  );
}
