import Link from "next/link";
import Image from "next/image";
import { categories, headerQuickLinks } from "@/lib/categories";
import { getAllProducts } from "@/lib/products-data";
import { HomeMarquee } from "@/components/HomeMarquee";
import { HomeReveal } from "@/components/HomeReveal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { InstagramNotificationOverlay } from "@/components/InstagramNotificationOverlay";

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
      {/* Hero + Instagram-Overlay rechts */}
      <section className="home-hero">
        <div className="home-hero-bg" aria-hidden>
          <span className="home-hero-orb home-hero-orb-1" />
          <span className="home-hero-orb home-hero-orb-2" />
          <span className="home-hero-orb home-hero-orb-3" />
        </div>
        <div className="home-hero-row">
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
          <InstagramNotificationOverlay compact />
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

      {/* Langer Artikel: Rechtliches, Plattformen, organisch, FAQ, CTA */}
      <HomeReveal delay={180}>
        <article className="home-long-text home-article">
          <p className="home-long-text-body">
            Der Einsatz von gekauften Followern kann gegen das Gesetz gegen den unlauteren <strong>Wettbewerb (UWG)</strong> verstoßen und kann zu Abmahnungen führen. Besonders wenn Konkurrenten oder Verbraucher dadurch getäuscht werden. Ganz abgesehen davon brechen solche Praktiken meist die Nutzungsbedingungen der Plattformen. Eine Kontosperrung ist da oft die logische Konsequenz. Es ist fast wie ein schlecht gemachter Zaubertrick. Jeder merkt, dass etwas nicht stimmt, und am Ende fliegt es auf.
          </p>

          <h3 className="home-article-h3">Rechtliche Konsequenzen: Irreführung und Wettbewerbsverzerrung</h3>
          <p className="home-long-text-body">
            Wer seine Follower-Zahlen manipuliert, spielt mit dem Feuer. Denn durch gekaufte Follower suggeriert man eine höhere Reichweite oder Beliebtheit. Das kann als Irreführung im geschäftlichen Verkehr nach § 5 Abs. 1 UWG gewertet werden. Ist die Followerzahl unwahr, kann das Publikum geschäftlich irregeführt werden. Es könnte Entscheidungen treffen, die es sonst vermieden hätte. Ein Beispiel sind Kooperationen mit Influencern, die ihre Zahlen manipuliert haben. Das{" "}
            <a href="https://www.lto.de/recht/nachrichten/n/lg-muenchen-influencer-fake-follower-unlauterer-wettbewerb-verkaufszahlen/" target="_blank" rel="noopener noreferrer">Landgericht München I</a> sah dies 2021 als unlautere Wettbewerbshandlung an. Unternehmen, die ihre Konkurrenz so überflügeln wollen, riskieren Abmahnungen. Mitbewerber oder Verbraucherschutzverbände können diese einleiten. Das kostet nicht nur viel Geld, sondern auch den Ruf. Doch die rechtlichen Fallstricke sind nur eine Seite der Medaille.
          </p>

          <h3 className="home-article-h3">Ethische Fragen: Unterstützung zwielichtiger Praktiken</h3>
          <p className="home-long-text-body">
            Der Kauf von Followern wirft auch ethische Fragen auf. Die Integrität des digitalen Raums leidet darunter. Wer Dienste für Follower-Käufe nutzt, unterstützt oft zwielichtige Unternehmen. Diese könnten in ausbeuterische Geschäftspraktiken oder sogar organisierte Kriminalität verwickelt sein. Anbieter nutzen häufig Bot-Netzwerke oder Clickfarmen. Hier arbeiten Menschen unter fragwürdigen Bedingungen, um künstliche Interaktionen zu erzeugen. Das untergräbt das Vertrauen in authentisches Online-Engagement. Sobald solche Praktiken auffliegen, schadet das der Glaubwürdigkeit des eigenen Profils nachhaltig. Die Frage ist doch: Wollen Sie wirklich auf einem Fundament aus Sand bauen, wenn es um Ihren Online-Erfolg geht?
          </p>

          <div className="home-article-icon-grid">
            <div className="home-article-icon-card card">
              <span className="home-article-icon-card-icon" aria-hidden>⚖️</span>
              <h4 className="home-article-icon-card-title">§ 5 UWG – Irreführung</h4>
              <p className="home-article-icon-card-text">Manipulierte Followerzahlen können als Irreführung im geschäftlichen Verkehr gewertet werden.</p>
            </div>
            <div className="home-article-icon-card card">
              <span className="home-article-icon-card-icon" aria-hidden>🔨</span>
              <h4 className="home-article-icon-card-title">Abmahnrisiko</h4>
              <p className="home-article-icon-card-text">Mitbewerber und Verbraucherschutzverbände können Abmahnungen einleiten.</p>
            </div>
            <div className="home-article-icon-card card">
              <span className="home-article-icon-card-icon" aria-hidden>🚫</span>
              <h4 className="home-article-icon-card-title">Ethische Bedenken</h4>
              <p className="home-article-icon-card-text">Bot-Netzwerke und Clickfarmen operieren oft unter fragwürdigen Bedingungen.</p>
            </div>
          </div>
        </article>
      </HomeReveal>

      <hr className="home-article-divider" />

      <HomeReveal delay={190}>
        <section className="home-long-text home-article-section" id="plattformen" aria-labelledby="home-article-plattformen-title">
          <h2 id="home-article-plattformen-title" className="home-long-text-title">Plattformspezifische Unterschiede: Follower kaufen auf Instagram, TikTok &amp; Co.</h2>
          <p className="home-long-text-body">
            Follower kaufen? Da gibt es plattformspezifische Risiken, die sich stark unterscheiden. Instagram setzt auf visuelle Inhalte und Engagement. TikTok liebt virale Kurzvideos. Ich habe selbst erlebt, wie Instagrams Bot-Erkennung gekaufte Follower schnell entlarvt. Niedrige Interaktionsraten schädigen die Glaubwürdigkeit massiv, wie das{" "}
            <a href="https://www.iwkoeln.de/fileadmin/userupload/Studien/Report/PDF/2024/IW-Report2024-Creatorbranche.pdf" target="_blank" rel="noopener noreferrer">Institut der deutschen Wirtschaft (IW) 2024</a> bestätigt. TikToks Algorithmus mag kurzzeitige Boosts verstärken, doch echte Interaktion bleibt unerlässlich. Und YouTube? Dort zählen Abonnentenbindung und Wiedergabezeit. Gekaufte Abonnenten ohne Aktivität sind kaum von Wert – es sei denn, Sie suchen wirklich nur leere Zahlen. Jede Plattform hat eigene Hürden, die wir uns genauer ansehen sollten.
          </p>
          <h3 className="home-article-h3">Plattformen im direkten Vergleich</h3>
          <p className="home-long-text-body">
            Alle Plattformen entwerten gekaufte Follower, da echtes Engagement für ihre Algorithmen entscheidend ist. Man kann die Algorithmen nicht austricksen, sie sind einfach zu clever geworden. Sie sind ständig auf der Suche nach echter Interaktion, nicht nur nach Zahlen. Darum ist es wichtig zu verstehen, wo gekaufte Follower am wenigsten bringen.
          </p>
          <div className="home-article-platform-grid">
            <div className="home-article-platform-card card">
              <h4 className="home-article-platform-card-title">📸 Instagram Follower kaufen</h4>
              <p className="home-long-text-body">
                Beim <Link href="/product/instagram-follower-kaufen">Instagram Follower kaufen</Link> schadet die Diskrepanz zwischen Followerzahl und Interaktion schnell der Profilauthentizität. Ihre Story-Views und Likes bleiben niedrig, während die Follower explodieren – das fällt auf, und nicht positiv. Instagrams Algorithmen sind da unbarmherzig.
              </p>
            </div>
            <div className="home-article-platform-card card">
              <h4 className="home-article-platform-card-title">🎵 TikTok Follower kaufen</h4>
              <p className="home-long-text-body">
                Kurze Follower-Boosts helfen beim <Link href="/product/tiktok-follower-kaufen">TikTok Follower kaufen</Link> nicht zum nachhaltigen Erfolg, wenn viraler Content und aktive Beteiligung fehlen. TikTok lebt von Engagement. Wenn Ihre neuen Follower nicht swipen, kommentieren oder teilen, ist der Boost schnell verpufft.
              </p>
            </div>
            <div className="home-article-platform-card card">
              <h4 className="home-article-platform-card-title">▶️ YouTube Abonnenten kaufen</h4>
              <p className="home-long-text-body">
                Gekaufte Abonnenten liefern keine Wiedergabezeit, die für Reichweite und Monetarisierung auf YouTube zählt. Hier geht es um echte Fans, die Ihre Videos auch wirklich ansehen. Ohne Wiedergabezeit bleibt die Wirkung gekaufter Abos fast bei null, egal wie viele es sind.
              </p>
            </div>
          </div>
          <p className="home-long-text-body">
            Dies zeigt deutlich, wie wichtig es ist, die Erwartungen an den Kauf von Social Media Interaktionen realistisch zu halten.
          </p>
        </section>
      </HomeReveal>

      <hr className="home-article-divider" />

      <HomeReveal delay={200}>
        <section className="home-long-text home-article-section" id="organisch" aria-labelledby="home-article-organisch-title">
          <h2 id="home-article-organisch-title" className="home-long-text-title">Nachhaltiges Wachstum: Effektive Strategien, um organisch Follower zu gewinnen</h2>
          <p className="home-long-text-body">
            Organisches Social-Media-Wachstum lebt von bewusstem Content und aktiver Community-Interaktion. Du schaffst so eine authentische Anhängerschaft für nachhaltigen Erfolg. Es ist die stabile Alternative zum Follower-Kauf, bei der du die Herkunft deiner Fans kennst. Doch wie fängt man damit an, solche echten Verbindungen aufzubauen?
          </p>
          <div className="home-article-steps">
            <div className="home-article-step-item card">
              <h4 className="home-article-step-title">Wertvolle Inhalte erstellen und interagieren</h4>
              <p className="home-long-text-body">
                Konzentriere dich auf Inhalte, die deine Zielgruppe ansprechen und Mehrwert bieten. Teile authentische Geschichten oder nützliche Tipps, um echte Verbindungen zu knüpfen. Aktive Interaktion, das heißt das Beantworten von Kommentaren und Nachrichten, fördert eine loyale Community. Die Pallite Group stellte 2024 fest: Solche Bindungen senken langfristig die Kundenakquisitionskosten. Diese tiefe Bindung ist der erste Schritt, um deine Präsenz optimal zu gestalten.
              </p>
            </div>
            <div className="home-article-step-item card">
              <h4 className="home-article-step-title">Präsenz optimieren und konsistent bleiben</h4>
              <p className="home-long-text-body">
                Für mehr Sichtbarkeit nutze relevante Hashtags und Keywords. So wird dein Content leicht gefunden. Teile deine Inhalte plattformübergreifend, um die Reichweite zu maximieren und neue Zielgruppen zu erreichen. Konstante Posts und eine einheitliche Markenbotschaft sind entscheidend. Kontinuität und eine klare Markenbotschaft bilden das Fundament für deinen langfristigen Social-Media-Erfolg.
              </p>
            </div>
          </div>
        </section>
      </HomeReveal>

      <hr className="home-article-divider" />

      <HomeReveal delay={210}>
        <section className="home-long-text home-article-section" id="social-proof" aria-labelledby="home-article-social-proof-title">
          <h2 id="home-article-social-proof-title" className="home-long-text-title">Social Proof und digitales Wachstum: Deine Brücke zu mehr Glaubwürdigkeit</h2>
          <p className="home-long-text-body">
            Ich habe selbst erlebt, wie entscheidend Social Proof für nachhaltiges Wachstum und Markenauthentizität ist. Es geht darum, deine Glaubwürdigkeit durch Dritte zu untermauern. Wir bei Followerbase wissen, dass dies nur durch qualitative Interaktionen und echtes Engagement nachhaltig ist.
          </p>
          <h3 className="home-article-h3">Warum qualitative Interaktionen wirklich zählen</h3>
          <p className="home-long-text-body">
            Warum auf leere Hüllen setzen, wenn du echte Begeisterung haben kannst? Qualitative Interaktionen sind das A und O für glaubwürdigen Social Proof. Sie zeigen aktives Engagement deiner Zielgruppe. So entstehen tiefere Verbindungen, die Interessenten zu treuen Kunden machen. Denn mal ehrlich: Tausend &quot;Geister-Follower&quot; sind so überzeugend wie ein Verkäufer, der sich selbst die Hand schüttelt, oder?
          </p>
          <h3 className="home-article-h3">Der Wert echter Reichweite für Markenauthentizität</h3>
          <p className="home-long-text-body">
            Echte Reichweite bedeutet, relevante Inhalte erreichen wirklich interessierte Menschen. Wächst deine Marke durch authentisches Engagement, sendet das ein starkes Signal an deine Community: Du bist relevant und vertrauenswürdig. Diese Authentizität ist entscheidend für langfristige Beziehungen und deinen Erfolg im digitalen Raum, ein Fundament, das oft mehr als nur Geduld erfordert.
          </p>
          <div className="home-article-feature-card card">
            <h4 className="home-article-feature-card-title">💎 Echte Reichweite &gt; Leere Zahlen</h4>
            <p className="home-long-text-body">
              Qualitative Interaktionen schaffen tiefere Verbindungen, machen Interessenten zu treuen Kunden und bauen glaubwürdigen Social Proof auf – nachhaltig und authentisch.
            </p>
          </div>
        </section>
      </HomeReveal>

      <hr className="home-article-divider" />

      <HomeReveal delay={220}>
        <section className="home-faq home-article-faq" id="faq" aria-labelledby="home-article-faq-title">
          <h2 id="home-article-faq-title" className="home-faq-title">Häufig gestellte Fragen zu Social Media Followern</h2>
          <div className="home-faq-list">
            <details className="home-faq-item card">
              <summary className="home-faq-question">Ist es illegal, Follower zu kaufen?</summary>
              <div className="home-faq-answer">
                <p>Der Kauf von Followern ist in Deutschland nicht im strafrechtlichen Sinne illegal. Allerdings verstoßen diese Praktiken in der Regel gegen die Nutzungsbedingungen der jeweiligen Social-Media-Plattformen, was zu einer Sperrung oder Löschung des Kontos führen kann. Kommt es zu einer kommerziellen Nutzung, beispielsweise durch Werbung mit irreführend hohen Followerzahlen, kann dies als unlauterer Wettbewerb eingestuft werden und zivilrechtliche Konsequenzen nach sich ziehen, wie das Landgericht Stuttgart in einem Fall bereits entschied Gutefrage.net (Stand: 31.08.2021).</p>
              </div>
            </details>
            <details className="home-faq-item card">
              <summary className="home-faq-question">Wie erkenne ich gekaufte oder Fake-Follower?</summary>
              <div className="home-faq-answer">
                <p>Gekaufte oder gefälschte Follower lassen sich oft an bestimmten Merkmalen erkennen. Dazu gehören Profile ohne Profilbild, mit generischen oder zufälligen Benutzernamen, einem Mangel an eigenen Beiträgen oder relevanten Interaktionen. Ein plötzlicher, drastischer Anstieg der Followerzahl ohne entsprechenden Zuwachs bei Likes oder Kommentaren ist ebenfalls ein deutliches Warnsignal. Eine geringe Engagement-Rate im Verhältnis zu einer hohen Followerzahl weist ebenfalls auf gekaufte Profile hin.</p>
              </div>
            </details>
            <details className="home-faq-item card">
              <summary className="home-faq-question">Können gekaufte Follower meinem Ruf schaden?</summary>
              <div className="home-faq-answer">
                <p>Gekaufte Follower können dem Ruf erheblich schaden. Sie untergraben die Authentizität und Glaubwürdigkeit eines Profils oder einer Marke. Wenn echte Nutzer oder potenzielle Geschäftspartner feststellen, dass Follower künstlich erzeugt wurden, führt dies zu einem Vertrauensverlust und dem Eindruck von Unehrlichkeit. Dies kann langfristig die Beziehungen zur Zielgruppe schädigen und die Reputation nachhaltig beeinträchtigen.</p>
              </div>
            </details>
            <details className="home-faq-item card">
              <summary className="home-faq-question">Gibt es sichere Wege, Social Media Reichweite zu erhöhen?</summary>
              <div className="home-faq-answer">
                <p>Ja, es gibt viele sichere und nachhaltige Strategien, um die Social Media Reichweite organisch zu erhöhen. Dazu gehören die Erstellung hochwertiger, relevanter Inhalte, die konsequente Interaktion mit der Community, die strategische Nutzung von Hashtags und die Zusammenarbeit mit anderen Accounts oder Influencern. Auch der Einsatz von bezahlten Werbekampagnen, die auf eine spezifische Zielgruppe zugeschnitten sind, kann die Reichweite auf authentische Weise steigern und echtes Engagement fördern Hootsuite Blog.</p>
              </div>
            </details>
            <details className="home-faq-item card">
              <summary className="home-faq-question">Was sind die häufigsten Plattformen für den Follower-Kauf?</summary>
              <div className="home-faq-answer">
                <p>Der Kauf von Followern ist ein Phänomen, das auf vielen gängigen Social Media Plattformen beobachtet wird. Zu den am häufigsten betroffenen Plattformen gehören Instagram, TikTok, YouTube und Facebook. Auch auf Plattformen wie Twitter werden Dienste zum Kauf von Followern und Interaktionen angeboten, da der Wunsch nach schnellem Social Proof weit verbreitet ist.</p>
              </div>
            </details>
          </div>
        </section>
      </HomeReveal>

      <HomeReveal delay={240}>
        <section className="home-cta" id="cta">
          <div className="home-cta-inner">
            <h2 className="home-cta-title">Echtes Wachstum für deine Social Media Präsenz</h2>
            <p className="home-cta-text">
              Nachdem die Risiken und Fallstricke gekaufter Follower deutlich geworden sind, sehnst du dich vielleicht nach echten Wegen, um deine Präsenz aufzubauen. Nachhaltiges Wachstum basiert auf Authentizität und echtem Engagement. Entdecke, wie professionelle Unterstützung dir helfen kann, eine loyale Community aufzubauen und deine Ziele mit seriösen Strategien zu erreichen.
            </p>
            <p className="home-cta-text">
              Du möchtest wissen, wie du mit Followerbase dein Social Media Wachstum ankurbeln kannst? Dann klicke hier, um mehr über unsere maßgeschneiderten Lösungen zu erfahren und deine Reise zu echtem Erfolg zu starten.
            </p>
            <Link href="/products" className="btn btn-primary home-cta-btn">Lösungen entdecken →</Link>
          </div>
        </section>
      </HomeReveal>
    </div>
  );
}
