import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal-server";
import { addPendingCheckout } from "@/lib/orders-data";
import type { OrderItem } from "@/lib/orders";
import type { PendingCheckoutCustomer } from "@/lib/orders-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amountCents = Number(body.amountCents);
    const items = Array.isArray(body.items) ? (body.items as OrderItem[]) : [];
    const sellerNote = typeof body.sellerNote === "string" ? body.sellerNote : undefined;
    const customer = body.customer as PendingCheckoutCustomer | undefined;

    if (customer?.email?.trim() && !customer.email.trim().includes("@")) {
      return NextResponse.json(
        { error: "Die E-Mail-Adresse muss ein @ enthalten." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: "Ungültiger Betrag" }, { status: 400 });
    }

    const amountEur = (amountCents / 100).toFixed(2);
    const paypalItems = items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      priceCents: i.priceCents,
      sku: i.productSlug,
    }));
    const paypalOrderId = await createPayPalOrder(amountEur, paypalItems);
    await addPendingCheckout(paypalOrderId, items, amountCents, sellerNote, customer);

    return NextResponse.json({ paypalOrderId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
