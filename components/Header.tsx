import Link from "next/link";
import { Logo } from "./Logo";
import { CartLink } from "./CartLink";
import { categories, headerQuickLinks } from "@/lib/categories";

/**
 * Header: Logo, Quick-Links, „Alle Produkte“ (nur Kategorien als Links zu Kategorieseiten), Warenkorb.
 */
export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Logo />
        <nav className="header-nav">
          {headerQuickLinks.map(({ label, productSlug }) => (
            <Link key={productSlug} href={`/product/${productSlug}`} className="nav-link">
              {label}
            </Link>
          ))}
          <div className="nav-menu-wrap">
            <span className="nav-link nav-menu-trigger">Alle Produkte</span>
            <div className="nav-dropdown nav-dropdown-categories-only" aria-hidden>
              <nav className="nav-dropdown-categories-list">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products/${category.slug}`}
                    className="nav-dropdown-category-link"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <Link href="/bestellung-verfolgen" className="nav-link">
            Bestellung verfolgen
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
