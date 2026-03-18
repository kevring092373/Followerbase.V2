"use client";

import { useMemo } from "react";
import { prepareProductDescriptionHtml, prepareProductDescriptionHtmlMinimal } from "@/lib/seo";

type Props = {
  html: string;
  /**
   * prepared: volle Vorbereitung (FAQ-Transform + CTA-Fix + Scoping)
   * minimal: nur Viewport/head entfernen + embedded <style> auf Container scoped
   * raw: 1:1 Supabase-HTML rendern (ohne Vorbereitung)
   */
  mode?: "prepared" | "minimal" | "raw";
};

/**
 * Rendert die Produktbeschreibung. FAQs werden beim Aufbereiten in
 * <details>/<summary> umgewandelt und öffnen sich nativ ohne JS.
 */
export function ProductDescriptionSection({ html, mode }: Props) {
  const effectiveMode = mode ?? "prepared";

  if (effectiveMode === "raw") {
    return (
      <section className="product-description-section">
        <div className="blog-post-page">
          <div
            className="blog-page-html"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
    );
  }

  if (effectiveMode === "minimal") {
    const { styleContent, htmlContent } = useMemo(
      () => prepareProductDescriptionHtmlMinimal(html, ".product-description-html"),
      [html]
    );

    return (
      <section className="product-description-section">
        <div className="product-description-inner">
          {styleContent ? <style dangerouslySetInnerHTML={{ __html: styleContent }} /> : null}
          <div
            className="product-description-html"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
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
