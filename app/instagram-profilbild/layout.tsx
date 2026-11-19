import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { pageMetaDescription } from "@/lib/page-meta-descriptions";

const description = pageMetaDescription("/instagram-profilbild");

export const metadata: Metadata = {
  title: "Instagram-Profilbild anzeigen – Followerbase",
  description,
  openGraph: {
    title: "Instagram-Profilbild anzeigen – Followerbase" as const,
    description,
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
