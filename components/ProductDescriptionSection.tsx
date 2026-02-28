"use client";

import { useMemo } from "react";
import { prepareProductDescriptionHtml } from "@/lib/seo";

type Props = { html: string };

/**
 * Rendert die Produktbeschreibung. FAQs werden beim Aufbereiten in
 * <details>/<summary> umgewandelt und öffnen sich nativ ohne JS.
 */
export function ProductDescriptionSection({ html }: Props) {
  const { styleContent, htmlContent } = useMemo(
    () => prepareProductDescriptionHtml(html),
    [html]
  );

  return (
    <section className="product-description-section">
      <div className="product-description-inner">
        {styleContent ? (
          <style dangerouslySetInnerHTML={{ __html: styleContent }} />
        ) : null}
        <div
          className="product-description-html"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </section>
  );
}
