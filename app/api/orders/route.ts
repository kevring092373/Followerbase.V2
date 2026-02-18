import { NextResponse } from "next/server";
import type { Order } from "@/lib/types";

/**
 * POST /api/orders – neue Bestellung anlegen (Checkout).
 * Body: { items, customerEmail, customerNote? }
 * Später: Validierung, Speicherung, ggf. Webhook an dein Ausführungssystem.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Platzhalter: keine echte Speicherung
    const order: Order = {
      id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      items: body.items ?? [],
      totalCents: body.totalCents ?? 0,
      customerEmail: body.customerEmail ?? "",
      customerNote: body.customerNote,
    };
    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/orders – Bestellungen abrufen (Admin).
 * Später: Auth, Filter, Pagination, aus DB.
 */
export async function GET() {
  const orders: Order[] = [];
  return NextResponse.json(orders);
}
