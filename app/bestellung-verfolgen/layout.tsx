import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bestellung verfolgen – Followercloud",
  description: "Prüfe den Status deiner Bestellung mit deiner Bestellnummer.",
};

export default function BestellungVerfolgenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
