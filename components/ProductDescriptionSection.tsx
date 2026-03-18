"use client";

import { useMemo } from "react";
import { prepareProductDescriptionHtml } from "@/lib/seo";

type Props = {
  html: string;
  /**
   * Wenn true: komplett "raw" rendern (ohne prepareProductDescriptionHtml),
   * damit die Supabase-Inhalte 1:1 wie gespeichert ausgegeben werden.
   */
  raw?: boolean;
};

/**
 * Rendert die Produktbeschreibung. FAQs werden beim Aufbereiten in
 * <details>/<summary> umgewandelt und öffnen sich nativ ohne JS.
 */
export function ProductDescriptionSection({ html, raw }: Props) {
  if (raw) {
    return (
      <section className="product-description-section">
        <div className="product-description-inner">
          <div
            className="product-description-raw-html"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
    );
  }

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
