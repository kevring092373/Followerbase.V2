import { NextRequest, NextResponse } from "next/server";

const INSTAGRAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.instagram.com/",
  Origin: "https://www.instagram.com",
};

async function fetchImageFromUrl(imageUrl: string): Promise<{ blob: Blob; contentType: string } | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: INSTAGRAM_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const contentType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    return { blob, contentType };
  } catch {
    return null;
  }
}

/**
 * POST /api/instagram-download – Body: { url: string }
 * Ruft das Bild ab und liefert es zur Anzeige (inline). Keine URL-Längenbeschränkung.
 */
export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Ungültige URL" }, { status: 400 });
  }

  const result = await fetchImageFromUrl(url);
  if (!result) {
    return NextResponse.json({ error: "Bild konnte nicht geladen werden" }, { status: 502 });
  }

  return new NextResponse(result.blob, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

/**
 * GET /api/instagram-download?url=...&filename=...&inline=1
 * Ruft das Bild von der URL ab. inline=1 für Anzeige, sonst Download.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const filename = request.nextUrl.searchParams.get("filename") || "instagram-profilbild.jpg";
  const inline = request.nextUrl.searchParams.get("inline") === "1";

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Ungültige URL" }, { status: 400 });
  }

  const result = await fetchImageFromUrl(url);
  if (!result) {
    return NextResponse.json({ error: "Bild konnte nicht geladen werden" }, { status: 502 });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "profilbild.jpg";

  return new NextResponse(result.blob, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": inline ? "inline" : `attachment; filename="${safeName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
