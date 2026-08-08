"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { CartLink } from "./CartLink";
import { categories, headerQuickLinks } from "@/lib/categories";
import { WhatsAppButton } from "./WhatsAppButton";
import { PlatformMiniIcon } from "./PlatformMiniIcon";

const CAT_BG: Record<string, string> = {
  instagram: "bg-ig",
  tiktok: "bg-tt",
  youtube: "bg-yt",
  snapchat: "bg-sc",
  telegram: "bg-tg",
  facebook: "bg-fb",
  reddit: "bg-rd",
  threads: "bg-th",
};

/** Reihenfolge wie im Header-Entwurf */
const CAT_ORDER = [
  "instagram",
  "tiktok",
  "youtube",
  "snapchat",
  "telegram",
  "facebook",
  "reddit",
  "threads",
] as const;

function orderedCategories() {
  return CAT_ORDER.map((id) => categories.find((c) => c.id === id)).filter(
    (c): c is (typeof categories)[number] => Boolean(c)
  );
}

/**
 * Zweizeiliger Header: Logo · Nav · CTA oben,
 * Plattform-Leiste darunter (mobil horizontal wischbar).
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "";
  const cats = orderedCategories();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-wrap">
        <div className="site-header-top">
          <Logo />

          <nav className="site-header-nav" aria-label="Hauptnavigation">
            <Link href="/blog" className="site-navlink">
              Blog
            </Link>
            <Link href="/ueber-uns" className="site-navlink">
              Über uns
            </Link>
            <Link href="/bestellung-verfolgen" className="site-navlink site-navlink-muted">
              Bestellung verfolgen
            </Link>
          </nav>

          <div className="site-header-right">
            <WhatsAppButton
              className="site-header-wa"
              label=""
              iconSize={18}
            />
            <CartLink />
            <Link href="/products" className="site-header-cta">
              Follower kaufen
            </Link>
            <button
              type="button"
              className="site-burger"
              aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={mobileMenuOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <div className="catbar-outer">
        <div className="site-header-wrap">
          <nav className="catbar" aria-label="Plattformen">
            {cats.map((category) => {
              const href = `/products/${category.slug}`;
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              const bg = CAT_BG[category.id] ?? "";
              return (
                <Link
                  key={category.id}
                  href={href}
                  className={`cat${active ? " active" : ""}`}
                >
                  <span className={`pf-mini ${bg}`}>
                    <PlatformMiniIcon id={category.id} />
                  </span>
                  {category.name}
                </Link>
              );
            })}
            <Link href="/products" className="cat cat-all">
              Alle Produkte →
            </Link>
          </nav>
        </div>
      </div>

      <div
        id="site-mobile-menu"
        className={`site-mobile-menu${mobileMenuOpen ? " open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <span className="mm-label">Bestseller</span>
        {headerQuickLinks.map(({ label, productSlug }) => (
          <Link
            key={productSlug}
            href={`/product/${productSlug}`}
            onClick={closeMenu}
          >
            {label}
          </Link>
        ))}
        <span className="mm-label">Mehr</span>
        <Link href="/blog" onClick={closeMenu}>
          Blog
        </Link>
        <Link href="/ueber-uns" onClick={closeMenu}>
          Über uns
        </Link>
        <Link href="/bestellung-verfolgen" onClick={closeMenu}>
          Bestellung verfolgen
        </Link>
        <WhatsAppButton
          className="site-mobile-wa"
          label="WhatsApp"
          iconSize={17}
        />
      </div>

      {mobileMenuOpen && (
        <button
          type="button"
          className="site-mobile-overlay"
          aria-label="Menü schließen"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
