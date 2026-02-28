"use client";

import { useEffect } from "react";

/**
 * Bindet Klick-Handler für FAQs in der Produktbeschreibung.
 * Das HTML kommt per dangerouslySetInnerHTML; onclick wird dort nicht ausgeführt.
 * Delegation auf document, damit der Klick auch bei verzögerter Hydration erkannt wird.
 */
export function ProductDescriptionFaqInit() {
  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // Nur Klicks innerhalb der Produktbeschreibung (nicht Startseiten-FAQs)
      if (!target.closest?.(".product-description-html")) return;
      const question = target.closest?.(".faq-question");
      if (!question) return;
      const item = question.closest?.(".faq-item");
      if (!item) return;
      // Nur bei div.faq-item (Produktbeschreibung), nicht bei <details> (Startseite)
      if (item.tagName === "DETAILS") return;
      e.preventDefault();
      item.classList.toggle("open");
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
