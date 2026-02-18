"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { lookupOrder } from "./actions";
import {
  ORDER_STATUSES,
  getStatusLabel,
  type Order,
} from "@/lib/orders";

const TRACKING_STATUSES = ORDER_STATUSES.filter((s) => s !== "pending_payment");

function TrackingTimeline({ order }: { order: Order }) {
  const currentIndex =
    order.status === "pending_payment" ? -1 : TRACKING_STATUSES.indexOf(order.status);
  const steps = currentIndex < 0 ? [] : TRACKING_STATUSES;

  return (
    <div className="tracking-timeline">
      {steps.map((status, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        return (
          <div
            key={status}
            className={`tracking-timeline-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""} ${isPending ? "pending" : ""}`}
          >
            <div className="tracking-timeline-marker">
              {isDone ? (
                <span className="tracking-timeline-icon" aria-hidden>✓</span>
              ) : (
                <span className="tracking-timeline-dot" />
              )}
            </div>
            <div className="tracking-timeline-content">
              <span className="tracking-timeline-label">{getStatusLabel(status)}</span>
              {isCurrent && (
                <span className="tracking-timeline-badge">Aktuell</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    { ok: true; order: Order } | { ok: false; error: string } | null
  >(null);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success) setOrderNumber(success);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await lookupOrder(orderNumber);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tracking-page">
      <h1 className="tracking-title">Bestellung verfolgen</h1>
      <p className="tracking-intro">
        Gib deine Bestellnummer ein, um den aktuellen Stand deiner Bestellung zu sehen.
      </p>

      <form onSubmit={handleSubmit} className="tracking-form card">
        <label htmlFor="tracking-order-number" className="tracking-form-label">
          Bestellnummer
        </label>
        <div className="tracking-form-row">
          <input
            id="tracking-order-number"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="z. B. FC-2025-0001"
            className="tracking-form-input"
            autoComplete="off"
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary tracking-form-btn" disabled={loading}>
            {loading ? "Wird gesucht …" : "Status prüfen"}
          </button>
        </div>
      </form>

      {result && !result.ok && (
        <div className="tracking-error card" role="alert">
          <p className="tracking-error-text">{result.error}</p>
        </div>
      )}

      {result && result.ok && (
        <div className="tracking-result card">
          <h2 className="tracking-result-heading">Bestellung {result.order.orderNumber}</h2>
          {result.order.status === "pending_payment" && (
            <p className="tracking-pending-note">Zahlung ausstehend – bitte schließe die Zahlung ab.</p>
          )}
          <TrackingTimeline order={result.order} />
          {result.order.remarks && (
            <div className="tracking-remarks">
              <h3 className="tracking-remarks-heading">Bemerkungen</h3>
              <p className="tracking-remarks-text">{result.order.remarks}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BestellungVerfolgenPage() {
  return (
    <Suspense fallback={
      <div className="tracking-page">
        <h1 className="tracking-title">Bestellung verfolgen</h1>
        <p className="tracking-intro">Laden …</p>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
