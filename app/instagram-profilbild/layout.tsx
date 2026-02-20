import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Instagram-Profilbild anzeigen",
  description:
    "Instagram-Profilbild zu einem Nutzernamen oder Profillink anzeigen und herunterladen. Kostenlos und ohne Anmeldung.",
  openGraph: {
    title: "Instagram-Profilbild anzeigen – Followerbase",
    description: "Profilbild zu Instagram-Nutzernamen anzeigen und herunterladen.",
    url: absoluteUrl("/instagram-profilbild"),
    type: "website",
  },
  alternates: { canonical: absoluteUrl("/instagram-profilbild") },
};

export default function InstagramProfilbildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
