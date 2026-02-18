import { NextRequest, NextResponse } from "next/server";
import { createOrGetCustomer } from "@/lib/customers-data";

/**
 * Temporär: Kundendaten aus dem Checkout-Formular direkt in Supabase speichern (ohne PayPal).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json({ error: "E-Mail ist erforderlich." }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Die E-Mail-Adresse muss ein @ enthalten." },
        { status: 400 }
      );
    }

    const customer = await createOrGetCustomer({
      email,
      name: typeof body.name === "string" ? body.name.trim() || undefined : undefined,
      phone: typeof body.phone === "string" ? body.phone.trim() || undefined : undefined,
      addressLine1: typeof body.addressLine1 === "string" ? body.addressLine1.trim() || undefined : undefined,
      addressLine2: typeof body.addressLine2 === "string" ? body.addressLine2.trim() || undefined : undefined,
      city: typeof body.city === "string" ? body.city.trim() || undefined : undefined,
      postalCode: typeof body.postalCode === "string" ? body.postalCode.trim() || undefined : undefined,
      country: typeof body.country === "string" ? body.country.trim() || undefined : undefined,
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Supabase nicht konfiguriert oder Speichern fehlgeschlagen." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: customer.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
