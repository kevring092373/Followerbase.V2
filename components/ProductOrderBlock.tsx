"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { formatEuroFromCents, formatQuantity } from "@/lib/format";
import { PRODUCT_ORDER_ANCHOR_ID } from "@/lib/product-seo";
import type { ProductTier } from "@/lib/products-data";

const INDIVIDUAL_MIN = 100;
const INDIVIDUAL_MAX_DEFAULT = 1000;
const INDIVIDUAL_STEP = 50;

/** Follower/Profil-Produkte: Profillink oder Nutzername. Sonst (Likes, Views, …): Beitragslink. */
function isFollowerProduct(slug: string): boolean {
  const s = slug.toLowerCase();
  return s.includes("follower") || s.includes("gruppenmitglieder");
}

function isTikTokFollowerProduct(slug: string): boolean {
  const s = slug.toLowerCase();
  return s.includes("tiktok") && s.includes("follower");
}

function getTargetLabel(slug: string): string {
  return isFollowerProduct(slug) ? "Profillink oder Nutzername" : "Beitragslink";
}

function getTargetPlaceholder(slug: string): string {
  return isFollowerProduct(slug) ? "z. B. @username oder Profil-Link" : "z. B. Link zum Beitrag/Post";
}

function getTargetHint(slug: string): string {
  return isFollowerProduct(slug)
    ? "Gib hier den Nutzernamen oder den Link zu deinem Profil ein. (Pflichtfeld)"
    : "Gib hier den Link zum Beitrag (Post, Reel, Video etc.) ein. (Pflichtfeld)";
}

function getTargetError(slug: string): string {
  return isFollowerProduct(slug)
    ? "Bitte Profillink oder Nutzername eingeben."
    : "Bitte Beitragslink eingeben.";
}

type ProductOrderBlockProps = {
  productSlug: string;
  quantities: number[];
  pricesCents: number[];
  productName: string;
  /** Kurzbeschreibung (Bulletpoints), wird oben im Block angezeigt */
  bullets?: string[];
  /** Optionale Stufen (z. B. Normal / Premium) – Auswahl + eigene Mengen/Preise/Slider-Max */
  tiers?: ProductTier[];
  /** Preise direkt auf den Mengen-Chips (für lesbare Mobile-Auswahl). */
  showPackagePrices?: boolean;
};

/**
 * Der Slider läuft in echten Mengen statt in Prozent. Nur so melden Screenreader
 * die tatsächliche Followerzahl und die Pfeiltasten springen in 50er-Schritten.
 */
function snapQuantity(value: number, min: number, max: number): number {
  const qty = Math.round(value / INDIVIDUAL_STEP) * INDIVIDUAL_STEP;
  return Math.min(max, Math.max(min, qty));
}

/**
 * Preis für individuelle Menge anhand der Original-Mengenvarianten.
 * Trifft der Slider genau eine Standardmenge, gilt deren Preis.
 * Dazwischen wird zwischen den beiden benachbarten Varianten interpoliert
 * (nicht zwischen erster und letzter Stufe).
 */
function getIndividualPriceCents(quantity: number, quantities: number[], pricesCents: number[]): number {
  const pairs = quantities
    .map((q, i) => ({ q, p: pricesCents[i] }))
    .filter((x): x is { q: number; p: number } => Number.isFinite(x.q) && Number.isFinite(x.p) && x.q > 0)
    .sort((a, b) => a.q - b.q);

  if (pairs.length === 0) return quantity;

  const exact = pairs.find((x) => x.q === quantity);
  if (exact) return exact.p;

  const first = pairs[0];
  if (quantity <= first.q) {
    return Math.round((first.p / first.q) * quantity);
  }

  const last = pairs[pairs.length - 1];
  if (quantity >= last.q) {
    return Math.round((last.p / last.q) * quantity);
  }

  for (let i = 0; i < pairs.length - 1; i++) {
    const left = pairs[i];
    const right = pairs[i + 1];
    if (quantity >= left.q && quantity <= right.q) {
      const span = right.q - left.q;
      if (span <= 0) return left.p;
      const ratio = (quantity - left.q) / span;
      return Math.round(left.p + ratio * (right.p - left.p));
    }
  }

  return last.p;
}

export function ProductOrderBlock({
  productSlug,
  quantities,
  pricesCents,
  productName,
  bullets,
  tiers,
  showPackagePrices = false,
}: ProductOrderBlockProps) {
  const { addItem } = useCart();

  const [tierIndex, setTierIndex] = useState(0);
  const [useIndividual, setUseIndividual] = useState(false);
  const [standardIndex, setStandardIndex] = useState(0);
  const [sliderQuantity, setSliderQuantity] = useState(INDIVIDUAL_MIN);
  const [targetInput, setTargetInput] = useState("");
  const [targetError, setTargetError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const [showBuyBar, setShowBuyBar] = useState(false);

  const currentTier = tiers && tiers.length > 0 ? tiers[tierIndex]! : null;
  const q = currentTier ? currentTier.quantities : quantities;
  const p = currentTier ? currentTier.pricesCents : pricesCents;
  const maxForSlider = currentTier?.sliderMax ?? Math.max(INDIVIDUAL_MAX_DEFAULT, ...q);

  const standardQuantity = q[standardIndex] ?? 100;
  const standardPriceCents = p[standardIndex] ?? 100;

  const individualQuantity = snapQuantity(sliderQuantity, INDIVIDUAL_MIN, maxForSlider);
  const individualPriceCents = getIndividualPriceCents(individualQuantity, q, p);

  const quantity = useIndividual ? individualQuantity : standardQuantity;
  const priceCents = useIndividual ? individualPriceCents : standardPriceCents;

  const displayName = currentTier ? `${productName} (${currentTier.name})` : productName;

  const handleTierChange = useCallback(
    (index: number) => {
      if (!tiers || index === tierIndex) return;
      setTierIndex(index);
      setStandardIndex(0);
      setUseIndividual(false);
      const newQ = tiers[index]!.quantities;
      setSliderQuantity(newQ[0] ?? INDIVIDUAL_MIN);
    },
    [tiers, tierIndex]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSliderQuantity(snapQuantity(Number(e.target.value), INDIVIDUAL_MIN, maxForSlider));
      setUseIndividual(true);
    },
    [maxForSlider]
  );

  const handleStandardSelect = useCallback(
    (index: number) => {
      setStandardIndex(index);
      setUseIndividual(false);
      setSliderQuantity(q[index] ?? INDIVIDUAL_MIN);
    },
    [q]
  );

  const handleAddToCart = useCallback(() => {
    const value = targetInput.trim();
    if (!value) {
      setTargetError("Bitte hier noch einfügen – gib deinen Nutzernamen oder Profil-Link ein.");
      return;
    }
    setTargetError(null);
    addItem({
      productSlug,
      productName: displayName,
      quantity,
      priceCents,
      target: value,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [targetInput, addItem, productSlug, displayName, quantity, priceCents]);

  const effectiveSliderQuantity = useIndividual
    ? individualQuantity
    : snapQuantity(standardQuantity, INDIVIDUAL_MIN, maxForSlider);

  /** Kaufleiste erst zeigen, wenn das Produktmodul aus dem Blickfeld gescrollt ist. */
  useEffect(() => {
    const node = blockRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBuyBar(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("has-mobile-buy-bar", showBuyBar);
    return () => document.body.classList.remove("has-mobile-buy-bar");
  }, [showBuyBar]);

  const scrollToOrderBlock = useCallback(() => {
    document
      .getElementById(PRODUCT_ORDER_ANCHOR_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="product-order-block" ref={blockRef}>
      {bullets && bullets.length > 0 && (
        <div className="product-order-bullets">
          <ul className="product-bullets">
            {bullets.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Stufen (Normal / Premium) */}
      {tiers && tiers.length > 1 && (
        <div className="product-order-row product-tier-row">
          <span className="product-order-label">Variante:</span>
          <div className="product-tier-options" role="group" aria-label="Variante wählen">
            {tiers.map((tier, i) => (
              <label key={tier.id} className="product-tier-option">
                <input
                  type="radio"
                  name="product-tier"
                  value={tier.id}
                  checked={tierIndex === i}
                  onChange={() => handleTierChange(i)}
                  className="product-tier-radio"
                />
                <span className="product-tier-label">{tier.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {/* Bereich 1: Standardmengen */}
      <div className="product-order-row">
        <span className="product-order-label">Standardmengen:</span>
        <div className="product-quantity-options" role="group" aria-label="Standardmenge wählen">
          {q.map((qty, i) => (
            <label key={qty} className="product-quantity-option">
              <input
                type="radio"
                name="quantity-standard"
                value={qty}
                checked={!useIndividual && standardIndex === i}
                onChange={() => handleStandardSelect(i)}
                className="product-quantity-radio"
              />
              <span className="product-quantity-label">
                <span className="product-quantity-amount">{formatQuantity(qty)}</span>
                {showPackagePrices && typeof p[i] === "number" ? (
                  <span className="product-quantity-price">{formatEuroFromCents(p[i])}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Bereich 2: Individuelle Menge (Slider) */}
      <div className="product-order-row product-order-row-individual">
        <label className="product-order-label" htmlFor="product-quantity-slider">
          Individuelle Menge: <span className="product-quantity-value">{formatQuantity(quantity)}</span>
        </label>
        <input
          id="product-quantity-slider"
          type="range"
          min={INDIVIDUAL_MIN}
          max={maxForSlider}
          step={INDIVIDUAL_STEP}
          value={effectiveSliderQuantity}
          onChange={handleSliderChange}
          onPointerDown={() => setUseIndividual(true)}
          className="product-quantity-slider"
          aria-label={`Menge zwischen ${INDIVIDUAL_MIN} und ${maxForSlider} in ${INDIVIDUAL_STEP}er-Schritten`}
          aria-valuemin={INDIVIDUAL_MIN}
          aria-valuemax={maxForSlider}
          aria-valuenow={quantity}
          aria-valuetext={`${formatQuantity(quantity)} ${productName}`}
        />
      </div>

      <div className="product-order-row product-price-row">
        <span className="product-order-label">Preis:</span>
        <span className="product-price">{formatEuroFromCents(priceCents)}</span>
      </div>

      <div className="product-order-row">
        <label htmlFor="product-target" className="product-order-label">
          {getTargetLabel(productSlug)}: <span className="product-input-required" aria-hidden>*</span>
        </label>
        <input
          id="product-target"
          type="text"
          placeholder={getTargetPlaceholder(productSlug)}
          value={targetInput}
          onChange={(e) => {
            setTargetInput(e.target.value);
            if (targetError) setTargetError(null);
          }}
          className={`product-target-input${targetError ? " product-target-input-error" : ""}`}
          aria-describedby={targetError ? "product-target-error product-target-hint" : "product-target-hint"}
          aria-required="true"
          aria-invalid={!!targetError}
        />
        {targetError && (
          <span id="product-target-error" className="product-target-error" role="alert">
            {targetError}
          </span>
        )}
        <span id="product-target-hint" className="product-input-hint">
          {getTargetHint(productSlug)}
        </span>
      </div>
      <button
        type="button"
        className="btn btn-primary product-add-btn"
        onClick={handleAddToCart}
      >
        {added ? "✓ Hinzugefügt" : "In den Warenkorb"}
      </button>
      <div className="product-delivery-note" role="note">
        <span className="product-delivery-note-icon" aria-hidden="true">⏱</span>
        <div className="product-delivery-note-text">
          <strong>Lieferung</strong>
          <p>
            Je nach aktuellem Bestellaufkommen kann die Lieferung etwas später starten.
          </p>
          {isTikTokFollowerProduct(productSlug) && (
            <p>
              TikTok Follower werden langsam und gestaffelt ausgeliefert, damit das Wachstum natürlich und echt wirkt.
            </p>
          )}
        </div>
      </div>
      <div
        className={`product-mobile-buy-bar${showBuyBar ? " is-visible" : ""}`}
        aria-hidden={!showBuyBar}
      >
        <div className="product-mobile-buy-bar-price">
          <span className="product-mobile-buy-bar-amount">{formatEuroFromCents(priceCents)}</span>
          <span className="product-mobile-buy-bar-meta">{formatQuantity(quantity)}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary product-mobile-buy-bar-btn"
          onClick={scrollToOrderBlock}
          tabIndex={showBuyBar ? 0 : -1}
        >
          Paket auswählen
        </button>
      </div>
    </div>
  );
}
