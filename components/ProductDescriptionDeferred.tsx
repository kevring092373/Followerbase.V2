"use client";

import { useState, useEffect } from "react";
import { prepareProductDescriptionHtml } from "@/lib/seo";

/**
 * Rendert die Produktbeschreibung erst nach dem ersten Paint.
 * Verhindert, dass die Seite beim Laden "blockiert", bis der lange HTML-Block
 * geparst und gelayoutet ist – auf Mobile kann man so sofort scrollen.
 */
export function ProductDescriptionDeferred({
  rawHtml,
  raw,
}: {
  rawHtml: string | null;
  raw?: boolean;
}) {
  // Hinweis: Dieser Component wird aktuell nicht für die Produktseite verwendet,
  // ist aber mit "raw"-Modus ausgestattet, falls du ihn später nutzt.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!rawHtml?.trim()) {
      setReady(true);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setReady(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [rawHtml]);

  if (!rawHtml?.trim()) return null;

  if (!ready) {
    return (
      <section className="product-description-section" aria-busy="true">
        <div className="product-description-inner">
          <div className="product-description-placeholder" />
        </div>
      </section>
    );
  }

  if (!rawHtml) return null;

  if (raw) {
    return (
      <section className="product-description-section">
        <div className="product-description-inner">
          <div
            className="product-description-raw-html"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        </div>
      </section>
    );
  }

  const { styleContent, htmlContent } = prepareProductDescriptionHtml(rawHtml);
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
