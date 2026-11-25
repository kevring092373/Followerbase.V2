import type { Metadata } from "next";

import { absoluteUrl, brandOgImage } from "@/lib/seo";
import { pageMetaDescription } from "@/lib/page-meta-descriptions";

const description = pageMetaDescription("/bestellung-verfolgen");

export const metadata: Metadata = {
  title: "Bestellung verfolgen – Followerbase",
  description,
  openGraph: {
    title: "Bestellung verfolgen – Followerbase" as const,
    description,
    url: absoluteUrl("/bestellung-verfolgen"),
    type: "website",
    images: [brandOgImage()],
  },
  alternates: { canonical: absoluteUrl("/bestellung-verfolgen") },
};

export default function BestellungVerfolgenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
