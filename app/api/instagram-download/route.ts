import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/instagram-download?url=...&filename=...
 * Ruft das Bild von der URL ab und liefert es als Download (Content-Disposition: attachment).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const filename = request.nextUrl.searchParams.get("filename") || "instagram-profilbild.jpg";

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Ungültige URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Bild konnte nicht geladen werden" }, { status: 502 });
    }
    const blob = await res.blob();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "profilbild.jpg";

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Fehler beim Abrufen des Bildes" }, { status: 502 });
  }
}
