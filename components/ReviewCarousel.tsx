"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { reviews, type Review } from "@/lib/reviews-data";

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="review-card card">
      <div className="review-card-top">
        <div className="review-card-stars" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`review-star ${i < review.rating ? "review-star-filled" : ""}`}
            >
              ★
            </span>
          ))}
        </div>
        {review.verified && (
          <span className="review-card-badge" title="Verifizierter Kauf">
            ✓ Verifizierter Kauf
            {review.productHint && (
              <span className="review-card-badge-hint"> · {review.productHint}</span>
            )}
          </span>
        )}
      </div>
      <p className="review-card-text">{review.text}</p>
      <p className="review-card-author">{review.author}</p>
    </article>
  );
}

export function ReviewCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 2);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(".review-card")?.getBoundingClientRect().width ?? 320;
    const gap = 16;
    const step = (cardWidth + gap) * (direction === "next" ? 1 : -1);
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  return (
    <section className="review-carousel-section" aria-labelledby="review-carousel-heading">
      <h2 id="review-carousel-heading" className="home-section-label review-carousel-title">
        Was Kunden sagen
      </h2>
      <p className="review-carousel-intro">
        Verifizierte Käufe und Bewertungen von Nutzer:innen – ehrliche Meinungen zu Followerbase.
      </p>

      <div className="review-carousel-wrap">
        <button
          type="button"
          className="review-carousel-btn review-carousel-btn-prev"
          onClick={() => scroll("prev")}
          disabled={!canScrollPrev}
          aria-label="Vorherige Bewertungen"
        >
          ‹
        </button>

        <div className="review-carousel-track" ref={scrollRef}>
          {reviews.map((review) => (
            <div key={review.id} className="review-carousel-slide">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="review-carousel-btn review-carousel-btn-next"
          onClick={() => scroll("next")}
          disabled={!canScrollNext}
          aria-label="Nächste Bewertungen"
        >
          ›
        </button>
      </div>
    </section>
  );
}
