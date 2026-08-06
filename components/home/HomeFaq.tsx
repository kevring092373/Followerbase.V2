import Link from "next/link";

const FAQS = [
  {
    q: "Was ist eine Nachfüllgarantie (Refill) beim Follower-Kauf?",
    a: "Eine Nachfüllgarantie, oft als „Refill“ bezeichnet, stellt sicher, dass verloren gegangene Follower innerhalb eines bestimmten Zeitraums kostenlos ersetzt werden. Da gekaufte Follower im Laufe der Zeit abnehmen können, dient diese Garantie dazu, die ursprünglich erworbene Follower-Zahl zu stabilisieren und das Profil langfristig zu unterstützen.",
  },
  {
    q: "Wie erkenne ich einen seriösen Anbieter für Social Media Interaktionen?",
    a: "Ein seriöser Anbieter zeichnet sich durch Transparenz, klaren Kundenservice und die ausschließliche Anforderung öffentlicher Profilinformationen aus – niemals nach Ihrem Passwort. Zudem sollten die Dienstleistungen realistisch kommuniziert werden, ohne überzogene Versprechen. Achten Sie auf sichere Zahlungsmethoden und positive Bewertungen.",
  },
  {
    q: "Kann mein Account gesperrt werden, wenn ich Follower kaufe?",
    a: "Der Kauf von Followern birgt das Risiko einer Account-Sperrung, da dies gegen die Nutzungsbedingungen der meisten Social-Media-Plattformen verstößt. Plattformen entwickeln ihre Algorithmen stetig weiter, um solche Aktivitäten zu erkennen. Die Maßnahmen reichen von der Entfernung gekaufter Follower bis zur temporären oder permanenten Sperrung.",
  },
  {
    q: "Wie schnell werden gekaufte Follower geliefert?",
    a: "Die Liefergeschwindigkeit variiert je nach Anbieter und gewähltem Paket. Wir bevorzugen eine gestaffelte Lieferung über einen bestimmten Zeitraum, um ein natürlicheres Wachstum zu simulieren. Sofortige, massenhafte Zugänge können hingegen ein Warnsignal sein und das Risiko für Ihren Account erhöhen.",
  },
  {
    q: "Was bedeutet „ohne Passwort“ beim Kauf von Social Media Diensten?",
    a: "„Ohne Passwort“ bedeutet, dass Sie für die Abwicklung lediglich Ihren Benutzernamen oder den Link zu Ihrem öffentlichen Profil angeben müssen. Ein vertrauenswürdiger Anbieter wird niemals nach Ihrem Account-Passwort fragen. Die Anforderung eines Passworts ist ein deutliches Anzeichen für einen unseriösen Dienstleister.",
  },
  {
    q: "Wie kann ich bei Followerbase bezahlen?",
    a: "Du bezahlst wie in jedem normalen Online-Shop: PayPal, Klarna, Kreditkarte (Visa und Mastercard), Apple Pay oder Google Pay. Alle Zahlungen laufen SSL-verschlüsselt – und auf dem Kontoauszug erscheint eine neutrale Zahlungsreferenz. Mehr dazu in unserem ",
    linkHref: "/blog/follower-kaufen-paypal-klarna",
    linkLabel: "Ratgeber zum sicheren Bezahlen",
  },
] as const;

export function HomeFaq() {
  return (
    <div className="faq">
      {FAQS.map((item) => (
        <details key={item.q} className="faq-item">
          <summary className="faq-q">{item.q}</summary>
          <div className="faq-a">
            <div className="faq-a-inner">
              {item.a}
              {"linkHref" in item && item.linkHref ? (
                <Link href={item.linkHref}>{item.linkLabel}</Link>
              ) : null}
              {"linkHref" in item && item.linkHref ? "." : null}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
