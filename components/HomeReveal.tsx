"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface HomeRevealProps {
  children: ReactNode;
  className?: string;
  /** Verzögerung in ms für Stagger */
  delay?: number;
}

export function HomeReveal({ children, className = "", delay = 0 }: HomeRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("reveal-visible");
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`home-reveal ${className}`.trim()}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
