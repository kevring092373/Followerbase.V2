import { ContactForm } from "@/components/ContactForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { absoluteUrl, brandOgImage } from "@/lib/seo";
import { pageMetaDescription } from "@/lib/page-meta-descriptions";

const description = pageMetaDescription("/kontakt");

export const metadata = {
  title: "Kontakt – Followerbase",
  description,
  openGraph: {
    title: "Kontakt – Followerbase",
    description,
    url: absoluteUrl("/kontakt"),
    type: "website" as const,
    images: [brandOgImage()],
  },
  alternates: { canonical: absoluteUrl("/kontakt") },
};

export default function KontaktPage() {
  return (
    <article className="legal-page kontakt-page">
      <h1 className="heading-hero">Kontakt</h1>
      <p className="subtitle" style={{ marginBottom: "1.5rem" }}>
        Du hast Fragen? Schreib uns per WhatsApp oder über das Formular – wir antworten in der
        Regel innerhalb von 24 Stunden.
      </p>
      <div className="legal-content">
        <div className="kontakt-whatsapp">
          <p className="kontakt-whatsapp-text">Schnellste Antwort oft per Chat:</p>
          <WhatsAppButton
            className="btn whatsapp-btn"
            label="Per WhatsApp schreiben"
          />
        </div>
        <p className="kontakt-form-divider">oder per Formular</p>
        <ContactForm />
      </div>
    </article>
  );
}
