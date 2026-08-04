import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import sitemap from "@/app/sitemap";
import { getCategoryByProductSlug } from "@/lib/categories";
import { INDEXNOW_KEY, normalizeUrls, submitToIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Meldet geänderte Inhalte sofort an Bing (IndexNow).
 *
 * Aufrufvarianten (POST):
 *   { "urls": ["/blog/mein-beitrag"] }   – gezielt einzelne Seiten
 *   { "all": true } oder leerer Body     – alle URLs der Sitemap
 *   Supabase-Webhook-Payload             – URL wird aus Tabelle + Datensatz abgeleitet
 *
 * Autorisierung: Header "x-indexnow-secret" oder "Authorization: Bearer <secret>"
 * muss INDEXNOW_SECRET entsprechen. Ohne gesetztes Secret ist die Route deaktiviert,
 * damit sie nicht als offener Melde-Endpunkt missbraucht werden kann.
 */

/**
 * Der IndexNow-Key steht öffentlich unter /<key>.txt und darf deshalb nicht als
 * Passwort dienen – sonst könnte jeder den Endpunkt auslösen.
 */
function isSecretUsable(secret: string): boolean {
  if (secret === INDEXNOW_KEY) {
    console.error(
      "[indexnow] INDEXNOW_SECRET entspricht dem öffentlichen IndexNow-Key. " +
        "Bitte einen eigenen Zufallswert setzen – der Endpunkt bleibt bis dahin deaktiviert."
    );
    return false;
  }
  return true;
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.INDEXNOW_SECRET?.trim();
  if (!secret || !isSecretUsable(secret)) return false;

  const header = request.headers.get("x-indexnow-secret")?.trim();
  const bearer = request.headers.get("authorization")?.trim().replace(/^Bearer\s+/i, "");
  const provided = header || bearer || "";
  if (!provided) return false;

  // Über den SHA-256-Hash vergleichen: gleiche Länge für timingSafeEqual, kein Längen-Leak.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

/** Slug aus einem Supabase-Webhook-Datensatz lesen (bei DELETE steht er in old_record). */
function readSlug(body: Record<string, unknown>): string | undefined {
  for (const key of ["record", "old_record"] as const) {
    const row = body[key];
    if (row && typeof row === "object") {
      const slug = (row as Record<string, unknown>).slug;
      if (typeof slug === "string" && slug.trim()) return slug.trim();
    }
  }
  return undefined;
}

/** Betroffene Pfade eines Supabase-Webhooks: die Detailseite plus ihre Übersichten. */
function pathsForWebhook(table: string, slug: string): string[] {
  if (table === "blog_posts") return [`/blog/${slug}`, "/blog"];

  if (table === "products") {
    const paths = [`/product/${slug}`, "/products"];
    const category = getCategoryByProductSlug(slug);
    if (category) paths.push(`/products/${category.slug}`);
    return paths;
  }

  return [];
}

async function allSitemapPaths(): Promise<string[]> {
  const entries = await sitemap();
  return entries.map((entry) => String(entry.url));
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    const secret = process.env.INDEXNOW_SECRET?.trim();
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "INDEXNOW_SECRET ist nicht gesetzt" },
        { status: 503 }
      );
    }
    if (!isSecretUsable(secret)) {
      return NextResponse.json(
        { ok: false, error: "INDEXNOW_SECRET darf nicht der öffentliche IndexNow-Key sein" },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: false, error: "Nicht autorisiert" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text.trim()) body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Ungültiges JSON" }, { status: 400 });
  }

  let targets: string[] = [];
  let revalidated: string[] = [];

  if (Array.isArray(body.urls)) {
    targets = body.urls.filter((u): u is string => typeof u === "string");
    revalidated = targets;
  } else if (typeof body.table === "string") {
    const slug = readSlug(body);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Kein slug im Datensatz" }, { status: 400 });
    }
    targets = pathsForWebhook(body.table, slug);
    if (targets.length === 0) {
      // Tabelle ohne öffentliche Seite (z. B. orders): still ignorieren, kein Fehler.
      return NextResponse.json({ ok: true, submitted: 0, skipped: body.table });
    }
    revalidated = targets;
  } else {
    targets = await allSitemapPaths();
  }

  // Ohne Revalidierung würde Bing sofort crawlen, aber die alte, noch gecachte Seite sehen.
  // normalizeUrls verwirft fremde Hosts, damit wir nur eigene Pfade revalidieren.
  revalidated = normalizeUrls(revalidated).map((url) => new URL(url).pathname);
  for (const path of revalidated) {
    try {
      revalidatePath(path);
    } catch {
      // Ein fehlgeschlagenes Revalidieren darf den Ping nicht verhindern.
    }
  }

  const result = await submitToIndexNow(targets);

  return NextResponse.json(
    {
      ok: result.ok,
      submitted: result.submitted,
      statuses: result.statuses,
      revalidated: revalidated.length,
      ...(result.error && { error: result.error }),
    },
    { status: result.ok ? 200 : 502 }
  );
}
