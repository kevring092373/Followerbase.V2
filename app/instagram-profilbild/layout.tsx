import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram-Profilbild anzeigen – Followercloud",
  description: "Instagram-Profilbild anhand eines Nutzernamens oder Profillinks anzeigen.",
};

export default function InstagramProfilbildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
