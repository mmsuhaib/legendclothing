import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Shield,
  Compass,
  Feather,
  CreditCard,
  Truck,
  Award,
  LucideIcon,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const revalidate = 60;

interface HeroData {
  tagline?: string;
  title: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  imageUrl: string;
}

interface EditorialData {
  tagline?: string;
  title: string;
  paragraphs?: string[];
  imageUrl?: string;
  imageAlt?: string;
  stats?: { value: string; label: string }[];
  buttonText?: string;
  buttonUrl?: string;
}

interface ValuePillar {
  icon?: string;
  title: string;
  description: string;
}

function resolveIcon(iconName?: string): LucideIcon {
  const normalized = (iconName || "").toLowerCase().trim();
  switch (normalized) {
    case "feather":
      return Feather;
    case "shield":
      return Shield;
    case "compass":
      return Compass;
    case "creditcard":
    case "bank":
      return CreditCard;
    case "truck":
    case "shipping":
      return Truck;
    case "award":
      return Award;
    default:
      return Sparkles;
  }
}

export default async function HomePage() {
  // 1. Parallel database queries for all storefront homepage items
  const [
    categories,
    rawNewArrivals,
    rawFeaturedProducts,
    heroSetting,
    heroBanner,
    promoBanners,
    editorialSetting,
    pillarsSetting,
  ] = await Promise.all([
    // Active categories with live published product count and first product image preview
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
        products: {
          where: { isPublished: true },
          take: 1,
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
          },
        },
      },
    }),

    // New Arrivals products
    prisma.product.findMany({
      where: { isPublished: true, isNewArrival: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    }),

    // Featured Products for curated staples section
    prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    }),

    // CMS Hero settings
    prisma.siteSetting.findUnique({
      where: { key: "hero_content" },
    }),

    // Active Hero banner record if configured in Banner table
    prisma.banner.findFirst({
      where: { isActive: true, position: "homepage_hero" },
      orderBy: { order: "asc" },
    }),

    // Active middle/promotional banners from Banner table
    prisma.banner.findMany({
      where: { isActive: true, position: { not: "homepage_hero" } },
      orderBy: { order: "asc" },
    }),

    // Editorial and craftsmanship story
    prisma.siteSetting.findUnique({
      where: { key: "editorial_section" },
    }),

    // Value pillars
    prisma.siteSetting.findUnique({
      where: { key: "value_pillars" },
    }),
  ]);

  // 2. Resilient fallback for New Arrivals: ensure items from database are always presented
  let newArrivals = rawNewArrivals;
  if (newArrivals.length === 0) {
    newArrivals = await prisma.product.findMany({
      where: { isPublished: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    });
  }

  // 3. Resilient fallback for Featured Products
  let featuredProducts = rawFeaturedProducts;
  if (featuredProducts.length === 0) {
    featuredProducts = await prisma.product.findMany({
      where: { isPublished: true },
      take: 4,
      orderBy: { price: "desc" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    });
  }

  // 4. Resolve Hero Content & Background Image from Database
  let parsedHeroContent: Partial<HeroData> = {};
  if (heroSetting?.value) {
    try {
      parsedHeroContent = JSON.parse(heroSetting.value);
    } catch (e) {
      console.error("Error parsing hero_content setting:", e);
    }
  }

  // Retrieve hero background image dynamically from database:
  // 1. Hero banner (Banner model)
  // 2. Hero content setting (SiteSetting model)
  // 3. Featured / New arrival product images from database
  // 4. Category image from database
  const dbHeroBgImage =
    heroBanner?.imageUrl ||
    parsedHeroContent.imageUrl ||
    featuredProducts[0]?.images?.find((img) => img.isPrimary)?.url ||
    featuredProducts[0]?.images?.[0]?.url ||
    newArrivals[0]?.images?.[0]?.url ||
    categories[0]?.image ||
    "";

  let heroData: HeroData = {
    tagline: parsedHeroContent.tagline || "LEGEND Clothing",
    title: heroBanner?.title || parsedHeroContent.title || "STYLE THAT DEFINES YOU",
    subtitle:
      heroBanner?.subtitle ||
      parsedHeroContent.subtitle ||
      "Discover our latest men's collection.",
    primaryButtonText: parsedHeroContent.primaryButtonText || "SHOP COLLECTION",
    primaryButtonUrl:
      heroBanner?.linkUrl || parsedHeroContent.primaryButtonUrl || "/shop",
    secondaryButtonText:
      parsedHeroContent.secondaryButtonText || "EXPLORE NEW ARRIVALS",
    secondaryButtonUrl:
      parsedHeroContent.secondaryButtonUrl || "/shop?sort=newest",
    imageUrl: dbHeroBgImage,
  };

  // 5. Resolve Editorial Craftsmanship Content from Database
  let editorialData: EditorialData | null = null;
  if (editorialSetting?.value) {
    try {
      editorialData = JSON.parse(editorialSetting.value);
    } catch (e) {
      console.error("Error parsing editorial_section setting:", e);
    }
  }

  // 6. Resolve Value Pillars from Database
  let valuePillars: ValuePillar[] = [];
  if (pillarsSetting?.value) {
    try {
      valuePillars = JSON.parse(pillarsSetting.value);
    } catch (e) {
      console.error("Error parsing value_pillars setting:", e);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION - Full width editorial fashion statement */}
      <section className="relative w-full overflow-hidden bg-[#FAF8F5]">
        {/* Crystal Clear Editorial Background Image */}
        {heroData.imageUrl && (
          <Link
            href={heroData.primaryButtonUrl || "/shop"}
            className="relative block w-full cursor-pointer group"
            aria-label={heroData.title || "Shop Collection"}
          >
            <Image
              src={heroData.imageUrl}
              alt={heroData.title || "LEGEND Clothing"}
              width={1926}
              height={817}
              priority
              quality={85}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
              className="w-full h-auto object-contain block"
            />
          </Link>
        )}
      </section>

      {/* 2. CATEGORY SECTION - High-End Editorial 4-Column Grid View */}
      {categories.length > 0 && (
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full content-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-px bg-[#9B783E]" />
                <span className="text-[11px] uppercase tracking-[0.35em] text-[#9B783E] font-medium">
                  Curated Wardrobe
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.12em] uppercase text-[#121212]">
                Shop by Category
              </h2>
              <p className="text-xs sm:text-sm text-[#73706B] font-light mt-2 max-w-md tracking-wide">
                Explore signature tailored essentials and statement pieces designed for timeless refinement.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 self-start md:self-end px-5 py-2.5 border border-[#121212]/25 hover:border-[#121212] hover:bg-[#121212] hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xs group cursor-pointer"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9B783E] group-hover:text-white group-hover:translate-x-1.5 transition-all duration-200" />
            </Link>
          </div>

          {/* Dynamic 4-Column Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            {categories.map((category, idx) => {
              const categoryImage =
                category.image || category.products[0]?.images[0]?.url;

              return (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group relative flex flex-col justify-end aspect-[3/4] overflow-hidden bg-[#161616] border border-[#E8E5E0] shadow-sm hover:shadow-2xl hover:shadow-black/25 hover:border-[#9B783E]/70 transition-all duration-500 rounded-[2px]"
                >
                  {/* Category Image with cinematic hover zoom */}
                  {categoryImage ? (
                    <Image
                      src={categoryImage}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1E1B18] to-[#121212] text-white">
                      <span className="text-5xl font-light tracking-[0.25em] text-[#C29D59]">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Multi-layered cinematic gradient overlays for high legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#9B783E]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top Right Quick Explore Icon */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <div className="w-7 h-7 rounded-full backdrop-blur-md bg-white/15 border border-white/25 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:bg-[#9B783E] group-hover:text-white group-hover:border-[#9B783E] transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 shadow-sm">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Bottom Content Area */}
                  <div className="relative z-10 p-4 sm:p-6 w-full transform transition-transform duration-300">
                    <h3 className="text-lg sm:text-2xl font-light tracking-[0.16em] uppercase text-white group-hover:text-[#FAF8F5] transition-colors leading-tight">
                      {category.name}
                    </h3>
                    <div className="w-6 h-[1.5px] bg-[#C29D59] group-hover:w-14 transition-all duration-500 ease-out my-2.5" />
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium tracking-[0.22em] uppercase text-[#FAF8F5]/85 group-hover:text-white transition-all pt-0.5">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3 h-3 text-[#C29D59] transform group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. PRODUCT SECTION - NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="py-16 lg:py-24 bg-white border-y border-[#E8E5E0] content-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
                  Seasonal Drop
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-[0.15em] uppercase text-[#121212] mt-1">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/shop?sort=newest"
                className="text-xs uppercase tracking-[0.2em] text-[#9B783E] hover:text-[#826330] hover:underline flex items-center gap-1.5 mt-2 sm:mt-0 font-medium group transition-colors cursor-pointer"
              >
                <span>View All Arrivals</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            {/* Product Grid from Database */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. BRAND PHILOSOPHY / CRAFTSMANSHIP EDITORIAL (Loaded dynamically from Database) */}
      {editorialData && (
        <section className="py-24 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 content-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {editorialData.imageUrl && (
              <div className="lg:col-span-6 relative aspect-[4/5] overflow-hidden border border-[#E8E5E0] bg-[#F4F1EA]">
                <Image
                  src={editorialData.imageUrl}
                  alt={editorialData.imageAlt || editorialData.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <div
              className={`${editorialData.imageUrl ? "lg:col-span-6 lg:pl-6" : "lg:col-span-12 max-w-3xl mx-auto text-center"
                } space-y-6`}
            >
              {editorialData.tagline && (
                <span className="text-xs uppercase tracking-[0.3em] text-[#9B783E] font-medium block">
                  {editorialData.tagline}
                </span>
              )}
              <h2 className="text-3xl sm:text-4xl font-light tracking-[0.15em] uppercase text-[#121212] leading-tight">
                {editorialData.title}
              </h2>

              {editorialData.paragraphs &&
                editorialData.paragraphs.map((para, index) => (
                  <p key={index} className="text-sm text-[#66635F] leading-relaxed">
                    {para}
                  </p>
                ))}

              {editorialData.stats && editorialData.stats.length > 0 && (
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#E8E5E0]">
                  {editorialData.stats.map((stat, idx) => (
                    <div key={idx}>
                      <span className="block text-2xl font-light text-[#121212]">
                        {stat.value}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-[#8E8B85]">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {editorialData.buttonText && editorialData.buttonUrl && (
                <div className="pt-2">
                  <Link
                    href={editorialData.buttonUrl}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#121212] hover:text-[#9B783E] transition-all duration-200 border-b border-[#121212] pb-1 hover:border-[#9B783E] hover:translate-x-1 group cursor-pointer"
                  >
                    <span>{editorialData.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. PROMOTIONAL BANNERS FROM DATABASE (if configured) */}
      {promoBanners.length > 0 && (
        <section className="w-full bg-[#121212] text-white py-14 border-y border-[#262626]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promoBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="relative overflow-hidden border border-white/10 p-8 flex flex-col justify-between min-h-[220px]"
                >
                  {banner.imageUrl && (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover opacity-35"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
                    </div>
                  )}
                  <div className="relative z-10">
                    <h3 className="text-xl font-light uppercase tracking-[0.15em] text-white">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-xs text-[#FAF8F5]/80 mt-2 tracking-wide">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                  {banner.linkUrl && (
                    <div className="relative z-10 mt-6">
                      <Link
                        href={banner.linkUrl}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C29D59] hover:text-white group transition-all duration-200 cursor-pointer"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CURATED FEATURED STAPLES (Items from Database) */}
      {featuredProducts.length > 0 && (
        <section className="py-20 lg:py-28 bg-[#F4F1EA] border-t border-[#E8E5E0] content-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
                Timeless Staples
              </span>
              <h2 className="text-2xl sm:text-3xl font-light tracking-[0.15em] uppercase text-[#121212] mt-1">
                Featured Essentials
              </h2>
              <p className="text-xs text-[#66635F] mt-2">
                Pieces designed to anchor your wardrobe across seasons.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. VALUE PILLARS (Items from Database) */}
      {valuePillars.length > 0 && (
        <section className="py-16 border-t border-[#E8E5E0] bg-white content-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`grid grid-cols-1 ${valuePillars.length === 2
                ? "md:grid-cols-2"
                : valuePillars.length === 4
                  ? "md:grid-cols-4"
                  : "md:grid-cols-3"
                } gap-6 text-center`}
            >
              {valuePillars.map((pillar, index) => {
                const IconComponent = resolveIcon(pillar.icon);
                return (
                  <div
                    key={index}
                    className="p-6 border border-[#E8E5E0] bg-[#FAF8F5] transition-all duration-300 hover:border-[#9B783E]/40 hover:-translate-y-1 hover:shadow-md cursor-default group"
                  >
                    <IconComponent className="w-5 h-5 text-[#9B783E] mx-auto mb-3 stroke-1 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#121212] mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#66635F] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
