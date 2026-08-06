"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Dünner Lese-Fortschrittsbalken am unteren Rand des sticky Headers (links → rechts).
 */
export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [header, setHeader] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHeader(document.querySelector<HTMLElement>(".header"));

    const articleEl = () => document.querySelector<HTMLElement>(".blog-article");

    const updateProgress = () => {
      const el = articleEl();
      if (!el) {
        setProgress(0);
        return;
      }

      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const articleTop = rect.top + scrollTop;
      const start = articleTop;
      const end = articleTop + el.offsetHeight - window.innerHeight;

      if (end <= start) {
        setProgress(scrollTop > start ? 1 : 0);
        return;
      }

      const p = (scrollTop - start) / (end - start);
      setProgress(Math.min(1, Math.max(0, p)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  if (!header) return null;

  return createPortal(
    <div
      className="blog-reading-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label="Lese-Fortschritt"
    >
      <div
        className="blog-reading-progress-bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>,
    header
  );
}
