import Link from "next/link";
import Image from "next/image";
import { categories, headerQuickLinks } from "@/lib/categories";
import { getAllProducts } from "@/lib/products-data";
import { HomeMarquee } from "@/components/HomeMarquee";
import { HomeReveal } from "@/components/HomeReveal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ReviewCarousel } from "@/components/ReviewCarousel";

/** Icon für Schnellzugriff-Karten: Instagram und TikTok nutzen eigene Icons, Rest Fallback. */
function QuickAccessIcon({ productSlug }: { productSlug: string }) {
  if (productSlug.startsWith("instagram-")) {
    return (
      <span className="home-quick-card-icon home-quick-card-icon-img">
        <Image src="/icons/instagram.png" alt="" width={48} height={48} priority sizes="48px" />
      </span>
    );
  }
  if (productSlug.startsWith("tiktok-")) {
    return (
      <span className="home-quick-card-icon home-quick-card-icon-img">
        <Image src="/icons/tiktok.png" alt="" width={48} height={48} priority sizes="48px" />
      </span>
    );
  }
  return null;
}

/** Kategorie-ID → Dateiname in public/icons/ (für „Nach Plattform wählen“). */
const CATEGORY_ICONS: Record<string, string> = {
  instagram: "instagram.png",
  tiktok: "tiktok.png",
  snapchat: "Snapchat.png",
  reddit: "reddit.webp",
  telegram: "telegram.webp",
  facebook: "facebook.png",
  youtube: "youtube.png",
  threads: "threads.png",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
  youtube: "▶️",
  snapchat: "👻",
  reddit: "🤖",
  telegram: "✈️",
  facebook: "👍",
  threads: "🧵",
};

export const revalidate = 3600;

export default async function HomePage() {
  const allProducts = await getAllProducts();

  return (
    <div className="home">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-bg" aria-hidden>
          <span className="home-hero-orb home-hero-orb-1" />
          <span className="home-hero-orb home-hero-orb-2" />
          <span className="home-hero-orb home-hero-orb-3" />
        </div>
        <div className="home-hero-inner">
          <p className="home-hero-label">Follower, Likes & Views</p>
          <h1 className="home-hero-title">
            <span className="home-hero-title-gradient">Mehr Reichweite</span>
            <br />
            für deine Kanäle
          </h1>
          <p className="home-hero-sub">
            Instagram, TikTok, YouTube und mehr – schnell, unkompliziert, fairer Preis.
          </p>
          <div className="home-hero-stats">
            <span>{categories.length} Plattformen</span>
            <span className="home-hero-stats-dot">·</span>
            <span>{allProducts.length}+ Produkte</span>
            <span className="home-hero-stats-dot">·</span>
            <span>Schnelle Lieferung</span>
          </div>
          <div className="home-hero-cta">
            <Link href="/products" className="btn btn-primary home-hero-btn">
              Alle Produkte ansehen
            </Link>
            <Link href="/bestellung-verfolgen" className="btn btn-secondary home-hero-btn">
              Bestellung verfolgen
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <HomeMarquee />

      {/* Schnellzugriff: 4 Hauptprodukte */}
      <HomeReveal delay={0}>
        <section className="home-quick">
          <h2 className="home-section-label">Schnellzugriff</h2>
          <p className="home-quick-intro">Unsere meistgefragten Produkte – schnell bestellt, schnell geliefert.</p>
          <div className="home-quick-grid">
            {headerQuickLinks.map(({ label, productSlug }, index) => (
              <Link
                key={productSlug}
                href={`/product/${productSlug}`}
                className={`home-quick-card home-quick-card-${index + 1}`}
              >
                <span className="home-quick-card-accent" aria-hidden />
                <QuickAccessIcon productSlug={productSlug} />
                <h3 className="home-quick-card-title">{label}</h3>
                <p className="home-quick-card-text">
                  {index === 0 && "Starke Basis für deinen Account – hochwertige Follower für mehr Sichtbarkeit."}
                  {index === 1 && "Wachse auf der beliebtesten Video-Plattform – echte Reichweite von Anfang an."}
                  {index === 2 && "Mehr Engagement für deine Posts – Likes die ankommen und bleiben."}
                  {index === 3 && "Unterstützung für deine TikToks – Likes für mehr Algorithmus-Push."}
                </p>
                <span className="home-quick-card-link">Zum Produkt →</span>
              </Link>
            ))}
          </div>
        </section>
      </HomeReveal>

      {/* So funktioniert's */}
      <HomeReveal delay={80}>
        <section className="home-how">
          <h2 className="home-section-label">So funktioniert&apos;s</h2>
          <div className="home-how-grid">
            <div className="home-how-step card">
              <span className="home-how-step-num">1</span>
              <h3 className="home-how-step-title">Produkt wählen</h3>
              <p className="home-how-step-text">Plattform und Menge auswählen – Preise auf einen Blick.</p>
            </div>
            <div className="home-how-step card">
              <span className="home-how-step-num">2</span>
              <h3 className="home-how-step-title">Sicher bezahlen</h3>
              <p className="home-how-step-text">Über unseren Checkout – schnell und geschützt.</p>
            </div>
            <div className="home-how-step card">
              <span className="home-how-step-num">3</span>
              <h3 className="home-how-step-title">Reichweite erhalten</h3>
              <p className="home-how-step-text">Lieferung startet zeitnah. Kein Abo, keine versteckten Kosten.</p>
            </div>
          </div>
        </section>
      </HomeReveal>

      {/* Textblock */}
      <HomeReveal delay={120}>
        <section className="home-text-block">
          <div className="home-text-block-inner">
            <p className="home-text-block-label">Warum Reichweite?</p>
            <h2 className="home-text-block-title">
              Dein Auftritt zählt – im Feed, in der Story, im Algorithmus.
            </h2>
            <p className="home-text-block-body">
              Ob Creator, Marke oder kleines Business: Sichtbarkeit entscheidet. Mit dem richtigen Start
              gewinnst du Vertrauen und Reichweite, ohne monatelang im leeren Raum zu posten. Wir liefern
              dir die Basis – fair, schnell und transparent.
            </p>
          </div>
        </section>
      </HomeReveal>

      {/* Bewertungs-Carousel (verifiziert + normal) */}
      <HomeReveal delay={140}>
        <ReviewCarousel />
      </HomeReveal>

      {/* Plattformen – groß, klare Karten */}
      <HomeReveal delay={160}>
        <section className="home-platforms">
          <h2 className="home-platforms-title">Nach Plattform wählen</h2>
          <p className="home-platforms-intro">Wähle deine Plattform – wir haben Follower, Likes und Views für alle großen Kanäle.</p>
          <div className="home-platforms-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products/${cat.slug}`}
                className="home-platform-card"
              >
                <span className="home-platform-icon">
                  <CategoryIcon
                    src={CATEGORY_ICONS[cat.id] ? `/icons/${CATEGORY_ICONS[cat.id]}` : ""}
                    fallback={PLATFORM_ICONS[cat.id] ?? "📦"}
                    size={48}
                    className="home-platform-icon-img"
                  />
                </span>
                <span className="home-platform-name">{cat.name}</span>
                <span className="home-platform-meta">{cat.products.length} Produkte</span>
                <span className="home-platform-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>
      </HomeReveal>

      {/* Langer Textabschnitt */}
      <HomeReveal delay={180}>
        <section className="home-long-text" aria-labelledby="home-long-text-title">
          <h2 id="home-long-text-title" className="home-long-text-title">
            Mehr Reichweite für deine Kanäle – warum Sichtbarkeit zählt
          </h2>
          <div className="home-long-text-body">
            <p>
              Ob du als Creator durchstarten willst, deine Marke bekannter machen oder einfach deinen Accounts
              mehr Präsenz geben möchtest: In den sozialen Medien entscheidet oft der erste Eindruck. Profile mit
              einer soliden Basis an Followern und Engagement wirken vertrauenswürdiger und werden von
              Algorithmen eher bevorzugt. Statt monatelang im leeren Raum zu posten, kannst du mit dem richtigen
              Start schneller sichtbar werden – und deine Inhalte kommen bei den Menschen an, die du erreichen willst.
            </p>
            <p>
              Bei Followerbase findest du Follower, Likes, Views und weitere Leistungen für alle großen Plattformen:
              Instagram, TikTok, YouTube, Snapchat, Reddit, Telegram, Facebook und Threads. Du wählst deine
              Plattform, die gewünschte Menge und den passenden Preis – ohne Abo, ohne versteckte Kosten. Die
              Bestellung wird zeitnah bearbeitet, und du kannst den Fortschritt jederzeit über unsere
              Bestellverfolgung einsehen. So behältst du die Kontrolle und weißt genau, wo deine Bestellung steht.
            </p>
            <p>
              Wir legen Wert auf transparente Abläufe und faire Preise. Du siehst vor dem Kauf, was du bekommst
              und was es kostet. Keine automatischen Verlängerungen, keine Überraschungen. Wenn du Fragen hast
              oder besondere Wünsche zu deiner Bestellung, kannst du uns eine Nachricht mitgeben – wir nehmen
              deine Hinweise bei der Ausführung berücksichtigt. Dein Erfolg auf den Plattformen steht im Mittelpunkt;
              wir unterstützen dich mit der technischen Basis, damit du dich auf deine Inhalte und deine Community
              konzentrieren kannst.
            </p>
            <p>
              Egal ob du gerade erst anfängst oder deinen bestehenden Account weiter ausbauen möchtest: Mit
              Followerbase hast du einen Partner, der Reichweite und Engagement unkompliziert und zuverlässig
              liefert. Stöbere in unseren Kategorien, wähle dein Produkt und freue dich auf mehr Sichtbarkeit –
              fair, schnell und auf deine Plattform zugeschnitten.
            </p>
          </div>
        </section>
      </HomeReveal>

      {/* Trust – drei große Blöcke */}
      <HomeReveal delay={200}>
        <section className="home-trust">
          <div className="home-trust-grid">
            <div className="home-trust-item">
              <span className="home-trust-icon" aria-hidden>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <h3 className="home-trust-title">Schnelle Lieferung</h3>
              <p className="home-trust-text">Deine Bestellung startet zeitnah – ohne Wartezeit.</p>
            </div>
            <div className="home-trust-item">
              <span className="home-trust-icon" aria-hidden>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <h3 className="home-trust-title">Sichere Zahlung</h3>
              <p className="home-trust-text">Bezahle sicher über unseren Checkout – deine Daten sind geschützt.</p>
            </div>
            <div className="home-trust-item">
              <span className="home-trust-icon" aria-hidden>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <h3 className="home-trust-title">Transparente Preise</h3>
              <p className="home-trust-text">Kein Abo, keine versteckten Kosten – du siehst sofort, was es kostet.</p>
            </div>
          </div>
        </section>
      </HomeReveal>

      {/* CTA – großer Abschluss-Block */}
      <HomeReveal delay={240}>
        <section className="home-cta">
          <div className="home-cta-inner">
            <h2 className="home-cta-title">Alle Produkte entdecken</h2>
            <p className="home-cta-text">Stöbere in allen Kategorien und finde Follower, Likes oder Views für deinen Kanal.</p>
            <Link href="/products" className="btn btn-primary home-cta-btn">
              Alle Produkte ansehen
            </Link>
          </div>
        </section>
      </HomeReveal>

      {/* FAQ */}
      <HomeReveal delay={280}>
        <section className="home-faq" aria-labelledby="home-faq-title">
          <h2 id="home-faq-title" className="home-faq-title">Häufige Fragen</h2>
          <p className="home-faq-intro">Kurz und klar – die wichtigsten Antworten rund um Follower, Likes und unsere Lieferung.</p>
          <div className="home-faq-list">
            <details className="home-faq-item card">
              <summary className="home-faq-question">Was bringt es, Follower oder Likes zu kaufen?</summary>
              <p className="home-faq-answer">
                Ein höheres Follower- oder Like-Level wirkt auf viele Nutzer vertrauenswürdig und kann den Algorithmus positiv beeinflussen. Gerade am Anfang hilft dir das, schneller sichtbar zu werden – ohne monatelang bei null zu starten. Wichtig: Gute Inhalte bleiben die Basis; wir liefern die Reichweite dazu.
              </p>
            </details>
            <details className="home-faq-item card">
              <summary className="home-faq-question">Wie schnell wird geliefert?</summary>
              <p className="home-faq-answer">
                Die Bearbeitung startet in der Regel zeitnah nach deiner Bestellung. Die genaue Lieferzeit hängt von Produkt und Menge ab – du siehst bei jedem Produkt die üblichen Zeiten. Du kannst deinen Bestellstatus jederzeit über „Bestellung verfolgen“ im Header prüfen.
              </p>
            </details>
            <details className="home-faq-item card">
              <summary className="home-faq-question">Ist das sicher für meinen Account?</summary>
              <p className="home-faq-answer">
                Wir liefern hochwertige Dienstleistungen und achten auf plattformgerechte Umsetzung. Trotzdem gelten die Nutzungsbedingungen von Instagram, TikTok & Co. – wir empfehlen, dich damit vertraut zu machen und nur so zu bestellen, wie du dich wohl fühlst.
              </p>
            </details>
            <details className="home-faq-item card">
              <summary className="home-faq-question">Gibt es ein Abo oder versteckte Kosten?</summary>
              <p className="home-faq-answer">
                Nein. Du bestellst einmalig, siehst den Preis vorher und zahlst nur das, was du auswählst. Kein Abo, keine automatischen Verlängerungen. Alle Preise werden dir vor dem Kauf klar angezeigt.
              </p>
            </details>
            <details className="home-faq-item card">
              <summary className="home-faq-question">Für welche Plattformen bietet ihr an?</summary>
              <p className="home-faq-answer">
                Wir haben Produkte für Instagram, TikTok, YouTube, Snapchat, Reddit, Telegram, Facebook und Threads – von Followern über Likes bis zu Views und Story-Aufrufen. Einfach unter „Alle Produkte“ deine Plattform wählen und das passende Paket finden.
              </p>
            </details>
          </div>
        </section>
      </HomeReveal>
    </div>
  );
}
