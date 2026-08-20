/**
 * Viva Wallet (Kreditkarte) – Server-API.
 * Create Order (Redirect Checkout), Verify Transaction.
 * Umgebungsvariablen: VIVA_CLIENT_ID, VIVA_CLIENT_SECRET; optional VIVA_DEMO=true, VIVA_SOURCE_CODE.
 * Standard-Source für followerbase.de: 7889.
 *
 * OrderCodes sind 16-stellig und müssen als String behandelt werden – sonst gehen
 * Stellen über Number.MAX_SAFE_INTEGER verloren und die Zahlungsseite findet die Order nicht.
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

export function extractVivaId(raw: string, keys: string[]): string | null {
  for (const key of keys) {
    const re = new RegExp(`"${key}"\\s*:\\s*(?:"(\\d+)"|(\\d+))`, "i");
    const match = raw.match(re);
    const id = match?.[1] || match?.[2];
    if (id) return id;
  }
  return null;
}

export function asVivaOrderCode(value: unknown): string {
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return value.trim();
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value).toString();
  }
  return "";
}

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
    console.error("[viva] OAuth fehlgeschlagen:", res.status, text.slice(0, 300));
    throw new Error("Viva-Anmeldung fehlgeschlagen. Bitte Zugangsdaten und Umgebung (Live/Demo) prüfen.");
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface VivaCustomer {
  email: string;
  fullName?: string;
  phone?: string;
  requestLang?: string;
}

/**
 * Payment Order bei Viva anlegen. amountCents = Betrag in Cent (z. B. 1050 = 10,50 €).
 * Gibt die orderCode als String zurück (16-stellig, nicht als Number speichern).
 */
export async function createVivaOrder(
  amountCents: number,
  customerTrns: string,
  customer?: VivaCustomer
): Promise<string> {
  const token = await getAccessToken();
  const sourceCode = process.env.VIVA_SOURCE_CODE?.trim() || "7889";
  const customerPayload = customer
    ? {
        email: customer.email,
        fullName: customer.fullName ?? "",
        requestLang: customer.requestLang ?? "de-DE",
        ...(customer.phone ? { phone: customer.phone, countryCode: "DE" } : { countryCode: "DE" }),
      }
    : undefined;
  const body: Record<string, unknown> = {
    amount: amountCents,
    customerTrns: customerTrns.slice(0, 500),
    requestLang: "de-DE",
    sourceCode,
    ...(customerPayload ? { customer: customerPayload } : {}),
  };

  const res = await fetch(`${API_BASE}/checkout/v2/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) {
    console.error("[viva] Create Order fehlgeschlagen:", res.status, raw.slice(0, 500));
    throw new Error("Kartenzahlung konnte bei Viva nicht gestartet werden. Bitte später erneut versuchen.");
  }

  const orderCode = extractVivaId(raw, ["orderCode", "OrderCode"]);
  if (!orderCode) {
    console.error("[viva] Keine orderCode in Antwort:", raw.slice(0, 500));
    throw new Error("Viva hat keine Bestellreferenz zurückgegeben.");
  }
  return orderCode;
}

/** URL der Viva-Zahlungsseite (Kunde wird dorthin weitergeleitet). */
export function getVivaPaymentPageUrl(orderCode: string): string {
  return `${CHECKOUT_BASE}/web/checkout?ref=${encodeURIComponent(orderCode)}`;
}

export interface VivaTransaction {
  orderCode: string;
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
  const raw = await res.text();
  if (!res.ok) {
    console.error("[viva] Transaction-Abfrage fehlgeschlagen:", res.status, raw.slice(0, 300));
    return null;
  }
  const orderCode = extractVivaId(raw, ["orderCode", "OrderCode"]);
  if (!orderCode) return null;

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  const statusId =
    (typeof parsed.statusId === "string" && parsed.statusId) ||
    (typeof parsed.StatusId === "string" && parsed.StatusId) ||
    "";
  const amount = typeof parsed.amount === "number" ? parsed.amount : 0;

  return {
    orderCode,
    statusId,
    amount,
    email: typeof parsed.email === "string" ? parsed.email : undefined,
    fullName: typeof parsed.fullName === "string" ? parsed.fullName : undefined,
  };
}

/** statusId "F" = Full (erfolgreich bezahlt). */
export function isTransactionSuccessful(t: VivaTransaction): boolean {
  return t.statusId === "F";
}
