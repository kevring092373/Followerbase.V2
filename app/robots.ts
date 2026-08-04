import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rechtstexte (Impressum, Datenschutz, AGB, Widerruf) sind ausdrücklich erlaubt:
      // sie stehen auch in der Sitemap, ein Ausschluss wäre ein widersprüchliches Signal.
      disallow: ["/admin", "/api"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
