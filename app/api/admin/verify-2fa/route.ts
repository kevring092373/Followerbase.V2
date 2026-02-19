import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { verify } from "otplib";
import { verifyPendingToken, getPendingCookieName } from "@/lib/admin-auth";

const ADMIN_COOKIE = "admin_session";
const ADMIN_SALT = "followerbase-admin-v1";

function tokenForPassword(password: string): string {
  return createHash("sha256").update(password + ADMIN_SALT).digest("hex");
}

export async function POST(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const totpSecret = process.env.ADMIN_TOTP_SECRET?.trim();

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Nicht konfiguriert." }, { status: 503 });
  }
  if (!totpSecret) {
    return NextResponse.json({ error: "2FA ist nicht aktiviert." }, { status: 503 });
  }

  const pendingCookie = request.cookies.get(getPendingCookieName())?.value;
  const verified = verifyPendingToken(pendingCookie ?? "", password);
  if (!verified.ok) {
    const res = NextResponse.json({ error: "Bitte zuerst mit Passwort anmelden oder Session abgelaufen." }, { status: 401 });
    res.cookies.set(getPendingCookieName(), "", { path: "/", maxAge: 0 });
    return res;
  }

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.replace(/\s/g, "") : "";
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Bitte den 6-stelligen Code aus deiner Authenticator-App eingeben." }, { status: 400 });
  }

  let valid: boolean;
  try {
    const result = await verify({ token: code, secret: totpSecret });
    valid = result === true || (typeof result === "object" && result !== null && "valid" in result && !!result.valid);
  } catch {
    valid = false;
  }

  if (!valid) {
    return NextResponse.json({ error: "Code ungültig oder abgelaufen. Bitte den aktuellen Code eingeben." }, { status: 401 });
  }

  const token = tokenForPassword(password);
  const res = NextResponse.json({ ok: true, redirect: verified.from });
  res.cookies.set(getPendingCookieName(), "", { path: "/", maxAge: 0 });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
