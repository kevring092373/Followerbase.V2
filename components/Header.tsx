"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { CartLink } from "./CartLink";
import { categories, headerQuickLinks } from "@/lib/categories";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="mobile-menu-icon" aria-hidden>
      <span className="mobile-menu-icon-line" />
      <span className="mobile-menu-icon-line" />
      <span className="mobile-menu-icon-line" />
    </span>
  );
}

/**
 * Header: Logo, Quick-Links, „Alle Produkte“, Warenkorb.
 * Auf Mobile: Hamburger-Menü, das sich ausklappt.
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Logo />
        <nav className="header-nav" aria-label="Hauptnavigation">
          {/* Desktop: normale Links */}
          <div className="header-nav-desktop">
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
          </div>

          {/* Mobile: Hamburger-Button + Warenkorb */}
          <div className="header-nav-mobile">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-panel"
              aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            >
              <HamburgerIcon open={mobileMenuOpen} />
            </button>
            <CartLink />
          </div>
        </nav>
      </div>

      {/* Ausklappbares Mobile-Menü */}
      <div
        id="mobile-menu-panel"
        className="mobile-menu-panel"
        data-open={mobileMenuOpen}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-menu-inner">
          {headerQuickLinks.map(({ label, productSlug }) => (
            <Link
              key={productSlug}
              href={`/product/${productSlug}`}
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="mobile-menu-section">
            <span className="mobile-menu-label">Alle Produkte</span>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className="mobile-menu-link mobile-menu-sublink"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <Link
            href="/bestellung-verfolgen"
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Bestellung verfolgen
          </Link>
        </div>
      </div>

      {/* Overlay wenn Menü offen */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-menu-overlay"
          aria-label="Menü schließen"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
