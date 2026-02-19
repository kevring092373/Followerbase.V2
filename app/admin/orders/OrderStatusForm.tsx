"use client";

import { useFormState } from "react-dom";
import { getStatusLabel, ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { updateOrderStatusAction, type UpdateOrderStatusResult } from "./actions";

type Props = {
  orderNumber: string;
  currentStatus: OrderStatus;
  currentRemarks: string;
};

export function OrderStatusForm({ orderNumber, currentStatus, currentRemarks }: Props) {
  const [state, formAction] = useFormState<UpdateOrderStatusResult | null, FormData>(
    updateOrderStatusAction,
    null
  );

  return (
    <form action={formAction} className="admin-order-form">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <div className="admin-order-form-row">
        <label htmlFor="order-status">Status</label>
        <select
          id="order-status"
          name="status"
          defaultValue={currentStatus}
          className="admin-order-select"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-order-form-row">
        <label htmlFor="order-remarks">Bemerkungen</label>
        <textarea
          id="order-remarks"
          name="remarks"
          defaultValue={currentRemarks}
          rows={3}
          className="admin-order-textarea"
          placeholder="Interne Notizen (optional)"
        />
      </div>
      {state?.error && (
        <p className="admin-form-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary">
        Speichern
      </button>
    </form>
  );
}
