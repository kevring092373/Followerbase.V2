"use client";

import { useState, useCallback } from "react";
import { useCart } from "@/context/CartContext";

const INDIVIDUAL_MIN = 100;
const INDIVIDUAL_MAX = 1000;
const INDIVIDUAL_STEP = 50;

type ProductOrderBlockProps = {
  productSlug: string;
  quantities: number[];
  pricesCents: number[];
  productName: string;
  /** Kurzbeschreibung (Bulletpoints), wird oben im Block angezeigt */
  bullets?: string[];
};

/** Individuelle Menge: Slider-Wert (0–100) in Menge (50er-Schritte) umrechnen */
function sliderToQuantity(sliderValue: number): number {
  const range = INDIVIDUAL_MAX - INDIVIDUAL_MIN;
  const raw = INDIVIDUAL_MIN + (sliderValue / 100) * range;
  const qty = Math.round(raw / INDIVIDUAL_STEP) * INDIVIDUAL_STEP;
  return Math.min(INDIVIDUAL_MAX, Math.max(INDIVIDUAL_MIN, qty));
}

/** Menge in Slider-Wert (0–100) umrechnen */
function quantityToSlider(quantity: number): number {
  const range = INDIVIDUAL_MAX - INDIVIDUAL_MIN;
  return ((quantity - INDIVIDUAL_MIN) / range) * 100;
}

/** Preis für individuelle Menge (linear zwischen erster und letzter Standard-Preisstufe) */
function getIndividualPriceCents(quantity: number, quantities: number[], pricesCents: number[]): number {
  if (quantities.length === 0 || pricesCents.length === 0) return quantity; // Fallback: 1 Cent pro Einheit
  const qMin = quantities[0];
  const qMax = quantities[quantities.length - 1];
  const pMin = pricesCents[0];
  const pMax = pricesCents[pricesCents.length - 1];
  if (quantity <= qMin) return pMin;
  if (quantity >= qMax) return Math.round((pMax / qMax) * quantity);
  const ratio = (quantity - qMin) / (qMax - qMin);
  return Math.round(pMin + ratio * (pMax - pMin));
}

export function ProductOrderBlock({
  productSlug,
  quantities,
  pricesCents,
  productName,
  bullets,
}: ProductOrderBlockProps) {
  const { addItem } = useCart();
  const [useIndividual, setUseIndividual] = useState(false);
  const [standardIndex, setStandardIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(quantityToSlider(quantities[0] ?? 100));
  const [targetInput, setTargetInput] = useState("");
  const [targetError, setTargetError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const standardQuantity = quantities[standardIndex] ?? 100;
  const standardPriceCents = pricesCents[standardIndex] ?? 100;

  const individualQuantity = sliderToQuantity(sliderValue);
  const individualPriceCents = getIndividualPriceCents(individualQuantity, quantities, pricesCents);

  const quantity = useIndividual ? individualQuantity : standardQuantity;
  const priceCents = useIndividual ? individualPriceCents : standardPriceCents;

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value));
    setUseIndividual(true);
  }, []);

  const handleStandardSelect = useCallback((index: number) => {
    setStandardIndex(index);
    setUseIndividual(false);
    setSliderValue(quantityToSlider(quantities[index] ?? 100));
  }, [quantities]);

  const handleAddToCart = useCallback(() => {
    const value = targetInput.trim();
    if (!value) {
      setTargetError("Bitte hier noch einfügen – gib deinen Nutzernamen oder Profil-Link ein.");
      return;
    }
    setTargetError(null);
    addItem({
      productSlug,
      productName,
      quantity,
      priceCents,
      target: value,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [targetInput, addItem, productSlug, productName, quantity, priceCents]);

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
      {/* Bereich 1: Standardmengen */}
      <div className="product-order-row">
        <span className="product-order-label">Standardmengen</span>
        <div className="product-quantity-options" role="group" aria-label="Standardmenge wählen">
          {quantities.map((qty, i) => (
            <label key={qty} className="product-quantity-option">
              <input
                type="radio"
                name="quantity-standard"
                value={qty}
                checked={!useIndividual && standardIndex === i}
                onChange={() => handleStandardSelect(i)}
                className="product-quantity-radio"
              />
              <span className="product-quantity-label">{qty}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bereich 2: Individuelle Menge (Slider, 50er-Schritte, flüssig) */}
      <div className="product-order-row product-order-row-individual">
        <label className="product-order-label">
          Individuelle Menge <span className="product-quantity-value">{quantity}</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={useIndividual ? sliderValue : quantityToSlider(standardQuantity)}
          onChange={handleSliderChange}
          onPointerDown={() => setUseIndividual(true)}
          className="product-quantity-slider"
          aria-label={`Menge zwischen ${INDIVIDUAL_MIN} und ${INDIVIDUAL_MAX} in 50er-Schritten`}
        />
      </div>

      <div className="product-order-row product-price-row">
        <span className="product-order-label">Preis</span>
        <span className="product-price">{(priceCents / 100).toFixed(2)} €</span>
      </div>

      <div className="product-order-row">
        <label htmlFor="product-target" className="product-order-label">
          Link / Nutzername <span className="product-input-required" aria-hidden>*</span>
        </label>
        <input
          id="product-target"
          type="text"
          placeholder="z. B. @username oder Profil-Link"
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
          Gib hier den Nutzernamen oder den Link zu deinem Profil ein. (Pflichtfeld)
        </span>
      </div>
      <button
        type="button"
        className="btn btn-primary product-add-btn"
        onClick={handleAddToCart}
      >
        {added ? "✓ Hinzugefügt" : "In den Warenkorb"}
      </button>
    </div>
  );
}
