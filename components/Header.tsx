"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { CartLink } from "./CartLink";
import { categories, headerQuickLinks } from "@/lib/categories";
import { WhatsAppButton } from "./WhatsAppButton";

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
 * Header: Logo, Produkt-Links, Blog/Über uns links; „Bestellung verfolgen“ + Warenkorb
 * rechts fest verankert. WhatsApp nur im Hero und Mobile-Menü (Desktop-Nav wäre zu voll).
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Logo />
        <nav className="header-nav" aria-label="Hauptnavigation">
          {/* Desktop: Mitte = Produkt-/Info-Links, rechts fest = Tracking + Warenkorb */}
          <div className="header-nav-desktop">
            <div className="header-nav-main">
              {headerQuickLinks.map(({ label, productSlug }) => (
                <Link
                  key={productSlug}
                  href={`/product/${productSlug}`}
                  className="nav-link nav-link-quick"
                >
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
              <Link href="/blog" className="nav-link">
                Blog
              </Link>
              <Link href="/ueber-uns" className="nav-link">
                Über uns
              </Link>
            </div>
            <div className="header-nav-actions">
              <Link href="/bestellung-verfolgen" className="nav-link nav-link-tracking">
                Bestellung verfolgen
              </Link>
              <CartLink />
            </div>
          </div>

          {/* Mobile: Hamburger + Tracking + Warenkorb */}
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
            <Link
              href="/bestellung-verfolgen"
              className="nav-link nav-link-tracking nav-link-tracking-compact"
              aria-label="Bestellung verfolgen"
            >
              Bestellung
            </Link>
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
            href="/blog"
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/ueber-uns"
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Über uns
          </Link>
          <Link
            href="/bestellung-verfolgen"
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Bestellung verfolgen
          </Link>
          <WhatsAppButton className="mobile-menu-link whatsapp-nav-link" iconSize={17} />
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
