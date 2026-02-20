export const metadata = {
  title: "Impressum – Followerbase",
  description: "Impressum und Angaben gemäß § 5 TMG.",
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <article className="legal-page">
      <h1 className="heading-hero">Impressum</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Angaben gemäß § 5 TMG
      </p>
      <div className="legal-content">
        <p><strong>Venus Management GbR</strong></p>
        <p>Ulmenweg 15</p>
        <p>51766 Engelskirchen</p>
        <p style={{ marginTop: "1rem" }}><strong>Vertreten durch</strong></p>
        <p>Kevin Ringsdorf</p>
        <p style={{ marginTop: "1rem" }}><strong>Kontakt</strong></p>
        <p>E-Mail: info@followerbase.de</p>
        <p>Telefon: 01786 718703</p>
        <p style={{ marginTop: "1rem" }}><strong>Steuernummer</strong></p>
        <p>21257672584</p>
        <p style={{ marginTop: "1rem" }}><strong>Umsatzsteuer-ID</strong></p>
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE361898179</p>
        <p style={{ marginTop: "1rem" }}><strong>Verantwortlich für den Inhalt</strong></p>
        <p>Kevin Ringsdorf, Ulmenweg 15, 51766 Engelskirchen</p>
      </div>
    </article>
  );
}
