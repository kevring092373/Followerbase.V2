export const metadata = {
  title: "Impressum – Followerbase",
  description: "Impressum und Angaben gemäß § 5 TMG.",
};

export default function ImpressumPage() {
  return (
    <article className="legal-page">
      <h1 className="heading-hero">Impressum</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Angaben gemäß § 5 TMG
      </p>
      <div className="legal-content">
        <p><strong>Followerbase</strong></p>
        <p> [Firmenname / Inhaber]</p>
        <p>[Straße und Hausnummer]</p>
        <p>[PLZ und Ort]</p>
        <p style={{ marginTop: "1rem" }}><strong>Kontakt</strong></p>
        <p>E-Mail: [E-Mail-Adresse]</p>
        <p style={{ marginTop: "1rem" }}><strong>Umsatzsteuer-ID</strong></p>
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [falls zutreffend]</p>
        <p style={{ marginTop: "1rem" }}><strong>Verantwortlich für den Inhalt</strong></p>
        <p>[Name und Anschrift]</p>
        <p style={{ marginTop: "1.5rem", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
          Bitte ersetze die Platzhalter durch deine tatsächlichen Angaben.
        </p>
      </div>
    </article>
  );
}
