import type { Metadata } from "next";
import prisma from "@/lib/prisma";

const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://legendclothing.com";
const siteUrl = rawBaseUrl.replace(/\/+$/, "");

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const slug = params?.slug;
  if (!slug) {
    return { title: "Product | LEGEND" };
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found | LEGEND",
      description: "The requested product could not be found.",
    };
  }

  const title = `${product.name} | LEGEND`;
  const plainDescription =
    product.description?.replace(/<[^>]*>?/gm, "").slice(0, 160) ||
    `Shop ${product.name} from LEGEND menswear. Architectural tailoring and premium fabrics.`;

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    `${siteUrl}/logo.png`;

  const canonicalUrl = `${siteUrl}/product/${product.slug}`;

  return {
    title,
    description: plainDescription,
    keywords: [
      product.name,
      product.category?.name || "Menswear",
      "Men's Luxury Fashion",
      "LEGEND Menswear",
      "Tailoring",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: plainDescription,
      url: canonicalUrl,
      type: "website",
      siteName: "LEGEND",
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 1600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: plainDescription,
      images: [primaryImage],
    },
  };
}

export default async function ProductLayout(props: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;
  const slug = params?.slug;

  let productSchema: any = null;
  let breadcrumbSchema: any = null;

  if (slug) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
      },
    });

    if (product) {
      const canonicalUrl = `${siteUrl}/product/${product.slug}`;
      const imageUrls = product.images.map((img) => img.url).filter(Boolean);

      productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: imageUrls.length > 0 ? imageUrls : [`${siteUrl}/logo.png`],
        description: product.description || product.name,
        sku: product.sku,
        brand: {
          "@type": "Brand",
          name: "LEGEND",
        },
        category: product.category?.name || "Menswear",
        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          priceCurrency: "LKR",
          price: product.price,
          priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
            .toISOString()
            .split("T")[0],
          itemCondition: "https://schema.org/NewCondition",
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "LEGEND",
          },
        },
      };

      breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: `${siteUrl}/shop`,
          },
          ...(product.category
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.category.name,
                  item: `${siteUrl}/shop?category=${product.category.slug}`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: product.name,
                  item: canonicalUrl,
                },
              ]
            : [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.name,
                  item: canonicalUrl,
                },
              ]),
        ],
      };
    }
  }

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {props.children}
    </>
  );
}
