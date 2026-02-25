import Link from "next/link";
import Image from "next/image";

const mainLinks = [
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
      <div className="footer-inner">
        <div className="footer-payment-block">
          <span className="footer-payment-label">Sichere Zahlung</span>
          <Image
            src="/icons/zahlungsicons.png"
            alt="Zahlungsarten: Visa, Mastercard, PayPal und weitere"
            width={200}
            height={44}
            className="footer-payment-img"
            sizes="(max-width: 640px) 160px, 200px"
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
