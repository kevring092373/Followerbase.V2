import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Kontakt – Followerbase",
  description: "So erreichst du uns. Kontaktformular für Anfragen.",
};

export default function KontaktPage() {
  return (
    <article className="legal-page kontakt-page">
      <h1 className="heading-hero">Kontakt</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Du hast Fragen? Schreib uns über das Formular – wir antworten innerhalb von 1–2 Werktagen.
      </p>
      <div className="legal-content">
        <ContactForm />
      </div>
    </article>
  );
}
