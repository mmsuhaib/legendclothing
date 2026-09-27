import type { Metadata } from "next";

const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://legendclothing.com";
const siteUrl = rawBaseUrl.replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Shop All Menswear & Signature Garments",
  description:
    "Explore the complete LEGEND menswear collection. Artisanal Italian fabrics, heavyweight Japanese selvedge denim, tailored trousers, and refined essentials.",
  alternates: {
    canonical: `${siteUrl}/shop`,
  },
  openGraph: {
    title: "Shop All Menswear & Signature Garments | LEGEND",
    description:
      "Explore the complete LEGEND menswear collection. Artisanal Italian fabrics, heavyweight Japanese selvedge denim, tailored trousers, and refined essentials.",
    url: `${siteUrl}/shop`,
    type: "website",
    siteName: "LEGEND",
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: "LEGEND Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Menswear & Signature Garments | LEGEND",
    description:
      "Explore the complete LEGEND menswear collection. Artisanal Italian fabrics, heavyweight Japanese selvedge denim, tailored trousers, and refined essentials.",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
