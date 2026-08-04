import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

const title = "Das Team hinter Followerbase: Social Media aus NRW";
const description =
  "Followerbase ist ein deutscher Anbieter für Social-Media-Wachstum aus Engelskirchen. Erfahre, wer hinter dem Shop steht und wie wir arbeiten.";

export const metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  openGraph: { title, description, url: absoluteUrl("/ueber-uns"), type: "website" as const },
  twitter: { card: "summary" as const, title, description },
  alternates: { canonical: absoluteUrl("/ueber-uns") },
};

export default function UeberUnsPage() {
  return (
    <article>
      <div className="content-wrap">
        <h1 className="heading-hero">Über uns: Wer hinter Followerbase steht</h1>
        <p>
          Followerbase.de wird von der Venus Management GbR aus Engelskirchen bei Köln betrieben.
          Kein anonymer Reseller aus dem Ausland, sondern ein deutsches Unternehmen mit
          ladungsfähiger Anschrift, deutscher Umsatzsteuer-ID und Support, der deine Sprache
          spricht. Du kannst uns anrufen, uns schreiben und bekommst eine Antwort von Menschen,
          die ihre Produkte selbst verstehen.
        </p>

        <hr className="section-divider" />

        <section>
          <h2>Warum es Followerbase gibt</h2>
          <p>
            Der Markt für Follower, Likes und Views ist groß und leider voller schwarzer Schafe:
            anonyme Websites ohne Impressum, Bot-Ware, die nach zwei Wochen verschwindet, und
            Support, der nie antwortet. Wir waren selbst lange genug im Social-Media-Marketing
            unterwegs, um zu wissen, wie es besser geht.
          </p>
          <p>
            Deshalb haben wir Followerbase gestartet: einen Shop, bei dem du vorher weißt, was du
            bekommst, was es kostet und welche Risiken es gibt. Ja, auch die Risiken. In unserem{" "}
            <Link href="/blog">Blog</Link> erklären wir dir ehrlich, wann sich der Kauf von
            Followern lohnt und wann du dein Geld besser in Content steckst. Diese Ehrlichkeit
            kostet uns vermutlich einzelne Verkäufe. Dafür kommen unsere Kunden wieder.
          </p>
        </section>

        <hr className="section-divider" />

        <section>
          <h2>Wie wir arbeiten</h2>
          <div className="icon-grid">
            <div className="icon-card card">
              <span className="icon-card-icon" aria-hidden>🔒</span>
              <h4>Kein Passwort, keine Spielchen</h4>
              <p>
                Für keine unserer Leistungen brauchen wir dein Passwort. Ein öffentlicher
                Benutzername genügt. Alles andere wäre ein Warnsignal, bei uns und bei jedem
                anderen Anbieter.
              </p>
            </div>
            <div className="icon-card card">
              <span className="icon-card-icon" aria-hidden>⚡</span>
              <h4>Lieferung mit Verstand</h4>
              <p>
                Deine Bestellung liefern wir per Drip-Feed: schrittweise statt auf einen Schlag.
                Das wirkt natürlich und schützt dein Profil.
              </p>
            </div>
            <div className="icon-card card">
              <span className="icon-card-icon" aria-hidden>🔄</span>
              <h4>30 Tage Nachfüllgarantie</h4>
              <p>
                Gehen Follower innerhalb von 30 Tagen verloren, füllen wir kostenlos nach. Ohne
                Diskussion.
              </p>
            </div>
            <div className="icon-card card">
              <span className="icon-card-icon" aria-hidden>💳</span>
              <h4>Bezahlung wie im normalen Online-Shop</h4>
              <p>
                PayPal, Kreditkarte, Klarna, Apple Pay und Google Pay. Deine Daten laufen
                SSL-verschlüsselt und DSGVO-konform.
              </p>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        <section>
          <h2>Followerbase in Zahlen</h2>
          <div className="trust-bar">
            <div className="trust-badge"><span aria-hidden>👥</span> 10.000+ zufriedene Kunden</div>
            <div className="trust-badge"><span aria-hidden>📱</span> 8 Plattformen</div>
            <div className="trust-badge"><span aria-hidden>🔄</span> 30 Tage Nachfüllgarantie</div>
            <div className="trust-badge"><span aria-hidden>⏱️</span> Antwort in unter 24 Stunden</div>
          </div>
          <p style={{ marginTop: "1rem" }}>
            Unsere 8 Plattformen: Instagram, TikTok, YouTube, Snapchat, Telegram, Facebook, Reddit
            und Threads. Die Nachfüllgarantie gilt auf Follower, die Antwortzeit auf
            Support-Anfragen.
          </p>
        </section>

        <hr className="section-divider" />

        <section>
          <h2>Du erreichst uns</h2>
          <div className="feature-card">
            <h4>Venus Management GbR</h4>
            <p>
              Ulmenweg 15, 51766 Engelskirchen
              <br />
              E-Mail: <a href="mailto:info@followerbase.de">info@followerbase.de</a>
              <br />
              Telefon: <a href="tel:01786718703">01786 718703</a>
            </p>
          </div>
          <p>
            Wir antworten in der Regel innerhalb von 24 Stunden, auch am Wochenende. Ausführliche
            Angaben findest du im <Link href="/impressum">Impressum</Link>, für Anfragen gibt es
            unser <Link href="/kontakt">Kontaktformular</Link>.
          </p>
        </section>

        <section>
          <div className="cta-section">
            <h2>Oder du legst direkt los</h2>
            <p>
              Follower, Likes und Views für acht Plattformen – mit Nachfüllgarantie und ohne
              Passwort.
            </p>
            <Link href="/products" className="cta-btn">Alle Produkte ansehen →</Link>
          </div>
        </section>
      </div>
    </article>
  );
}
