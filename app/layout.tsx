import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";

const CartDrawer = dynamic(
  () => import("@/components/CartDrawer").then((m) => ({ default: m.CartDrawer })),
  { ssr: false }
);

const CookieBanner = dynamic(
  () => import("@/components/CookieBanner").then((m) => ({ default: m.CookieBanner })),
  { ssr: false }
);

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const defaultTitle = "Followerbase – Follower, Likes & Views kaufen";
const defaultDescription =
  "Follower, Likes und Views für Instagram, TikTok, YouTube & mehr. Schnelle Lieferung, sichere Zahlung. Ab 0,45 € – ohne Abo.";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: defaultTitle,
    template: `%s – ${SITE_NAME}`,
  },
  description: defaultDescription,
  keywords: [
    "Follower kaufen",
    "Likes kaufen",
    "Instagram Follower",
    "TikTok Follower",
    "YouTube Views",
    "Reichweite",
    "Social Media",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDescription,
    url: getBaseUrl(),
    /* Optional: Bild unter /public/opengraph.png (1200×630) für Social-Sharing hinzufügen */
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icons/Webseit%20Favicon.png",
    apple: "/icons/Webseit%20Favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${dmSans.className} ${outfit.variable}`}>
        <CartProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
