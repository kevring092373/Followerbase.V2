import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Followerbase – Follower, Likes & mehr",
  description: "Shop für Follower, Likes und Views für Instagram, TikTok und mehr.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={dmSans.className}>
        <CartProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
