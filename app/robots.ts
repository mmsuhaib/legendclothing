import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBase = process.env.NEXT_PUBLIC_APP_URL || "https://legendclothing.com";
  const baseUrl = rawBase.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/product/",
          "/category/",
          "/manifest.webmanifest",
          "/_next/image",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/account",
          "/login",
          "/order/confirmation",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/uploads/", "/_next/image"],
        disallow: ["/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

