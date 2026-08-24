import type { Metadata } from "next";

/** Öffentliches Caching für alle Blog-Routen, stündlich neu. */
export const revalidate = 3600;

export const metadata: Metadata = {
  keywords: [],
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
