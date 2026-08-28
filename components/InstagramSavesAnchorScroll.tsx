"use client";

import { useEffect } from "react";

/**
 * Nur auf /product/instagram-saves-kaufen: Anker-Scroll und FAQ aria-expanded.
 */
export function InstagramSavesAnchorScroll() {
  useEffect(() => {
    const page = document.querySelector(".instagram-saves-page");
    if (!(page instanceof HTMLElement)) return;

    const syncFaq = (details: HTMLDetailsElement) => {
      const summary = details.querySelector("summary");
      if (summary) summary.setAttribute("aria-expanded", details.open ? "true" : "false");
    };
    page.querySelectorAll("details.fbsaves-faq-item").forEach((node) => {
      if (node instanceof HTMLDetailsElement) syncFaq(node);
    });

    const onToggle = (event: Event) => {
      const details = event.target;
      if (details instanceof HTMLDetailsElement && page.contains(details)) {
        syncFaq(details);
      }
    };

    const onClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element) || !page.contains(target)) return;
      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#") || href.length < 2) return;
      const destination = document.getElementById(href.slice(1));
      if (!destination || !page.contains(destination)) return;
      event.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      destination.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };

    page.addEventListener("click", onClick);
    page.addEventListener("toggle", onToggle, true);
    return () => {
      page.removeEventListener("click", onClick);
      page.removeEventListener("toggle", onToggle, true);
    };
  }, []);
  return null;
}
