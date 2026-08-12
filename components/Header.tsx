"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [canScrollMore, setCanScrollMore] = useState(false);
  const [openCatId, setOpenCatId] = useState<string | null>(null);
  const pathname = usePathname() || "";
  const cats = orderedCategories();
  const catbarRef = useRef<HTMLElement>(null);
  const closeCatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeMenu = () => setMobileMenuOpen(false);

  const clearCloseCatTimer = () => {
    if (closeCatTimer.current) {
      clearTimeout(closeCatTimer.current);
      closeCatTimer.current = null;
    }
  };

  const openCat = (id: string) => {
    clearCloseCatTimer();
    setOpenCatId(id);
  };

  const scheduleCloseCat = () => {
    clearCloseCatTimer();
    closeCatTimer.current = setTimeout(() => setOpenCatId(null), 120);
  };

  const closeCat = () => {
    clearCloseCatTimer();
    setOpenCatId(null);
  };

  // Route-Wechsel: Dropdown schließen
  useEffect(() => {
    setOpenCatId(null);
  }, [pathname]);

  // Klick außerhalb / Escape schließt Dropdown
  useEffect(() => {
    if (!openCatId) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && catbarRef.current?.contains(target)) return;
      setOpenCatId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCatId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openCatId]);

  useEffect(() => {
    return () => clearCloseCatTimer();
  }, []);

  const updateCatScrollHint = useCallback(() => {
    const el = catbarRef.current;
    if (!el) return;
    const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft;
    setCanScrollMore(remaining > 8);
  }, []);

  useEffect(() => {
    const el = catbarRef.current;
    if (!el) return;
    updateCatScrollHint();
    el.addEventListener("scroll", updateCatScrollHint, { passive: true });
    window.addEventListener("resize", updateCatScrollHint);
    return () => {
      el.removeEventListener("scroll", updateCatScrollHint);
      window.removeEventListener("resize", updateCatScrollHint);
    };
  }, [updateCatScrollHint]);

  const scrollCatbar = () => {
    const el = catbarRef.current;
    if (!el) return;
    el.scrollBy({ left: Math.min(180, el.clientWidth * 0.55), behavior: "smooth" });
  };

  return (
    <>
      <header className={`site-header${mobileMenuOpen ? " is-open" : ""}`}>
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
          <div className="site-header-wrap catbar-wrap">
            <nav
              ref={catbarRef}
              className="catbar"
              aria-label="Plattformen"
            >
              {cats.map((category) => {
                const href = `/products/${category.slug}`;
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                const bg = CAT_BG[category.id] ?? "";
                const isOpen = openCatId === category.id;
                return (
                  <div
                    key={category.id}
                    className={`cat-item${isOpen ? " is-open" : ""}`}
                    onMouseEnter={() => openCat(category.id)}
                    onMouseLeave={scheduleCloseCat}
                  >
                    <Link
                      href={href}
                      className={`cat${active ? " active" : ""}`}
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      onFocus={() => openCat(category.id)}
                      onClick={() => openCat(category.id)}
                    >
                      <span className={`pf-mini ${bg}`}>
                        <PlatformMiniIcon id={category.id} />
                      </span>
                      {category.name}
                    </Link>
                    <div
                      className="cat-dropdown"
                      role="menu"
                      aria-label={`${category.name} Produkte`}
                      aria-hidden={!isOpen}
                    >
                      <div className="cat-dropdown-inner">
                        <Link
                          href={href}
                          className="cat-dropdown-title"
                          onClick={closeCat}
                        >
                          Alle {category.name}-Produkte
                        </Link>
                        <div className="cat-dropdown-list">
                          {category.products.map((product) => (
                            <Link
                              key={product.slug}
                              href={`/product/${product.slug}`}
                              className="cat-dropdown-link"
                              role="menuitem"
                              onClick={closeCat}
                            >
                              {product.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Link href="/products" className="cat cat-all">
                Alle Produkte →
              </Link>
            </nav>
            {canScrollMore && (
              <button
                type="button"
                className="catbar-arrow"
                aria-label="Weitere Kategorien anzeigen"
                onClick={scrollCatbar}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    d="M9 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
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

          <span className="mm-label">Kategorien</span>
          {cats.map((category) => {
            const bg = CAT_BG[category.id] ?? "";
            return (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className="mm-cat"
                onClick={closeMenu}
              >
                <span className={`pf-mini ${bg}`}>
                  <PlatformMiniIcon id={category.id} />
                </span>
                {category.name}
              </Link>
            );
          })}
          <Link href="/products" className="mm-all-cats" onClick={closeMenu}>
            Alle Kategorien →
          </Link>

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
      {/* Platzhalter, damit fixed Header auf Mobile den Inhalt nicht überdeckt */}
      <div className="site-header-spacer" aria-hidden />
    </>
  );
}
