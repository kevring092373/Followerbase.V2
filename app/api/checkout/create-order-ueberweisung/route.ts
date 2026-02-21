import { NextRequest, NextResponse } from "next/server";
import { createOrderForUeberweisung } from "@/lib/orders-data";
import type { OrderItem } from "@/lib/orders";
import type { PendingCheckoutCustomer } from "@/lib/orders-data";
import { sendOrderConfirmationEmail, sendOrderNotificationToOwner } from "@/lib/email-order-confirmation";

/**
 * Bestellung per Überweisung anlegen. Gibt Bestellnummer zurück.
 * Verwendungszweck = Bestellnummer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amountCents = Number(body.amountCents);
    const items = Array.isArray(body.items) ? (body.items as OrderItem[]) : [];
    const sellerNote = typeof body.sellerNote === "string" ? body.sellerNote : undefined;
    const customer = body.customer as PendingCheckoutCustomer | undefined;

    if (!customer?.email?.trim()) {
      return NextResponse.json({ error: "E-Mail ist erforderlich." }, { status: 400 });
    }
    if (!customer.email.trim().includes("@")) {
      return NextResponse.json(
        { error: "Die E-Mail-Adresse muss ein @ enthalten." },
        { status: 400 }
      );
    }

    const totalCents =
      amountCents > 0 && Number.isFinite(amountCents)
        ? amountCents
        : items.reduce((sum, i) => sum + i.priceCents, 0);
    if (totalCents <= 0) {
      return NextResponse.json({ error: "Ungültiger Betrag." }, { status: 400 });
    }

    const order = await createOrderForUeberweisung(
      {
        email: customer.email.trim(),
        name: customer.name ?? undefined,
        phone: customer.phone ?? undefined,
        addressLine1: customer.addressLine1 ?? undefined,
        addressLine2: customer.addressLine2 ?? undefined,
        city: customer.city ?? undefined,
        postalCode: customer.postalCode ?? undefined,
        country: customer.country ?? undefined,
      },
      items,
      totalCents,
      sellerNote
    );

    sendOrderConfirmationEmail(order).catch(() => {});
    sendOrderNotificationToOwner(order).catch(() => {});

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
