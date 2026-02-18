export const metadata = {
  title: "Kontakt – Followerbase",
  description: "So erreichst du uns.",
};

export default function KontaktPage() {
  return (
    <article className="legal-page">
      <h1 className="heading-hero">Kontakt</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Du hast Fragen? Schreib uns.
      </p>
      <div className="legal-content">
        <p><strong>E-Mail</strong></p>
        <p>[deine-kontakt@beispiel.de]</p>
        <p style={{ marginTop: "1rem" }}><strong>Antwortzeit</strong></p>
        <p>Wir bemühen uns, Anfragen innerhalb von 1–2 Werktagen zu beantworten.</p>
        <p style={{ marginTop: "1.5rem", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
          Bitte ersetze die Platzhalter durch deine echten Kontaktdaten.
        </p>
      </div>
    </article>
  );
}
