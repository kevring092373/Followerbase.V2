import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bestellübersicht – Followerbase",
  description: "Deine Bestellung wurde erhalten. Übersicht der gekauften Artikel.",
};

export default function BestellungDankeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
