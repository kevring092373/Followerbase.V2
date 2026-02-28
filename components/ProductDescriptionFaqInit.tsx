"use client";

import { useEffect } from "react";

/**
 * Bindet Klick-Handler für FAQs in der Produktbeschreibung.
 * Das HTML kommt per dangerouslySetInnerHTML; onclick wird dort nicht ausgeführt.
 * Diese Komponente fügt nach dem Mount Delegation für .faq-question hinzu.
 */
export function ProductDescriptionFaqInit() {
  useEffect(() => {
    const container = document.querySelector(".product-description-html");
    if (!container) return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const question = target.closest?.(".faq-question");
      if (!question) return;
      const item = question.closest?.(".faq-item");
      if (item) item.classList.toggle("open");
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, []);

  return null;
}
