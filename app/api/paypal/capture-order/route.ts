import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal-server";
import {
  getPendingByPaypalOrderId,
  createOrderFromPendingAndRemovePending,
  addOrderError,
} from "@/lib/orders-data";
import { getOrderByPaypalOrderIdSupabase } from "@/lib/orders-supabase";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendOrderNotificationToOwner } from "@/lib/email-order-confirmation";

async function sendOrderEmails(order: NonNullable<Awaited<ReturnType<typeof createOrderFromPendingAndRemovePending>>>) {
  const customerOk = await sendOrderConfirmationEmail(order);
  if (!customerOk) {
    console.error("[capture-order] Kunden-Mail fehlgeschlagen für", order.orderNumber);
  }
  try {
    await sendOrderNotificationToOwner(order);
  } catch (e) {
    console.error("[capture-order] Owner-Mail fehlgeschlagen für", order.orderNumber, e);
  }
}

export async function POST(request: NextRequest) {
  let paypalOrderId: string | null = null;
  let pending: Awaited<ReturnType<typeof getPendingByPaypalOrderId>> = null;

  try {
    const body = await request.json();
    paypalOrderId = typeof body.paypalOrderId === "string" ? body.paypalOrderId.trim() : null;

    if (!paypalOrderId) {
      return NextResponse.json({ error: "paypalOrderId fehlt" }, { status: 400 });
    }

    // Idempotenz: Order existiert schon (z. B. Retry nach Teilerfolg)
    if (isSupabaseConfigured()) {
      const existing = await getOrderByPaypalOrderIdSupabase(paypalOrderId);
      if (existing) {
        await sendOrderEmails(existing);
        return NextResponse.json({ orderNumber: existing.orderNumber });
      }
    }

    pending = await getPendingByPaypalOrderId(paypalOrderId);
    if (!pending) {
      // Nach Capture ohne Pending: vielleicht Order schon angelegt
      if (isSupabaseConfigured()) {
        const existing = await getOrderByPaypalOrderIdSupabase(paypalOrderId);
        if (existing) {
          await sendOrderEmails(existing);
          return NextResponse.json({ orderNumber: existing.orderNumber });
        }
      }
      await addOrderError("Vorgang nicht gefunden (kein passender Warenkorb-Vorgang).", {
        paypalOrderId,
      });
      return NextResponse.json(
        {
          error:
            "Vorgang nicht gefunden. Falls PayPal die Zahlung abgebucht hat, melde dich bitte mit der PayPal-Transaktions-ID beim Support.",
        },
        { status: 404 }
      );
    }

    await capturePayPalOrder(paypalOrderId);

    let order = await createOrderFromPendingAndRemovePending(paypalOrderId);

    // Kurzer Retry falls Insert kurz fehlschlägt (Race/Unique)
    if (!order) {
      for (let i = 0; i < 3 && !order; i++) {
        await new Promise((r) => setTimeout(r, 150 * (i + 1)));
        order = await createOrderFromPendingAndRemovePending(paypalOrderId);
        if (!order && isSupabaseConfigured()) {
          order = await getOrderByPaypalOrderIdSupabase(paypalOrderId);
        }
      }
    }

    if (!order) {
      await addOrderError("Bestellung konnte nach Capture nicht angelegt werden.", {
        paypalOrderId,
        totalCents: pending.totalCents,
      });
      return NextResponse.json(
        {
          error:
            "Die Zahlung war erfolgreich, aber die Bestellung konnte nicht automatisch angelegt werden. Bitte melde dich mit deiner PayPal-Transaktions-ID beim Support – wir helfen sofort.",
          paymentCaptured: true,
        },
        { status: 500 }
      );
    }

    await sendOrderEmails(order);

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    if (paypalOrderId) {
      // Nach Fehler ggf. trotzdem schon Order vorhanden
      if (isSupabaseConfigured()) {
        const existing = await getOrderByPaypalOrderIdSupabase(paypalOrderId);
        if (existing) {
          await sendOrderEmails(existing);
          return NextResponse.json({ orderNumber: existing.orderNumber });
        }
      }
      await addOrderError(message, {
        paypalOrderId,
        totalCents: pending?.totalCents,
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
