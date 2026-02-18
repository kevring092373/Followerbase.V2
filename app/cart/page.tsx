"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

/**
 * Warenkorb hat keine eigene Seite mehr – Drawer von rechts.
 * /cart leitet zur Startseite weiter und öffnet den Warenkorb-Drawer.
 */
export default function CartPage() {
  const router = useRouter();
  const { openCart } = useCart();

  useEffect(() => {
    openCart();
    router.replace("/");
  }, [openCart, router]);

  return (
    <div className="cart-page">
      <p className="cart-page-meta">Warenkorb wird geöffnet …</p>
    </div>
  );
}
