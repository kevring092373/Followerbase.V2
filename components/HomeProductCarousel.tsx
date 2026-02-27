"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductImageAlt } from "@/lib/product-image-alt";

export type HomeProductCarouselItem = {
  slug: string;
  name: string;
  image?: string;
  pricesCents: number[];
};

function formatAbPrice(cents: number): string {
  const euros = cents / 100;
  return euros % 1 === 0 ? `ab ${euros} €` : `ab ${euros.toFixed(2)} €`;
}

type HomeProductCarouselProps = {
  products: HomeProductCarouselItem[];
  title?: string;
};

export function HomeProductCarousel({ products, title = "Beliebte Produkte" }: HomeProductCarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = viewportRef.current;
    if (!el) return;
    const step = el.clientWidth;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="home-product-carousel" aria-label={title}>
      <h2 className="home-product-carousel-title">{title}</h2>
      <div className="home-product-carousel-row">
        <button
          type="button"
          className="home-product-carousel-zone home-product-carousel-zone-prev"
          onClick={() => scroll("left")}
          aria-label="Zurück"
        >
          <span className="home-product-carousel-zone-icon" aria-hidden>‹</span>
        </button>
        <div className="home-product-carousel-viewport" ref={viewportRef}>
          <div className="home-product-carousel-track">
            {products.map((product) => {
              const minPriceCents = product.pricesCents?.length ? Math.min(...product.pricesCents) : 0;
              return (
                <Link key={product.slug} href={`/product/${product.slug}`} className="home-product-carousel-card">
                  <div className="home-product-carousel-card-image">
                    {product.image ? (
                      product.image.startsWith("/") ? (
                        <Image
                          src={product.image}
                          alt={getProductImageAlt(product.image, product.name)}
                          width={280}
                          height={200}
                          sizes="(max-width: 640px) 240px, 280px"
                          className="home-product-carousel-card-img"
                        />
                      ) : (
                        <img
                          src={product.image}
                          alt={getProductImageAlt(product.image, product.name)}
                          className="home-product-carousel-card-img"
                        />
                      )
                    ) : (
                      <span className="home-product-carousel-card-placeholder">Bild</span>
                    )}
                  </div>
                  <div className="home-product-carousel-card-body">
                    <span className="home-product-carousel-card-name">{product.name}</span>
                    <span className="home-product-carousel-card-price">{formatAbPrice(minPriceCents)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          className="home-product-carousel-zone home-product-carousel-zone-next"
          onClick={() => scroll("right")}
          aria-label="Weiter"
        >
          <span className="home-product-carousel-zone-icon" aria-hidden>›</span>
        </button>
      </div>
    </section>
  );
}
