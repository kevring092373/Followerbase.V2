/**
 * PayPal Server-API: OAuth, Order erstellen, Capture.
 * Umgebungsvariablen: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET.
 * Für Sandbox: PAYPAL_SANDBOX=true (nutzt api-m.sandbox.paypal.com).
 */

const PAYPAL_API_BASE = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("NEXT_PUBLIC_PAYPAL_CLIENT_ID und PAYPAL_CLIENT_SECRET müssen in .env.local gesetzt sein.");
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal OAuth fehlgeschlagen: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface PayPalOrderItem {
  name: string;
  quantity: number;
  priceCents: number;
  sku?: string;
}

/**
 * PayPal-Checkout-Order anlegen. Gesamtbetrag = exakt der Shop-Summe (amountEur).
 * Ohne Artikelaufteilung, damit keine Rundungsdifferenzen entstehen (PayPal zeigte sonst teils höheren Betrag).
 */
export async function createPayPalOrder(
  amountEur: string,
  _items: PayPalOrderItem[] = []
): Promise<string> {
  const token = await getAccessToken();
  const currency = "EUR";

  const body: Record<string, unknown> = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amountEur,
        },
        description: "Bestellung Followerbase",
      },
    ],
  };

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal Create Order fehlgeschlagen: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * PayPal-Order nach Kunden-Freigabe erfassen (Capture).
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal Capture fehlgeschlagen: ${res.status} ${text}`);
  }
}
