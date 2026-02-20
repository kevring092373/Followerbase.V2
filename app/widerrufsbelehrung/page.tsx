export const metadata = {
  title: "Widerrufsbelehrung – Followerbase",
  description: "Informationen zu deinem Widerrufsrecht.",
  robots: { index: false, follow: true },
};

export default function WiderrufsbelehrungPage() {
  return (
    <article className="legal-page">
      <h1 className="heading-hero">Widerrufsbelehrung</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Dein Widerrufsrecht als Verbraucher
      </p>
      <div className="legal-content">
        <h2>Widerrufsrecht</h2>
        <p>Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.</p>

        <h2>Ausübung des Widerrufs</h2>
        <p>Um dein Widerrufsrecht auszuüben, musst du uns (Venus Management GbR, Kevin Ringsdorf, Ulmenweg 15, 51766 Engelskirchen, info@followerbase.de) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren.</p>

        <h2>Folgen des Widerrufs</h2>
        <p>Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen zurückzuzahlen. Für die Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der ursprünglichen Transaktion eingesetzt hast.</p>

        <h2>Besonderheiten bei digitalen Leistungen</h2>
        <p>Wenn du die Ausführung der Dienstleistung (z. B. Lieferung von Followern, Likes oder Views) vor Ende der Widerrufsfrist ausdrücklich verlangst oder mit der Ausführung vor Ablauf der Frist beginnst, erlöscht dein Widerrufsrecht mit der vollständigen Erbringung der Leistung. Bei digitalen Inhalten, die nicht auf einem körperlichen Datenträger geliefert werden, erlischt das Widerrufsrecht, sobald wir mit der Ausführung begonnen haben, nachdem du ausdrücklich zugestimmt hast.</p>

        <p style={{ marginTop: "1.5rem", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
          Stand 20.02.2026
        </p>
      </div>
    </article>
  );
}
