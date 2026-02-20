import Link from "next/link";

const mainLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/instagram-profilbild", label: "Instagram-Profilbild" },
  { href: "/seiten", label: "Sitemap" },
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
        <div className="footer-payment-icons">
          <img
            src="/icons/zahlungsicons.png"
            alt="Zahlungsarten"
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
