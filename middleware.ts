import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin-Auth läuft im Admin-Layout (Node), damit Session stabil bleibt (kein Edge-Env-Problem).
// Middleware übergibt nur den Pfad per Header ans Layout.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-path", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
