/**
 * Viva Wallet (Kreditkarte) – Server-API.
 * Create Order (Redirect Checkout), Verify Transaction.
 * Umgebungsvariablen: VIVA_CLIENT_ID, VIVA_CLIENT_SECRET; optional VIVA_DEMO=true, VIVA_SOURCE_CODE.
 */

const DEMO = process.env.VIVA_DEMO === "true";
const API_BASE = DEMO
  ? "https://demo-api.vivapayments.com"
  : "https://api.vivapayments.com";
const ACCOUNTS_BASE = DEMO
  ? "https://demo-accounts.vivapayments.com"
  : "https://accounts.vivapayments.com";
const CHECKOUT_BASE = DEMO
  ? "https://demo.vivapayments.com"
  : "https://www.vivapayments.com";

const SCOPE = "urn:viva:payments:core:api:redirectcheckout";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.VIVA_CLIENT_ID;
  const clientSecret = process.env.VIVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "VIVA_CLIENT_ID und VIVA_CLIENT_SECRET müssen in .env.local gesetzt sein."
    );
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${ACCOUNTS_BASE}/connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: SCOPE,
    }).toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Viva OAuth fehlgeschlagen: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface VivaCustomer {
  email: string;
  fullName?: string;
  requestLang?: string;
}

/**
 * Payment Order bei Viva anlegen. amountCents = Betrag in Cent (z. B. 1050 = 10,50 €).
 * Gibt die orderCode (number) zurück.
 */
export async function createVivaOrder(
  amountCents: number,
  customerTrns: string,
  customer?: VivaCustomer
): Promise<number> {
  const token = await getAccessToken();
  const sourceCode = process.env.VIVA_SOURCE_CODE?.trim();
  const body: Record<string, unknown> = {
    amount: amountCents,
    customerTrns: customerTrns.slice(0, 500),
    requestLang: "de-DE",
    ...(customer && {
      customer: {
        email: customer.email,
        fullName: customer.fullName ?? "",
        requestLang: customer.requestLang ?? "de-DE",
      },
    }),
    ...(sourceCode ? { sourceCode } : {}),
  };

  const res = await fetch(`${API_BASE}/checkout/v2/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Viva Create Order fehlgeschlagen: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { orderCode?: number; OrderCode?: number };
  const orderCode = data.orderCode ?? data.OrderCode;
  if (orderCode == null || typeof orderCode !== "number") {
    throw new Error("Viva hat keine orderCode zurückgegeben.");
  }
  return orderCode;
}

/** URL der Viva-Zahlungsseite (Kunde wird dorthin weitergeleitet). */
export function getVivaPaymentPageUrl(orderCode: number): string {
  return `${CHECKOUT_BASE}/web/checkout?ref=${orderCode}`;
}

export interface VivaTransaction {
  orderCode: number;
  statusId: string;
  amount: number;
  email?: string;
  fullName?: string;
}

/** Transaction abfragen (nach Success-Redirect mit Parameter t = transactionId). */
export async function getVivaTransaction(
  transactionId: string
): Promise<VivaTransaction | null> {
  const token = await getAccessToken();
  const res = await fetch(
    `${API_BASE}/checkout/v2/transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    orderCode?: number;
    OrderCode?: number;
    statusId?: string;
    amount?: number;
    email?: string;
    fullName?: string;
  };
  const orderCode = data.orderCode ?? data.OrderCode;
  const statusId = data.statusId ?? "";
  if (orderCode == null) return null;
  return {
    orderCode: Number(orderCode),
    statusId,
    amount: typeof data.amount === "number" ? data.amount : 0,
    email: data.email,
    fullName: data.fullName,
  };
}

/** statusId "F" = Full (erfolgreich bezahlt). */
export function isTransactionSuccessful(t: VivaTransaction): boolean {
  return t.statusId === "F";
}
