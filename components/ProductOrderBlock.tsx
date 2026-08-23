"use client";

import { useState, useCallback } from "react";
import { useCart } from "@/context/CartContext";
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

/** Individuelle Menge: Slider-Wert (0–100) in Menge umrechnen (Schritt 50, min/max aus Parametern) */
function sliderToQuantity(sliderValue: number, min: number, max: number): number {
  const range = max - min;
  const raw = min + (sliderValue / 100) * range;
  const qty = Math.round(raw / INDIVIDUAL_STEP) * INDIVIDUAL_STEP;
  return Math.min(max, Math.max(min, qty));
}

/** Menge in Slider-Wert (0–100) umrechnen */
function quantityToSlider(quantity: number, min: number, max: number): number {
  const range = max - min;
  return ((quantity - min) / range) * 100;
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
  const [sliderValue, setSliderValue] = useState(0);
  const [targetInput, setTargetInput] = useState("");
  const [targetError, setTargetError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const currentTier = tiers && tiers.length > 0 ? tiers[tierIndex]! : null;
  const q = currentTier ? currentTier.quantities : quantities;
  const p = currentTier ? currentTier.pricesCents : pricesCents;
  const maxForSlider = currentTier?.sliderMax ?? Math.max(INDIVIDUAL_MAX_DEFAULT, ...q);

  const standardQuantity = q[standardIndex] ?? 100;
  const standardPriceCents = p[standardIndex] ?? 100;

  const individualQuantity = sliderToQuantity(sliderValue, INDIVIDUAL_MIN, maxForSlider);
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
      const newMax = tiers[index]!.sliderMax ?? Math.max(...newQ);
      setSliderValue(quantityToSlider(newQ[0] ?? 100, INDIVIDUAL_MIN, newMax));
    },
    [tiers, tierIndex]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSliderValue(Number(e.target.value));
      setUseIndividual(true);
    },
    []
  );

  const handleStandardSelect = useCallback(
    (index: number) => {
      setStandardIndex(index);
      setUseIndividual(false);
      setSliderValue(quantityToSlider(q[index] ?? 100, INDIVIDUAL_MIN, maxForSlider));
    },
    [q, maxForSlider]
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

  const effectiveSliderValue = useIndividual ? sliderValue : quantityToSlider(standardQuantity, INDIVIDUAL_MIN, maxForSlider);

  return (
    <div className="product-order-block">
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
                <span className="product-quantity-amount">{qty.toLocaleString("de-DE")}</span>
                {showPackagePrices && typeof p[i] === "number" ? (
                  <span className="product-quantity-price">
                    {(p[i] / 100).toFixed(2).replace(".", ",")} €
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Bereich 2: Individuelle Menge (Slider) */}
      <div className="product-order-row product-order-row-individual">
        <label className="product-order-label">
          Individuelle Menge: <span className="product-quantity-value">{quantity}</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={effectiveSliderValue}
          onChange={handleSliderChange}
          onPointerDown={() => setUseIndividual(true)}
          className="product-quantity-slider"
          aria-label={`Menge zwischen ${INDIVIDUAL_MIN} und ${maxForSlider} in 50er-Schritten`}
        />
      </div>

      <div className="product-order-row product-price-row">
        <span className="product-order-label">Preis:</span>
        <span className="product-price">{(priceCents / 100).toFixed(2)} €</span>
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
    </div>
  );
}
