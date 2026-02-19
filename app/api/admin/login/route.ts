import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createPendingToken, getPendingCookieName } from "@/lib/admin-auth";

const ADMIN_COOKIE = "admin_session";
const ADMIN_SALT = "followerbase-admin-v1";

function tokenForPassword(password: string): string {
  return createHash("sha256").update(password + ADMIN_SALT).digest("hex");
}

export async function POST(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Admin-Login ist nicht konfiguriert (ADMIN_PASSWORD fehlt oder zu kurz)." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const submitted = typeof body.password === "string" ? body.password : "";
  if (!submitted) {
    return NextResponse.json({ error: "Passwort fehlt." }, { status: 400 });
  }

  if (submitted !== password) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const from = typeof body.from === "string" ? body.from : "/admin";
  const url = from.startsWith("/admin") ? from : "/admin";
  const totpSecret = process.env.ADMIN_TOTP_SECRET?.trim();

  if (totpSecret) {
    const pendingToken = createPendingToken(url, password);
    const res = NextResponse.json({ need2fa: true, from: url });
    res.cookies.set(getPendingCookieName(), pendingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5,
    });
    return res;
  }

  const token = tokenForPassword(password);
  const res = NextResponse.json({ ok: true, redirect: url });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 Tage – bleibt bis Abmeldung oder Schließen
  });
  return res;
}
