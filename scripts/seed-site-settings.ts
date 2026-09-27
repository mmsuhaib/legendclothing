import prisma from "../lib/prisma";

async function main() {
  console.log("Upserting site settings in database...");

  await prisma.siteSetting.upsert({
    where: { key: "hero_content" },
    update: {
      value: JSON.stringify({
        tagline: "LEGEND Atelier",
        title: "STYLE THAT DEFINES YOU",
        subtitle: "Discover our latest men's collection.",
        primaryButtonText: "SHOP COLLECTION",
        primaryButtonUrl: "/shop",
        secondaryButtonText: "EXPLORE NEW ARRIVALS",
        secondaryButtonUrl: "/shop?sort=newest",
        imageUrl:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2000&auto=format&fit=crop",
      }),
    },
    create: {
      key: "hero_content",
      value: JSON.stringify({
        tagline: "LEGEND Atelier",
        title: "STYLE THAT DEFINES YOU",
        subtitle: "Discover our latest men's collection.",
        primaryButtonText: "SHOP COLLECTION",
        primaryButtonUrl: "/shop",
        secondaryButtonText: "EXPLORE NEW ARRIVALS",
        secondaryButtonUrl: "/shop?sort=newest",
        imageUrl:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2000&auto=format&fit=crop",
      }),
      description: "Homepage Hero Section Configuration",
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "editorial_section" },
    update: {
      value: JSON.stringify({
        tagline: "The Atelier Standard",
        title: "Quiet Luxury, Defined by Precision",
        paragraphs: [
          "LEGEND was founded upon a single imperative: to craft clothing free from transient trends and loud logos. Every garment is shaped in collaboration with multi-generational family mills in Biella, Florence, and Okayama.",
          "From hand-selected Egyptian Giza cotton to rare Japanese selvedge denim, our materials are selected for tactile permanence and effortless drape.",
        ],
        imageUrl:
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
        imageAlt: "Craftsmanship and Tailoring",
        stats: [
          { value: "100%", label: "Traceable Natural Fibers" },
          { value: "Zero", label: "Synthetic Blends in Tops" },
        ],
        buttonText: "Explore The Collection",
        buttonUrl: "/shop",
      }),
    },
    create: {
      key: "editorial_section",
      value: JSON.stringify({
        tagline: "The Atelier Standard",
        title: "Quiet Luxury, Defined by Precision",
        paragraphs: [
          "LEGEND was founded upon a single imperative: to craft clothing free from transient trends and loud logos. Every garment is shaped in collaboration with multi-generational family mills in Biella, Florence, and Okayama.",
          "From hand-selected Egyptian Giza cotton to rare Japanese selvedge denim, our materials are selected for tactile permanence and effortless drape.",
        ],
        imageUrl:
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
        imageAlt: "Craftsmanship and Tailoring",
        stats: [
          { value: "100%", label: "Traceable Natural Fibers" },
          { value: "Zero", label: "Synthetic Blends in Tops" },
        ],
        buttonText: "Explore The Collection",
        buttonUrl: "/shop",
      }),
      description: "Homepage Editorial and Brand Craftsmanship Story",
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "value_pillars" },
    update: {
      value: JSON.stringify([
        {
          icon: "Feather",
          title: "Artisanal Materials",
          description: "Egyptian cotton, Japanese selvedge denim, and French Grasse perfumery.",
        },
        {
          icon: "Shield",
          title: "Direct Bank Verification",
          description: "Secure wire transfers with verified proof of payment and instant order tracking.",
        },
        {
          icon: "Compass",
          title: "Islandwide Dispatch",
          description: "Reliable islandwide courier delivery with tracking on all orders.",
        },
      ]),
    },
    create: {
      key: "value_pillars",
      value: JSON.stringify([
        {
          icon: "Feather",
          title: "Artisanal Materials",
          description: "Egyptian cotton, Japanese selvedge denim, and French Grasse perfumery.",
        },
        {
          icon: "Shield",
          title: "Direct Bank Verification",
          description: "Secure wire transfers with verified proof of payment and instant order tracking.",
        },
        {
          icon: "Compass",
          title: "Islandwide Dispatch",
          description: "Reliable islandwide courier delivery with tracking on all orders.",
        },
      ]),
      description: "Homepage Value Pillars and Guarantees",
    },
  });

  console.log("Site settings successfully populated in database!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
