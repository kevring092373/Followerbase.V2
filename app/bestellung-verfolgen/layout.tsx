import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bestellung verfolgen",
  description:
    "Bestellstatus prüfen: Gib deine Bestellnummer ein und sieh den aktuellen Stand deiner Lieferung.",
  openGraph: {
    title: "Bestellung verfolgen – Followerbase",
    description: "Status deiner Bestellung mit Bestellnummer prüfen.",
    url: absoluteUrl("/bestellung-verfolgen"),
    type: "website",
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
