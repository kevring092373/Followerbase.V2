/** @type {import('next').NextConfig} */
const discontinued = require("./content/discontinued-product-redirects.json");

const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "followerbase.de",
      },
    ],
  },
  compress: true,
  async headers() {
    return [
      {
        source: "/blog",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/blog/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      ...discontinued.flatMap((rule) => [
        { source: rule.source, destination: rule.destination, permanent: true },
        { source: `${rule.source}/`, destination: rule.destination, permanent: true },
      ]),
      {
        source: "/blog/instagram-follower-kaufen",
        destination: "/product/instagram-follower-kaufen",
        permanent: true,
      },
      {
        source: "/blog/instagram-follower-kaufen/",
        destination: "/product/instagram-follower-kaufen",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
