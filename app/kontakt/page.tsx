import { ContactForm } from "@/components/ContactForm";

import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Kontakt",
  description:
    "Fragen zu Bestellungen oder Produkten? Schreib uns per Kontaktformular – wir antworten innerhalb von 1–2 Werktagen.",
  openGraph: { title: "Kontakt – Followerbase", description: "Kontaktformular für Anfragen.", url: absoluteUrl("/kontakt"), type: "website" as const },
  alternates: { canonical: absoluteUrl("/kontakt") },
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
