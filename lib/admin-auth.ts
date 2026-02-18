import { createHmac } from "crypto";

const PENDING_COOKIE = "admin_2fa_pending";
const PENDING_TTL_MS = 5 * 60 * 1000; // 5 Minuten

export interface PendingPayload {
  ts: number;
  nonce: string;
  from: string;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64url");
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf-8");
}

export function createPendingToken(from: string, password: string): string {
  const payload: PendingPayload = {
    ts: Date.now(),
    nonce: createHmac("sha256", password + "pending").digest("hex").slice(0, 16),
    from: from.startsWith("/admin") ? from : "/admin",
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadStr);
  const sig = createHmac("sha256", password).update(payloadStr).digest("hex");
  return `${payloadB64}.${sig}`;
}

export function verifyPendingToken(
  token: string,
  password: string
): { ok: true; from: string } | { ok: false } {
  if (!token || !password) return { ok: false };
  const dot = token.indexOf(".");
  if (dot === -1) return { ok: false };
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload: PendingPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64)) as PendingPayload;
  } catch {
    return { ok: false };
  }
  const payloadStr = JSON.stringify(payload);
  const expectedSig = createHmac("sha256", password).update(payloadStr).digest("hex");
  if (sig !== expectedSig) return { ok: false };
  if (Date.now() - payload.ts > PENDING_TTL_MS) return { ok: false };
  return { ok: true, from: payload.from };
}

export function getPendingCookieName(): string {
  return PENDING_COOKIE;
}
