import Link from "next/link";
import Image from "next/image";
import { categories, headerQuickLinks } from "@/lib/categories";
import { getAllProducts } from "@/lib/products-data";
import { getAllPosts } from "@/lib/blog-data";
import { reviews } from "@/lib/reviews-data";
import { BLOG_AUTHOR } from "@/lib/blog-author";
import { HomePhoneMockup } from "@/components/home/HomePhoneMockup";
import { HomeFaq } from "@/components/home/HomeFaq";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { JsonLd } from "@/components/JsonLd";
import { buildOrganizationSchema } from "@/lib/structured-data";
import { absoluteUrl } from "@/lib/seo";

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

const QUICK_COPY: Record<string, { badge?: string; text: string; price: string }> = {
  "instagram-follower-kaufen": {
    badge: "Bestseller",
    text: "Starke Basis für deinen Account. Hochwertige Follower für mehr Sichtbarkeit.",
    price: "ab 0,99 €",
  },
  "tiktok-follower-kaufen": {
    badge: "Beliebt",
    text: "Wachse auf der beliebtesten Video-Plattform. Echte Reichweite von Anfang an.",
    price: "ab 2,99 €",
  },
  "instagram-likes-kaufen": {
    text: "Mehr Engagement für deine Posts. Likes, die ankommen und bleiben.",
    price: "ab 0,99 €",
  },
  "tiktok-likes-kaufen": {
    text: "Unterstützung für deine TikToks. Likes für mehr Algorithmus-Push.",
    price: "ab 0,99 €",
  },
};

const MARQUEE = [
  "📸 Instagram",
  "🎵 TikTok",
  "▶️ YouTube",
  "👻 Snapchat",
  "🤖 Reddit",
  "✈️ Telegram",
  "👍 Facebook",
  "🧵 Threads",
  "✦ Follower",
  "✦ Likes",
  "✦ Views",
  "✦ Reichweite",
];

export const revalidate = 3600;

export const metadata = {
  alternates: { canonical: absoluteUrl("/") },
};

export default async function HomePage() {
  const [allProducts, posts] = await Promise.all([getAllProducts(), getAllPosts()]);
  const blogTeasers = posts.slice(0, 3);

  return (
    <div className="home-new">
      <JsonLd data={buildOrganizationSchema()} />

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <span className="eyebrow-pill">✦ Follower, Likes &amp; Views</span>
              <h1>
                Instagram &amp; TikTok <span className="grad">Follower kaufen</span>
              </h1>
              <p className="hero-sub">
                Instagram, TikTok, YouTube und mehr. Schnell, unkompliziert und zum fairen Preis.
                Kein Abo, kein Passwort nötig.
              </p>
              <div className="hero-stats">
                <span>
                  <b>{categories.length}</b> Plattformen
                </span>
                <span className="dot" />
                <span>
                  <b>{allProducts.length}+</b> Produkte
                </span>
                <span className="dot" />
                <span>
                  <b>10.000+</b> zufriedene Kunden
                </span>
              </div>
              <div className="hero-ctas">
                <Link href="/products" className="btn btn-primary">
                  Alle Produkte ansehen
                </Link>
                <Link href="/bestellung-verfolgen" className="btn btn-ghost">
                  Bestellung verfolgen
                </Link>
                <WhatsAppButton
                  className="btn whatsapp-btn"
                  label="Per WhatsApp fragen"
                />
              </div>
              <p style={{ fontSize: ".85rem", color: "var(--text-3)", margin: "-1rem 0 1.6rem" }}>
                Pakete ab 0,45 € · Einmalzahlung, kein Abo
              </p>
              <div className="hero-trust">
                <span className="pill">✓ Ohne Passwort</span>
                <span className="pill">✓ Schnelle Lieferung</span>
                <span className="pill">✓ 30 Tage Nachfüllgarantie</span>
                <span className="pill">✓ PayPal &amp; Klarna</span>
              </div>
            </div>
            <HomePhoneMockup />
          </div>
        </div>

        <div className="marquee" aria-hidden>
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((label, i) => (
              <span key={`${label}-${i}`} className="m-chip">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="stats-band">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat">
              <div className="n">10.000+</div>
              <div className="l">Zufriedene Kunden</div>
            </div>
            <div className="stat">
              <div className="n">{categories.length}</div>
              <div className="l">Plattformen</div>
            </div>
            <div className="stat">
              <div className="n">{allProducts.length}+</div>
              <div className="l">Produkte</div>
            </div>
            <div className="stat">
              <div className="n">30 Tage</div>
              <div className="l">Nachfüllgarantie</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCHNELLZUGRIFF ═══ */}
      <section className="section" id="schnellzugriff">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Schnellzugriff</span>
            <h2>Unsere meistgefragten Produkte</h2>
            <p>Schnell bestellt, schnell geliefert.</p>
          </div>
          <div className="products-grid">
            {headerQuickLinks.map(({ label, productSlug }) => {
              const copy = QUICK_COPY[productSlug];
              const icon =
                productSlug.startsWith("instagram-")
                  ? "/icons/instagram.png"
                  : "/icons/tiktok.png";
              return (
                <Link
                  key={productSlug}
                  href={`/product/${productSlug}`}
                  className="p-card"
                >
                  {copy?.badge && <span className="p-badge">{copy.badge}</span>}
                  <span className="icon-img">
                    <Image src={icon} alt="" width={46} height={46} sizes="46px" />
                  </span>
                  <h3>{label}</h3>
                  {copy?.price && <span className="p-price">{copy.price}</span>}
                  <p>{copy?.text ?? "Zum Produkt"}</p>
                  <span className="link">Zum Produkt</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section className="section" id="so-funktionierts" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">So funktioniert&apos;s</span>
            <h2>Von unsichtbar zu sichtbar</h2>
            <p>Vom leeren Profil zum überzeugenden Auftritt, in vier einfachen Schritten.</p>
          </div>
          <div className="timeline">
            <div className="tl-item">
              <div className="tl-node">0</div>
              <span className="tl-tag muted">Ausgangslage</span>
              <h3>Unsichtbar</h3>
              <p>
                Dein Content ist gut, aber dein Profil wirkt leer. Neue Besucher folgen nicht, der
                Algorithmus spielt dich kaum aus.
              </p>
            </div>
            <div className="tl-item active">
              <div className="tl-node">1</div>
              <span className="tl-tag">Schritt 1</span>
              <h3>Produkt wählen</h3>
              <p>Plattform und Menge auswählen. Preise auf einen Blick, ab 0,45 €.</p>
            </div>
            <div className="tl-item active">
              <div className="tl-node">2</div>
              <span className="tl-tag">Schritt 2</span>
              <h3>Sicher bezahlen</h3>
              <p>
                PayPal, Klarna, Kreditkarte, Apple Pay oder Google Pay. Schnell, geschützt und ohne
                dein Passwort.
              </p>
            </div>
            <div className="tl-item active">
              <div className="tl-node">3</div>
              <span className="tl-tag">Schritt 3</span>
              <h3>Reichweite erhalten</h3>
              <p>
                Lieferung startet zeitnah per Drip-Feed, also schrittweise und natürlich wirkend.
                Kein Abo, keine versteckten Kosten.
              </p>
            </div>
            <div className="tl-item result">
              <div className="tl-node">✓</div>
              <span className="tl-tag dark">Ergebnis</span>
              <h3>Social Proof, der wirkt</h3>
              <p>
                Dein Profil wirkt etabliert, neue Besucher folgen leichter, und dein Content
                bekommt die Basis, die er verdient.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WARUM ═══ */}
      <section className="section" id="warum">
        <div className="wrap">
          <div className="why">
            <div>
              <span className="eyebrow">Warum Reichweite?</span>
              <h2>Dein Auftritt zählt. Im Feed, in der Story, im Algorithmus.</h2>
              <p>
                Ob Creator, Marke oder kleines Business: Sichtbarkeit entscheidet. Mit dem
                richtigen Start gewinnst du Vertrauen und Reichweite, ohne monatelang im leeren
                Raum zu posten. Followerbase liefert dir die Basis. Fair, schnell und transparent.
              </p>
              <Link href="/products" className="btn btn-primary">
                Jetzt Basis aufbauen
              </Link>
            </div>
            <ul className="feature-list">
              <li>
                <span className="f-ico">🔒</span>
                <div>
                  <b>Ohne Passwort</b>
                  <span>Dein öffentlicher Benutzername genügt. Mehr fragen wir nie ab.</span>
                </div>
              </li>
              <li>
                <span className="f-ico">⚡</span>
                <div>
                  <b>Schnelle Lieferung</b>
                  <span>Start zeitnah nach Bestellung, Zustellung per Drip-Feed.</span>
                </div>
              </li>
              <li>
                <span className="f-ico">🔄</span>
                <div>
                  <b>30 Tage Nachfüllgarantie</b>
                  <span>Verluste innerhalb von 30 Tagen füllen wir kostenlos auf.</span>
                </div>
              </li>
              <li>
                <span className="f-ico">🇩🇪</span>
                <div>
                  <b>Deutscher Anbieter</b>
                  <span>
                    Venus Management GbR aus Engelskirchen, mit vollständigem Impressum.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section
        className="section"
        id="bewertungen"
        style={{
          background:
            "linear-gradient(180deg,transparent,rgba(138,85,238,.045),transparent)",
        }}
      >
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Was Kunden sagen</span>
            <h2>Verifizierte Käufe, ehrliche Meinungen</h2>
            <p>Bewertungen von Nutzer:innen zu Followerbase.</p>
          </div>
          <div className="rating-sum">
            <span className="stars">★★★★★</span>
            <span className="big">5,0&nbsp;/&nbsp;5</span>
            <span className="note">aus verifizierten Käufen</span>
          </div>
          <div className="reviews">
            {reviews.map((r) => (
              <div key={r.id} className="review">
                <span className="stars">{"★".repeat(r.rating)}</span>
                {r.verified && (
                  <span className="verified">
                    ✓ Verifizierter Kauf
                    {r.productHint ? ` · ${r.productHint}` : ""}
                  </span>
                )}
                <p>{r.text}</p>
                <span className="who">{r.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VERGLEICH ═══ */}
      <section className="section" id="unterschied" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Der Unterschied</span>
            <h2>Woran du unseriöse Anbieter erkennst</h2>
            <p>
              Der Markt ist voller schwarzer Schafe. So unterscheidet sich Followerbase von
              anonymen Billig-Shops.
            </p>
          </div>
          <div className="compare">
            <div className="cmp-card bad">
              <h3>Typische Billig-Anbieter</h3>
              <ul>
                <li>
                  <span className="x">✕</span> Fragen nach deinem Account-Passwort
                </li>
                <li>
                  <span className="x">✕</span> Nur Krypto oder anonyme Zahlwege
                </li>
                <li>
                  <span className="x">✕</span> Kein Impressum, kein Ansprechpartner
                </li>
                <li>
                  <span className="x">✕</span> Bot-Dump: alles auf einen Schlag, hohes Risiko
                </li>
                <li>
                  <span className="x">✕</span> Follower verschwinden nach Tagen, keine Garantie
                </li>
                <li>
                  <span className="x">✕</span> Versteckte Abos und Folgekosten
                </li>
              </ul>
            </div>
            <div className="cmp-card good">
              <h3>Followerbase</h3>
              <ul>
                <li>
                  <span className="c">✓</span> Nur dein öffentlicher Benutzername, nie ein
                  Passwort
                </li>
                <li>
                  <span className="c">✓</span> PayPal, Klarna, Kreditkarte, Apple &amp; Google
                  Pay
                </li>
                <li>
                  <span className="c">✓</span> Deutsches Unternehmen mit vollständigem Impressum
                </li>
                <li>
                  <span className="c">✓</span> Drip-Feed: schrittweise Lieferung, natürlich
                  wirkend
                </li>
                <li>
                  <span className="c">✓</span> 30 Tage Nachfüllgarantie auf Follower
                </li>
                <li>
                  <span className="c">✓</span> Einmalzahlung ab 0,45 €, kein Abo
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLATTFORMEN ═══ */}
      <section className="section" id="plattformen">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Nach Plattform wählen</span>
            <h2>Follower, Likes und Views für alle großen Kanäle</h2>
          </div>
          <div className="platforms">
            {categories.map((cat) => {
              const iconFile = CATEGORY_ICONS[cat.id];
              return (
                <Link
                  key={cat.id}
                  href={`/products/${cat.slug}`}
                  className="pf-card"
                >
                  <span className="pf-ico-img">
                    {iconFile ? (
                      <Image
                        src={`/icons/${iconFile}`}
                        alt={cat.name}
                        width={42}
                        height={42}
                        sizes="42px"
                      />
                    ) : null}
                  </span>
                  <div>
                    <b>{cat.name}</b>
                    <span>
                      {cat.products.length === 1
                        ? "1 Produkt"
                        : `${cat.products.length} Produkte`}
                    </span>
                  </div>
                  <span className="arrow">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ ANSPRECHPARTNER ═══ */}
      <section className="section" id="vertrauen" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <div className="trust">
            <div className="trust-avatar-img">
              <Image
                src={BLOG_AUTHOR.image}
                alt={BLOG_AUTHOR.name}
                width={150}
                height={150}
                sizes="150px"
              />
              <span className="flag">DE</span>
            </div>
            <div>
              <span className="eyebrow">Dein Ansprechpartner</span>
              <h2>Ein echtes Unternehmen. Kein anonymer Reseller.</h2>
              <p>
                Followerbase wird von der Venus Management GbR aus Engelskirchen bei Köln
                betrieben. Mit vollständigem Impressum, deutscher Umsatzsteuer-ID und Support, der
                deine Sprache spricht. Du erreichst uns per E-Mail, Telefon und WhatsApp – und wir
                antworten in der Regel innerhalb von 24 Stunden.
              </p>
              <p style={{ marginTop: "0.75rem", fontWeight: 700, color: "var(--ink)" }}>
                {BLOG_AUTHOR.name} · {BLOG_AUTHOR.role}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
                <Link href="/ueber-uns" className="btn btn-ghost">
                  Mehr über uns
                </Link>
                <WhatsAppButton className="btn whatsapp-btn" label="WhatsApp" />
              </div>
            </div>
            <div className="trust-badges">
              <span className="t-badge">SSL-verschlüsselt &amp; DSGVO-konform</span>
              <span className="t-badge">
                PayPal, Klarna, Kreditkarte, Apple &amp; Google Pay
              </span>
              <span className="t-badge">Kein Abo, einmalig ab 0,45 €</span>
              <span className="t-badge">30 Tage Nachfüllgarantie auf Follower</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BLOG ═══ */}
      {blogTeasers.length > 0 && (
        <section className="section" id="ratgeber-teaser">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Aus dem Blog</span>
              <h2>Ehrliche Ratgeber statt Verkaufs-Blabla</h2>
              <p>
                Wir erklären dir auch, wann sich der Kauf nicht lohnt. Genau deshalb vertrauen uns
                unsere Kunden.
              </p>
            </div>
            <div className="blog-grid">
              {blogTeasers.map((post) => {
                const imgSrc = post.image
                  ? post.image.startsWith("/") || post.image.startsWith("http")
                    ? post.image
                    : `/icons/${post.image}`
                  : null;
                return (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                  <div className="bc-top">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt=""
                        width={400}
                        height={110}
                        sizes="(max-width: 860px) 100vw, 33vw"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: "2rem" }}>📰</span>
                    )}
                  </div>
                  <div className="bc-body">
                    {post.category && <span className="bc-tag">{post.category}</span>}
                    <h3>{post.title}</h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <span className="link">Weiterlesen →</span>
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SEO ═══ */}
      <section
        className="section"
        id="ratgeber"
        style={{
          background: "linear-gradient(180deg,transparent,rgba(138,85,238,.04),transparent)",
        }}
      >
        <div className="wrap">
          <div className="prose">
            <div className="section-head" style={{ marginBottom: "1rem" }}>
              <span className="eyebrow">Ratgeber</span>
              <h2 style={{ marginTop: 0 }}>
                Follower kaufen: Risiken, Nutzen und seriöse Alternativen für dein Social Media
                Wachstum
              </h2>
            </div>
            <p>
              Der Kauf von Followern verspricht eine schnelle Steigerung deines Social Proof und
              deiner Reichweite. Gleichzeitig birgt dieser Weg Risiken – von sinkenden
              Engagement-Raten bis zu rechtlichen Grauzonen. Bei Followerbase bekommst du
              transparente Preise, Lieferung ohne Passwort und ehrliche Informationen, wann sich
              der Kauf lohnt und wann du besser in Content investierst.
            </p>
            <div className="usp-row">
              <div className="usp">
                <div className="e">🔒</div>
                <b>Ohne Passwort</b>
              </div>
              <div className="usp">
                <div className="e">⚡</div>
                <b>Schnelle Lieferung</b>
              </div>
              <div className="usp">
                <div className="e">🔄</div>
                <b>Nachfüllgarantie</b>
              </div>
              <div className="usp">
                <div className="e">🇩🇪</div>
                <b>Deutscher Anbieter</b>
              </div>
            </div>
            <h3>Warum Creator und Unternehmen Follower kaufen</h3>
            <p>
              Manchmal ist organisches Wachstum einfach zu langsam. Eine sichtbare Community
              senkt die Schwelle für neues Engagement und signalisiert Relevanz – als Startschub,
              nicht als Ersatz für guten Content.
            </p>
            <div className="info-box">
              <b>⚖️ Rechtliche Grauzone:</b> Kein explizites Verbot, aber § 263 StGB und UWG können
              greifen, wenn gekaufte Follower zur Täuschung von Werbekunden eingesetzt werden.
            </div>
            <h3>Follower-Zahlen als Teil der Gesamtstrategie</h3>
            <p>
              Initialer Social Proof → Sichtbarkeit → hochwertiger Content → echtes Engagement →
              loyale Community → nachhaltiges Wachstum. Follower-Zahlen sind nur der Anfang.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Häufig gestellte Fragen zu Social Media Interaktionen</h2>
          </div>
          <HomeFaq />
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-band">
        <div className="wrap">
          <div className="cta">
            <h2>
              Dein nächster Besucher entscheidet in Sekunden.
              <br />
              Gib ihm einen Grund zu bleiben.
            </h2>
            <p>
              Followerbase unterstützt dich diskret und sicher auf dem Weg zu mehr Social Proof.
              Ohne Passwort, ohne Abo, mit 30 Tagen Nachfüllgarantie.
            </p>
            <Link href="/products" className="btn">
              Jetzt entdecken →
            </Link>
            <WhatsAppButton className="btn ghost-dark" label="Per WhatsApp fragen" />
          </div>
        </div>
      </section>

      <div className="mobile-cta">
        <Link href="/products" className="btn btn-primary">
          Alle Produkte ansehen →
        </Link>
      </div>
    </div>
  );
}
