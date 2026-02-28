"use client";

import { useRef, useEffect, useMemo } from "react";
import { prepareProductDescriptionHtml } from "@/lib/seo";

type Props = { html: string };

/**
 * Rendert die Produktbeschreibung (HTML) und bindet FAQ-Klicks direkt am Container.
 * So funktionieren die FAQs zuverlässig, ohne document-Delegation.
 */
export function ProductDescriptionSection({ html }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { styleContent, htmlContent } = useMemo(
    () => prepareProductDescriptionHtml(html),
    [html]
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const question = target.closest?.(".faq-question");
      if (!question) return;
      const item = question.closest?.(".faq-item");
      if (!item || item.tagName === "DETAILS") return;
      e.preventDefault();
      item.classList.toggle("open");
    };

    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [htmlContent]);

  return (
    <section className="product-description-section">
      <div className="product-description-inner">
        {styleContent ? (
          <style dangerouslySetInnerHTML={{ __html: styleContent }} />
        ) : null}
        <div
          ref={contentRef}
          className="product-description-html"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </section>
  );
}
