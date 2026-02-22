"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export type ProductCarouselItem = {
  slug: string;
  name: string;
  image?: string;
  pricesCents: number[];
};

function formatAbPrice(cents: number): string {
  const euros = cents / 100;
  return euros % 1 === 0 ? `ab ${euros} €` : `ab ${euros.toFixed(2)} €`;
}

function getImageAlt(imagePath: string | undefined, fallback: string): string {
  if (!imagePath) return fallback;
  const filename = imagePath.split("/").pop() ?? "";
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  return withoutExt || fallback;
}

type ProductCarouselProps = {
  products: ProductCarouselItem[];
  title?: string;
};

export function ProductCarousel({ products, title = "Weitere Produkte" }: ProductCarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = viewportRef.current;
    if (!el) return;
    const step = el.clientWidth;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="product-carousel" aria-label={title}>
      <div className="product-carousel-header">
        <h2 className="product-carousel-title">{title}</h2>
      </div>
      <div className="product-carousel-row">
        <button type="button" className="product-carousel-arrow product-carousel-arrow-prev" onClick={() => scroll("left")} aria-label="Zurück">
          ‹
        </button>
        <div className="product-carousel-viewport" ref={viewportRef}>
          <div className="product-carousel-track">
            {products.map((product) => {
              const minPriceCents = product.pricesCents?.length ? Math.min(...product.pricesCents) : 0;
              return (
                <Link key={product.slug} href={`/product/${product.slug}`} className="product-carousel-card card">
                  <div className="product-carousel-card-thumb">
                    {product.image ? (
                      product.image.startsWith("/") ? (
                        <Image src={product.image} alt={getImageAlt(product.image, product.name)} width={120} height={120} sizes="120px" className="product-carousel-card-img" />
                      ) : (
                        <img src={product.image} alt={getImageAlt(product.image, product.name)} className="product-carousel-card-img" />
                      )
                    ) : (
                      <span className="product-carousel-card-placeholder">Bild</span>
                    )}
                  </div>
                  <div className="product-carousel-card-body">
                    <span className="product-carousel-card-name">{product.name}</span>
                    <span className="product-carousel-card-price">{formatAbPrice(minPriceCents)}</span>
                  </div>
                  <span className="product-carousel-card-arrow">→</span>
                </Link>
              );
            })}
          </div>
        </div>
        <button type="button" className="product-carousel-arrow product-carousel-arrow-next" onClick={() => scroll("right")} aria-label="Weiter">
          ›
        </button>
      </div>
    </section>
  );
}
