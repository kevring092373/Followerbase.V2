"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrderAction } from "./actions";

const CONFIRM_WORD = "LÖSCHEN";

type Props = { orderNumber: string; label?: string; redirectToOrders?: boolean };

export function DeleteOrderButton({ orderNumber, label = "Löschen", redirectToOrders = true }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openFirst() {
    setStep(1);
    setError(null);
    setConfirmInput("");
  }

  function closeModal() {
    setStep(0);
    setConfirmInput("");
    setError(null);
  }

  function goToSecond() {
    setStep(2);
    setError(null);
  }

  async function handleFinalDelete() {
    if (confirmInput.trim().toUpperCase() !== CONFIRM_WORD) return;
    setLoading(true);
    setError(null);
    const res = await deleteOrderAction(orderNumber);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    closeModal();
    if (redirectToOrders) {
      router.push("/admin/orders");
    }
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={openFirst}
        className="btn btn-secondary admin-order-delete-btn"
        aria-label={`Bestellung ${orderNumber} löschen`}
      >
        {label}
      </button>

      {step >= 1 && (
        <div className="admin-order-delete-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-order-title">
          <div className="admin-order-delete-modal card">
            <h2 id="delete-order-title" className="admin-order-delete-title">
              Bestellung löschen
            </h2>

            {step === 1 && (
              <>
                <p className="admin-order-delete-text">
                  Bestellung <strong>{orderNumber}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="admin-order-delete-actions">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Abbrechen
                  </button>
                  <button type="button" onClick={goToSecond} className="btn btn-primary">
                    Weiter
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="admin-order-delete-text">
                  Zur Bestätigung bitte <strong>{CONFIRM_WORD}</strong> eingeben.
                </p>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="admin-order-delete-input"
                  placeholder={CONFIRM_WORD}
                  autoComplete="off"
                  disabled={loading}
                  aria-label={`${CONFIRM_WORD} eingeben`}
                />
                {error && <p className="admin-order-delete-error" role="alert">{error}</p>}
                <div className="admin-order-delete-actions">
                  <button type="button" onClick={closeModal} className="btn btn-secondary" disabled={loading}>
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalDelete}
                    className="btn btn-primary"
                    disabled={confirmInput.trim().toUpperCase() !== CONFIRM_WORD || loading}
                  >
                    {loading ? "Wird gelöscht …" : "Endgültig löschen"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
