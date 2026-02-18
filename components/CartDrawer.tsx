"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

/**
 * Warenkorb als von rechts einschiebender Drawer (~1/4 Breite).
 * Öffnet sich beim Klick auf Warenkorb-Icon oder nach „In den Warenkorb“.
 */
export function CartDrawer() {
  const {
    items,
    removeItem,
    itemCount,
    sellerNote,
    setSellerNote,
    isCartOpen,
    closeCart,
  } = useCart();

  const totalCentsComputed = items.reduce((sum, i) => sum + i.priceCents, 0);

  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="cart-drawer-overlay"
        aria-hidden
        onClick={closeCart}
      />
      <aside
        className="cart-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Warenkorb"
      >
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">Warenkorb</h2>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={closeCart}
            aria-label="Warenkorb schließen"
          >
            ×
          </button>
        </div>

        <div className="cart-drawer-body">
          {itemCount === 0 ? (
            <div className="cart-drawer-empty">
              <p className="cart-empty-text">Dein Warenkorb ist noch leer.</p>
              <p className="cart-empty-sub">
                Füge Produkte hinzu, indem du auf einer Produktseite „In den Warenkorb“ wählst.
              </p>
              <Link href="/products" className="btn btn-primary" onClick={closeCart}>
                Zu den Produkten
              </Link>
            </div>
          ) : (
            <>
              <p className="cart-drawer-meta">
                {itemCount} {itemCount === 1 ? "Artikel" : "Artikel"} im Warenkorb
              </p>
              <ul className="cart-list cart-drawer-list">
                {items.map((item) => (
                  <li key={item.id} className="cart-item">
                    <div className="cart-item-main">
                      <h3 className="cart-item-name">
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="cart-item-link"
                          onClick={closeCart}
                        >
                          {item.productName}
                        </Link>
                      </h3>
                      <p className="cart-item-detail">
                        Menge: {item.quantity} · Ziel: {item.target}
                      </p>
                    </div>
                    <div className="cart-item-side">
                      <span className="cart-item-price">
                        {(item.priceCents / 100).toFixed(2)} €
                      </span>
                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => removeItem(item.id)}
                        aria-label="Aus Warenkorb entfernen"
                      >
                        Entfernen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-seller-note cart-drawer-seller-note">
                <label htmlFor="cart-drawer-seller-note" className="cart-seller-note-label">
                  Nachricht an den Verkäufer
                </label>
                <p className="cart-seller-note-hint">
                  Optionale Hinweise – der Verkäufer erhält diese mit deiner Bestellung.
                </p>
                <textarea
                  id="cart-drawer-seller-note"
                  className="cart-seller-note-input"
                  placeholder="z. B. Wünsche, Anweisungen …"
                  value={sellerNote}
                  onChange={(e) => setSellerNote(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="cart-drawer-footer">
                <div className="cart-total-row">
                  <span className="cart-total-label">Gesamt</span>
                  <span className="cart-total-value">
                    {(totalCentsComputed / 100).toFixed(2)} €
                  </span>
                </div>
                <div className="cart-drawer-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeCart}>
                    Weiter einkaufen
                  </button>
                  <Link href="/checkout" className="btn btn-primary" onClick={closeCart}>
                    Zur Kasse
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
