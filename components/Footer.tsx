import Link from "next/link";
import { categories, headerQuickLinks } from "@/lib/categories";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-wordmark">
              Followerbase
            </Link>
            <p>
              Follower, Likes und Views für Instagram, TikTok, YouTube und mehr.
              Schnelle Lieferung, sichere Zahlung. Ab 0,45 €, ohne Abo.
            </p>
            <div className="pay-note">
              <span>Sichere Zahlung</span>
              <img
                src="/icons/zahlungsicons.png"
                alt="Zahlungsarten: Visa, Mastercard, PayPal und weitere"
                className="footer-payment-img"
                width={220}
                height={40}
              />
            </div>
          </div>

          <div>
            <h4>Produkte</h4>
            <ul>
              {headerQuickLinks.map(({ label, productSlug }) => (
                <li key={productSlug}>
                  <Link href={`/product/${productSlug}`}>{label}</Link>
                </li>
              ))}
              <li>
                <Link href="/products">Alle Produkte</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Plattformen</h4>
            <ul>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/products/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Service &amp; Rechtliches</h4>
            <ul>
              <li>
                <Link href="/ueber-uns">Über uns</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/bestellung-verfolgen">Bestellung verfolgen</Link>
              </li>
              <li>
                <Link href="/kontakt">Kontakt</Link>
              </li>
              <li>
                <Link href="/instagram-profilbild">Instagram-Profilbild</Link>
              </li>
              <li>
                <Link href="/impressum">Impressum</Link>
              </li>
              <li>
                <Link href="/datenschutz">Datenschutz</Link>
              </li>
              <li>
                <Link href="/agb">AGB</Link>
              </li>
              <li>
                <Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} Followerbase · Venus Management GbR, Engelskirchen
          </span>
          <span>Made in Germany 🇩🇪</span>
        </div>
      </div>
    </footer>
  );
}
