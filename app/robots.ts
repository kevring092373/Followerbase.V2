import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_URL ||
  "https://followerbase.netlify.app";

export default function robots(): MetadataRoute.Robots {
  const origin = BASE_URL.startsWith("http") ? BASE_URL : `https://${BASE_URL}`;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/impressum", "/datenschutz", "/agb", "/widerrufsbelehrung"],
    },
    sitemap: `${origin.replace(/\/$/, "")}/sitemap.xml`,
  };
}
