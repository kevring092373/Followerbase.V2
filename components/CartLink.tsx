"use client";

import { useCart } from "@/context/CartContext";
import { CartIcon } from "./CartIcon";

export function CartLink() {
  const { itemCount, openCart } = useCart();
  return (
    <button
      type="button"
      className="nav-link nav-link-cart"
      onClick={openCart}
      aria-label={itemCount > 0 ? `Warenkorb (${itemCount} Artikel)` : "Warenkorb"}
    >
      <span className="nav-link-cart-wrap">
        <CartIcon />
        {itemCount > 0 && (
          <span className="nav-link-cart-badge" aria-hidden>
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </span>
    </button>
  );
}
