import Link from "next/link";
import { categories } from "@/lib/categories";

const mainLinks = [
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/blog", label: "Blog" },
  { href: "/instagram-profilbild", label: "Instagram-Profilbild" },
] as const;

const legalLinks = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/widerrufsbelehrung", label: "Widerrufsbelehrung" },
] as const;

export function Footer() {
  return (
    <footer className="footer">
      {/* Kategorieseiten brauchen statische Links von jeder indexierten Seite, damit Google
          sie zuverlässig findet – im Header stehen sie nur im ausgeblendeten Dropdown. */}
      <div className="footer-platforms">
        <span className="footer-platforms-label">Plattformen</span>
        <nav className="footer-platforms-nav" aria-label="Plattformen">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products/${cat.slug}`} className="footer-link">
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="footer-inner">
        <div className="footer-payment-block">
          <span className="footer-payment-label">Sichere Zahlung</span>
          <img
            src="/icons/zahlungsicons.png"
            alt="Zahlungsarten: Visa, Mastercard, PayPal und weitere"
            className="footer-payment-img"
          />
        </div>
        <nav className="footer-nav" aria-label="Footer-Navigation">
          {mainLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="footer-link">
              {label}
            </Link>
          ))}
          {legalLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="footer-link">
              {label}
            </Link>
          ))}
        </nav>
        <p className="footer-copy">
          © {new Date().getFullYear()} Followerbase
        </p>
      </div>
    </footer>
  );
}
