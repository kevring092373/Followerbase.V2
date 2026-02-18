import { NextResponse } from "next/server";
import type { Product } from "@/lib/types";

/**
 * GET /api/products – alle aktiven Produkte.
 * GET /api/products?platform=instagram – nach Plattform filtern.
 * GET /api/products?slug=instagram-follower-kaufen – ein Produkt per SEO-Slug (für /product/[slug]).
 * Später: aus Datenbank/Store lesen.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const slug = searchParams.get("slug");

  // Platzhalter: leere Liste. Später echte Daten aus lib/store oder DB.
  const products: Product[] = [];

  if (slug) {
    const product = products.find((p) => p.slug === slug);
    if (!product) return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    return NextResponse.json(product);
  }

  const filtered = platform
    ? products.filter((p) => p.platform === platform)
    : products;

  return NextResponse.json(filtered);
}
