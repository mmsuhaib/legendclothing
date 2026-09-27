import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { ToastProvider } from "@/context/toast-context";
import { AuthProvider } from "@/context/auth-context";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Header } from "@/components/header";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Footer } from "@/components/footer";
import { PwaInstaller } from "@/components/pwa-installer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF8F5",
};

const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://legendclothing.com";
const siteUrl = rawBaseUrl.replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LEGEND — Premium Men's Clothing",
    template: "%s | LEGEND",
  },
  description:
    "Discover architectural tailoring, fine Italian fabrics, Japanese selvedge denim, and refined menswear for the modern gentleman.",
  applicationName: "LEGEND",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LEGEND",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  keywords: [
    "Men's Luxury Fashion",
    "Tailored Shirts",
    "Selvedge Denim",
    "Pleated Trousers",
    "Heavyweight T-Shirts",
    "LEGEND Clothing",
    "Menswear",
    "Designer Clothing Sri Lanka",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LEGEND — Premium Men's Clothing",
    description: "Style that defines you. Discover our latest men's collection.",
    type: "website",
    locale: "en_US",
    siteName: "LEGEND",
    url: siteUrl,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "LEGEND Menswear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LEGEND — Premium Men's Clothing",
    description: "Style that defines you. Discover our latest men's collection.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdOrgSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "LEGEND",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
      description:
        "International luxury menswear maison rooted in architectural tailoring and pure natural fabrics.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "LEGEND",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/shop?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} antialiased h-full`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrgSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#121212] font-sans selection:bg-[#9B783E]/20 selection:text-[#121212]">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AnnouncementBar />
                <Header />
                <CartDrawer />
                <main className="flex-1 pb-16 lg:pb-0">{children}</main>
                <Footer />
                <MobileBottomNav />
                <PwaInstaller />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
