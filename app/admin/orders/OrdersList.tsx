"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getStatusLabel, type Order, type OrderStatus } from "@/lib/orders";

const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "eingegangen",
  "gestartet",
  "in_ausfuehrung",
  "abgeschlossen",
];

const STATUS_FILTER_ALL = "__all__";

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function statusColorClass(status: string): string {
  const map: Record<string, string> = {
    pending_payment: "admin-order-status--pending",
    eingegangen: "admin-order-status--eingegangen",
    gestartet: "admin-order-status--gestartet",
    in_ausfuehrung: "admin-order-status--ausfuehrung",
    abgeschlossen: "admin-order-status--abgeschlossen",
  };
  return map[status] ?? "admin-order-status--default";
}

type Props = { orders: Order[] };

export function OrdersList({ orders }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_FILTER_ALL);

  const filteredOrders = useMemo(() => {
    if (statusFilter === STATUS_FILTER_ALL) return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <section className="admin-orders-section">
      <div className="admin-orders-list-header">
        <h2 className="admin-orders-col-heading">Bezahlte Bestellungen</h2>
        <label className="admin-orders-filter-label">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-orders-filter-select"
            aria-label="Bestellungen nach Status filtern"
          >
            <option value={STATUS_FILTER_ALL}>Alle</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {getStatusLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: "1.25rem" }}>
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
            {orders.length === 0
              ? "Noch keine Bestellungen."
              : "Keine Bestellungen mit diesem Status."}
          </p>
        </div>
      ) : (
        <ul className="admin-orders-compact-list">
          {filteredOrders.map((order) => (
            <li key={order.orderNumber}>
              <Link
                href={`/admin/orders/${encodeURIComponent(order.orderNumber)}`}
                className="admin-order-row card"
              >
                <span className="admin-order-row-number">{order.orderNumber}</span>
                <span className="admin-order-row-date">{formatDateShort(order.createdAt)}</span>
                <span
                  className={`admin-order-status-badge admin-order-status-badge--compact ${statusColorClass(order.status)}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
