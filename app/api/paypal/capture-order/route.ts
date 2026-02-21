import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal-server";
import {
  getPendingByPaypalOrderId,
  createOrderFromPendingAndRemovePending,
  addOrderError,
} from "@/lib/orders-data";
import { sendOrderConfirmationEmail, sendOrderNotificationToOwner } from "@/lib/email-order-confirmation";

export async function POST(request: NextRequest) {
  let paypalOrderId: string | null = null;
  let pending: Awaited<ReturnType<typeof getPendingByPaypalOrderId>> = null;

  try {
    const body = await request.json();
    paypalOrderId = typeof body.paypalOrderId === "string" ? body.paypalOrderId.trim() : null;

    if (!paypalOrderId) {
      return NextResponse.json({ error: "paypalOrderId fehlt" }, { status: 400 });
    }

    pending = await getPendingByPaypalOrderId(paypalOrderId);
    if (!pending) {
      await addOrderError("Vorgang nicht gefunden (kein passender Warenkorb-Vorgang).", {
        paypalOrderId,
      });
      return NextResponse.json({ error: "Vorgang nicht gefunden" }, { status: 404 });
    }

    await capturePayPalOrder(paypalOrderId);
    const order = await createOrderFromPendingAndRemovePending(paypalOrderId);

    if (!order) {
      await addOrderError("Bestellung konnte nach Capture nicht angelegt werden.", {
        paypalOrderId,
        totalCents: pending.totalCents,
      });
      return NextResponse.json({ error: "Bestellung konnte nicht angelegt werden" }, { status: 500 });
    }

    // Bestellbestätigung per E-Mail an den Kunden; Benachrichtigung an info@followerbase.de
    sendOrderConfirmationEmail(order).catch(() => {});
    sendOrderNotificationToOwner(order).catch(() => {});

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    if (paypalOrderId) {
      await addOrderError(message, {
        paypalOrderId,
        totalCents: pending?.totalCents,
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
