import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function seedHashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const keyLength = 64;
  const digest = "sha512";
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
  return `${salt}:${iterations}:${hash}`;
}

async function main() {
  console.log("Seeding LEGEND luxury database...");

  // Clean existing data
  await prisma.paymentReceipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.siteSetting.deleteMany();

  // 1. Admin User (Password: admin123)
  const admin = await prisma.adminUser.create({
    data: {
      email: "admin@legendfashion.com",
      name: "Arthur Vance",
      passwordHash: seedHashPassword("admin123"),
      role: "superadmin",
    },
  });


  // 2. Categories
  const categoriesData = [
    {
      name: "Shirts",
      slug: "shirts",
      description: "Artisanal Italian cotton and crisp linen tailored with timeless proportions.",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop",
      order: 1,
      isActive: true,
    },
    {
      name: "T-Shirts",
      slug: "t-shirts",
      description: "Heavyweight pima cotton and silk-blend tees crafted for effortless refinement.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
      order: 2,
      isActive: true,
    },
    {
      name: "Pants",
      slug: "pants",
      description: "Pleated virgin wool trousers and tapered architectural chinos.",
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop",
      order: 3,
      isActive: true,
    },
    {
      name: "Denim",
      slug: "denim",
      description: "14oz Japanese selvedge denim woven on vintage shuttle looms.",
      image: "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop",
      order: 4,
      isActive: true,
    },
    {
      name: "Perfume",
      slug: "perfume",
      description: "Private blend extrait de parfum infused with rare woods, amber, and smoke.",
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop",
      order: 5,
      isActive: true,
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }

  // 3. Products Data
  const productsData = [
    // SHIRTS
    {
      name: "Riviera Oxford Overshirt",
      slug: "riviera-oxford-overshirt",
      sku: "LEG-SH-001",
      categoryId: categories["shirts"],
      price: 240,
      comparePrice: 285,
      stock: 24,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "Crafted from premium 2-ply long-staple Egyptian cotton with a soft brushed finish. Designed with clean drop shoulders, mother-of-pearl buttons, and a relaxed tailored drape.",
      details:
        "100% Long-Staple Egyptian Cotton. Mother-of-pearl buttons. Dual chest utility pockets. Machine wash cold, hang dry or dry clean. Made in Florence, Italy.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop",
          altText: "Riviera Oxford Overshirt in Ivory - Front View",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop",
          altText: "Riviera Oxford Overshirt - Studio Angle",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1620012253295-c15c429f66bf?q=80&w=1200&auto=format&fit=crop",
          altText: "Riviera Oxford Overshirt - Fabric Detail",
          order: 2,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
          altText: "Riviera Oxford Overshirt - Model Editorial",
          order: 3,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "S", color: "Ivory", colorHex: "#FAF8F5", stock: 6 },
        { size: "M", color: "Ivory", colorHex: "#FAF8F5", stock: 8 },
        { size: "L", color: "Ivory", colorHex: "#FAF8F5", stock: 6 },
        { size: "XL", color: "Ivory", colorHex: "#FAF8F5", stock: 4 },
        { size: "M", color: "Midnight Navy", colorHex: "#1C2536", stock: 5 },
        { size: "L", color: "Midnight Navy", colorHex: "#1C2536", stock: 5 },
      ],
    },
    {
      name: "Sartorial Poplin Dress Shirt",
      slug: "sartorial-poplin-dress-shirt",
      sku: "LEG-SH-002",
      categoryId: categories["shirts"],
      price: 210,
      comparePrice: null,
      stock: 18,
      isPublished: true,
      isFeatured: true,
      isNewArrival: false,
      description:
        "An immaculate dress shirt with a semi-spread French collar and double-needle stitching. Tailored for sharp layering under bespoke suiting or sharp evening wear.",
      details:
        "100% Giza 87 Egyptian Cotton Poplin. Natural Trocas shell buttons. Removable brass collar stays. Tailored slim fit. Made in Milan.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=1200&auto=format&fit=crop",
          altText: "Sartorial Poplin Dress Shirt - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
          altText: "Sartorial Poplin Dress Shirt - Side Profile",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop",
          altText: "Sartorial Poplin Dress Shirt - Collar Detail",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "S", color: "Crisp White", colorHex: "#FFFFFF", stock: 4 },
        { size: "M", color: "Crisp White", colorHex: "#FFFFFF", stock: 7 },
        { size: "L", color: "Crisp White", colorHex: "#FFFFFF", stock: 5 },
        { size: "XL", color: "Crisp White", colorHex: "#FFFFFF", stock: 2 },
      ],
    },

    // T-SHIRTS
    {
      name: "Heavyweight Mercerized Tee",
      slug: "heavyweight-mercerized-tee",
      sku: "LEG-TS-001",
      categoryId: categories["t-shirts"],
      price: 110,
      comparePrice: 130,
      stock: 45,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "Substantial 280 GSM mercerized cotton with a lustrous, silky handfeel. Features a dense ribbed collar that will never lose its shape and a clean boxy silhouette.",
      details:
        "100% Mercerized Long-Staple Cotton (280 GSM). Double-needle binded neckline. Pre-shrunk finish. Relaxed modern cut. Made in Portugal.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
          altText: "Heavyweight Mercerized Tee - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop",
          altText: "Heavyweight Mercerized Tee - Black Angle",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop",
          altText: "Heavyweight Mercerized Tee - Detail",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "S", color: "Warm Stone", colorHex: "#E5DFD5", stock: 10 },
        { size: "M", color: "Warm Stone", colorHex: "#E5DFD5", stock: 15 },
        { size: "L", color: "Warm Stone", colorHex: "#E5DFD5", stock: 12 },
        { size: "XL", color: "Warm Stone", colorHex: "#E5DFD5", stock: 8 },
        { size: "M", color: "Onyx Black", colorHex: "#111111", stock: 14 },
        { size: "L", color: "Onyx Black", colorHex: "#111111", stock: 10 },
      ],
    },
    {
      name: "Raw Silk Blend Pocket Tee",
      slug: "raw-silk-blend-pocket-tee",
      sku: "LEG-TS-002",
      categoryId: categories["t-shirts"],
      price: 135,
      comparePrice: null,
      stock: 20,
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      description:
        "Woven from a tactile blend of organic combed cotton and raw tussah silk. Subtle slub texture brings natural character and unmatched breathable luxury.",
      details:
        "70% Organic Cotton, 30% Raw Silk. Minimalist chest pocket. Hand wash cold or gentle cycle. Made in Japan.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1200&auto=format&fit=crop",
          altText: "Raw Silk Blend Pocket Tee - Studio",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
          altText: "Raw Silk Blend Pocket Tee - Texture",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "S", color: "Ecru", colorHex: "#F5F2EB", stock: 5 },
        { size: "M", color: "Ecru", colorHex: "#F5F2EB", stock: 8 },
        { size: "L", color: "Ecru", colorHex: "#F5F2EB", stock: 5 },
        { size: "XL", color: "Ecru", colorHex: "#F5F2EB", stock: 2 },
      ],
    },

    // PANTS
    {
      name: "Como Single-Pleat Trousers",
      slug: "como-single-pleat-trousers",
      sku: "LEG-PT-001",
      categoryId: categories["pants"],
      price: 295,
      comparePrice: 340,
      stock: 18,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "Tailored from lightweight tropical virgin wool with a gentle forward single pleat, side tab adjusters, and a subtle taper through the hem.",
      details:
        "100% Italian Super 120s Virgin Wool. Concealed hook-and-bar closure. Brass side waist buckles. Dry clean only. Made in Biella, Italy.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop",
          altText: "Como Single-Pleat Trousers - Front Full",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1200&auto=format&fit=crop",
          altText: "Como Single-Pleat Trousers - Tailored Fit",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
          altText: "Como Single-Pleat Trousers - Editorial",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Charcoal Slate", colorHex: "#2C3036", stock: 4 },
        { size: "32", color: "Charcoal Slate", colorHex: "#2C3036", stock: 6 },
        { size: "34", color: "Charcoal Slate", colorHex: "#2C3036", stock: 5 },
        { size: "36", color: "Charcoal Slate", colorHex: "#2C3036", stock: 3 },
        { size: "32", color: "Warm Sand", colorHex: "#C7BAA7", stock: 4 },
        { size: "34", color: "Warm Sand", colorHex: "#C7BAA7", stock: 4 },
      ],
    },
    {
      name: "Minimalist Architectural Chino",
      slug: "minimalist-architectural-chino",
      sku: "LEG-PT-002",
      categoryId: categories["pants"],
      price: 230,
      comparePrice: null,
      stock: 22,
      isPublished: true,
      isFeatured: false,
      isNewArrival: false,
      description:
        "A structured everyday trouser cut from high-density Japanese cotton twill with clean welt pockets and an ergonomic curved waistband.",
      details:
        "100% Japanese High-Density Cotton Twill. Horn buttons. Internal waistband taping. Garment-dyed. Made in Okayama.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop",
          altText: "Minimalist Architectural Chino - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop",
          altText: "Minimalist Architectural Chino - Profile",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Olive Drab", colorHex: "#3E4436", stock: 5 },
        { size: "32", color: "Olive Drab", colorHex: "#3E4436", stock: 8 },
        { size: "34", color: "Olive Drab", colorHex: "#3E4436", stock: 6 },
        { size: "36", color: "Olive Drab", colorHex: "#3E4436", stock: 3 },
      ],
    },

    // DENIM
    {
      name: "Kurabo 14oz Selvedge Denim",
      slug: "kurabo-14oz-selvedge-denim",
      sku: "LEG-DN-001",
      categoryId: categories["denim"],
      price: 280,
      comparePrice: 320,
      stock: 20,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "Woven in Kojima on antique Toyoda G9 shuttle looms using pure indigo rope-dyed yarn. Features a signature pink selvedge ID, custom solid copper hardware, and a classic straight taper.",
      details:
        "100% Long-Staple Zimbabwe Cotton (14.5oz). Pink line selvedge tick. Solid brass doughnut buttons. Vegetable-tanned leather waistband patch. Unwashed raw denim.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop",
          altText: "Kurabo 14oz Selvedge Denim - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1200&auto=format&fit=crop",
          altText: "Kurabo 14oz Selvedge Denim - Selvedge Cuff",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
          altText: "Kurabo 14oz Selvedge Denim - Texture Close-up",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Raw Indigo", colorHex: "#1B2A4A", stock: 4 },
        { size: "32", color: "Raw Indigo", colorHex: "#1B2A4A", stock: 7 },
        { size: "34", color: "Raw Indigo", colorHex: "#1B2A4A", stock: 6 },
        { size: "36", color: "Raw Indigo", colorHex: "#1B2A4A", stock: 3 },
      ],
    },
    {
      name: "Washed Vintage Relaxed Jean",
      slug: "washed-vintage-relaxed-jean",
      sku: "LEG-DN-002",
      categoryId: categories["denim"],
      price: 260,
      comparePrice: null,
      stock: 15,
      isPublished: true,
      isFeatured: false,
      isNewArrival: false,
      description:
        "Naturally faded using stone and ozone washing to replicate ten years of authentic wear. Cut with a generous thigh and slight stacking break.",
      details:
        "100% Cotton (13oz). Vintage nickel rivets. Chain-stitched hems. Eco-washed in Portugal without harmful chemicals.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
          altText: "Washed Vintage Relaxed Jean - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop",
          altText: "Washed Vintage Relaxed Jean - Detail",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Sunbleached Blue", colorHex: "#7796BA", stock: 3 },
        { size: "32", color: "Sunbleached Blue", colorHex: "#7796BA", stock: 6 },
        { size: "34", color: "Sunbleached Blue", colorHex: "#7796BA", stock: 4 },
        { size: "36", color: "Sunbleached Blue", colorHex: "#7796BA", stock: 2 },
      ],
    },

    // PERFUME
    {
      name: "LEGEND Nº 01 — Santal & Smoked Cardamom",
      slug: "legend-no-01-santal-smoked-cardamom",
      sku: "LEG-PF-001",
      categoryId: categories["perfume"],
      price: 215,
      comparePrice: 250,
      stock: 30,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "A commanding yet intimate signature extrait de parfum. Opens with Guatemalan green cardamom and cracked black pepper, evolving into creamy Australian sandalwood, papyrus, and leather.",
      details:
        "Extrait de Parfum (30% concentration). Top: Green Cardamom, Bergamot, Pink Pepper. Heart: Australian Sandalwood, Iris, Leather. Base: Bourbon Vetiver, Cedarwood, Ambergris. Handcrafted in Grasse, France.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop",
          altText: "LEGEND Nº 01 Perfume Bottle - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop",
          altText: "LEGEND Nº 01 Perfume - Editorial Setting",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop",
          altText: "LEGEND Nº 01 Perfume - Glass Bottle Detail",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "50ml", color: "Heavy Glass", colorHex: "#D4AF37", stock: 18 },
        { size: "100ml", color: "Heavy Glass", colorHex: "#D4AF37", stock: 12 },
      ],
    },
    {
      name: "LEGEND Nº 02 — Vetiver & Black Amber",
      slug: "legend-no-02-vetiver-black-amber",
      sku: "LEG-PF-002",
      categoryId: categories["perfume"],
      price: 225,
      comparePrice: null,
      stock: 25,
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      description:
        "Dark, atmospheric, and magnetic. Earthy Haitian vetiver root wrapped in golden Baltic amber, resinous frankincense, and subtle hints of dried violet leaf.",
      details:
        "Extrait de Parfum (32% concentration). Heavy faceted crystal glass flacon with magnetic brass cap. Made in Grasse.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop",
          altText: "LEGEND Nº 02 Perfume - Editorial",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop",
          altText: "LEGEND Nº 02 Perfume - Detail",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "50ml", color: "Amber Flacon", colorHex: "#8B5A2B", stock: 15 },
        { size: "100ml", color: "Amber Flacon", colorHex: "#8B5A2B", stock: 10 },
      ],
    },
  ];

  for (const prod of productsData) {
    const { images, variants, ...prodFields } = prod;
    const createdProduct = await prisma.product.create({
      data: {
        ...prodFields,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
        reviews: {
          create: [
            {
              authorName: "Marcus Sterling",
              rating: 5,
              title: "Exceptional quality and cut",
              comment:
                "The drape and fabric texture are outstanding. Feels truly artisanal, exactly what modern luxury should be.",
              isVerifiedPurchase: true,
              isApproved: true,
            },
            {
              authorName: "Julian Vance",
              rating: 5,
              title: "Timeless staple",
              comment:
                "Subtle, understated elegance. The attention to detail around the stitching and weight is remarkable.",
              isVerifiedPurchase: true,
              isApproved: true,
            },
          ],
        },
      },
    });
    console.log(`Created product: ${createdProduct.name}`);
  }

  // 4. Site Settings (Bank Transfer, CMS, Hero)
  await prisma.siteSetting.createMany({
    data: [
      {
        key: "bank_details",
        value: JSON.stringify({
          bankName: "Hatton National Bank (HNB)",
          accountName: "M M Suhaib",
          accountNumber: "169020066035",
          branch: "Kinniya Branch",
          swiftCode: "HBLILKLX",
          instructions:
            "Direct deposit or online fund transfer to HNB account. Please share transfer receipt on WhatsApp for fast verification.",
        }),
        description: "Official Bank Transfer details shown during checkout",
      },
      {
        key: "shipping_settings",
        value: JSON.stringify({
          fee: 500,
          freeShippingThreshold: 0,
          label: "Islandwide Courier Delivery",
          estimatedDays: "2-3 business days",
        }),
        description: "Courier Shipping rate and threshold settings",
      },
      {
        key: "store_contact",
        value: JSON.stringify({
          whatsappNumber: "+94771234567",
          phone: "+94771234567",
          email: "concierge@legendfashion.com",
        }),
        description: "Store contact numbers and support email",
      },
      {
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
      {
        key: "editorial_section",
        value: JSON.stringify({
          tagline: "The Atelier Standard",
          title: "Quiet Luxury, Defined by Precision",
          paragraphs: [
            "LEGEND was founded upon a single imperative: to craft clothing free from transient trends and loud logos. Every garment is shaped in collaboration with multi-generational family mills in Biella, Florence, and Okayama.",
            "From hand-selected Egyptian Giza cotton to rare Japanese selvedge denim, our materials are selected for tactile permanence and effortless drape."
          ],
          imageUrl:
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Craftsmanship and Tailoring",
          stats: [
            { value: "100%", label: "Traceable Natural Fibers" },
            { value: "Zero", label: "Synthetic Blends in Tops" }
          ],
          buttonText: "Explore The Collection",
          buttonUrl: "/shop"
        }),
        description: "Homepage Editorial and Brand Craftsmanship Story",
      },
      {
        key: "value_pillars",
        value: JSON.stringify([
          {
            icon: "Feather",
            title: "Artisanal Materials",
            description: "Egyptian cotton, Japanese selvedge denim, and French Grasse perfumery."
          },
          {
            icon: "Shield",
            title: "Direct Bank Verification",
            description: "Secure wire transfers with verified proof of payment and instant order tracking."
          },
          {
            icon: "Compass",
            title: "Islandwide Dispatch",
            description: "Reliable islandwide courier delivery with tracking on all orders."
          }
        ]),
        description: "Homepage Value Pillars and Guarantees",
      },
      {
        key: "announcement_bar",
        value: JSON.stringify({
          enabled: true,
          message: "🔥 LEGEND Special Offer: 👔 Shirts Rs. 2,500 | 👕 T-Shirts Rs. 1,500 — Visit our outlet today and grab yours before they’re gone!",
          link: "/shop",
        }),
        description: "Top announcement banner",
      },
    ],
  });

  // 5. Sample Initial Orders for Admin & Customer Tracking Testing
  const sampleShirt = await prisma.product.findUnique({
    where: { slug: "riviera-oxford-overshirt" },
  });

  const samplePerfume = await prisma.product.findUnique({
    where: { slug: "legend-no-01-santal-smoked-cardamom" },
  });

  if (sampleShirt && samplePerfume) {
    // Order 1: Payment Review (Receipt already submitted, ready for Admin review)
    const order1 = await prisma.order.create({
      data: {
        orderNumber: "LEG-2026-8491",
        customerName: "David Laurent",
        customerEmail: "david.laurent@example.com",
        customerPhone: "+1 (555) 234-8901",
        status: "Payment Review",
        subtotal: 455.0,
        shippingFee: 0.0,
        total: 455.0,
        shippingAddress: "740 Park Avenue, Penthouse 4B",
        city: "New York",
        state: "NY",
        postalCode: "10021",
        country: "United States",
        items: {
          create: [
            {
              productId: sampleShirt.id,
              productName: sampleShirt.name,
              productImage:
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
              variantInfo: "Size: L, Color: Ivory",
              size: "L",
              color: "Ivory",
              quantity: 1,
              price: 240.0,
              subtotal: 240.0,
            },
            {
              productId: samplePerfume.id,
              productName: samplePerfume.name,
              productImage:
                "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
              variantInfo: "Size: 100ml, Color: Heavy Glass",
              size: "100ml",
              color: "Heavy Glass",
              quantity: 1,
              price: 215.0,
              subtotal: 215.0,
            },
          ],
        },
        payment: {
          create: {
            method: "BANK_TRANSFER",
            amount: 455.0,
            status: "UNDER_REVIEW",
            bankName: "Standard Chartered Private Bank",
            accountName: "LEGEND LUXURY APPAREL LTD",
            accountNumber: "9482-1084-3920-1184",
            referenceCode: "LEG-2026-8491",
            receipts: {
              create: [
                {
                  fileUrl:
                    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
                  fileName: "bank_transfer_receipt_8491.jpg",
                  fileType: "image/jpeg",
                  fileSize: 428000,
                  status: "SUBMITTED",
                  notes: "Wire transfer sent from Chase Private Client ref #TX99214.",
                },
              ],
            },
          },
        },
      },
    });

    // Order 2: Payment Confirmed / Processing
    await prisma.order.create({
      data: {
        orderNumber: "LEG-2026-7712",
        customerName: "Julian Vance",
        customerEmail: "julian.vance@example.com",
        customerPhone: "+1 (555) 789-1122",
        status: "Payment Confirmed",
        subtotal: 280.0,
        shippingFee: 0.0,
        total: 280.0,
        shippingAddress: "12 Savile Row",
        city: "London",
        postalCode: "W1S 3PR",
        country: "United Kingdom",
        items: {
          create: [
            {
              productId: sampleShirt.id,
              productName: "Kurabo 14oz Selvedge Denim",
              productImage:
                "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=600&auto=format&fit=crop",
              variantInfo: "Size: 32, Color: Raw Indigo",
              size: "32",
              color: "Raw Indigo",
              quantity: 1,
              price: 280.0,
              subtotal: 280.0,
            },
          ],
        },
        payment: {
          create: {
            method: "BANK_TRANSFER",
            amount: 280.0,
            status: "APPROVED",
            verifiedBy: "Arthur Vance",
            verifiedAt: new Date(),
          },
        },
      },
    });

    console.log(`Created sample orders: ${order1.orderNumber}`);
  }

  console.log("Database seeded successfully with luxury catalog!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
