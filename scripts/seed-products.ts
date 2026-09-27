import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding multiple luxury products for LEGEND Clothing...");

  // Find existing categories
  const categories = await prisma.category.findMany();
  const catMap = new Map<string, string>();
  for (const c of categories) {
    catMap.set(c.slug, c.id);
  }

  const shirtsId = catMap.get("shirts");
  const tshirtsId = catMap.get("t-shirts");
  const pantsId = catMap.get("pants");
  const denimId = catMap.get("denim");

  if (!shirtsId || !tshirtsId || !pantsId || !denimId) {
    console.error("Missing required categories. Found:", Array.from(catMap.keys()));
    process.exit(1);
  }

  // Clear existing products safely (variants & images cascade)
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();

  const productsData = [
    // --- SHIRTS ---
    {
      name: "Riviera Oxford Overshirt",
      slug: "riviera-oxford-overshirt",
      sku: "LEG-SH-001",
      categoryId: shirtsId,
      price: 240,
      comparePrice: 285,
      stock: 24,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "Crafted from premium 2-ply long-staple Egyptian cotton with a soft brushed finish. Designed with clean drop shoulders, mother-of-pearl buttons, and a relaxed tailored drape.",
      details:
        "100% Long-Staple Egyptian Cotton. Mother-of-pearl buttons. Dual chest utility pockets. Machine wash cold or dry clean. Made in Florence, Italy.",
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
      categoryId: shirtsId,
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
    {
      name: "Florentine Washed Linen Shirt",
      slug: "florentine-washed-linen-shirt",
      sku: "LEG-SH-003",
      categoryId: shirtsId,
      price: 195,
      comparePrice: 230,
      stock: 22,
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      description:
        "Airy Normandy flax linen garment-washed in small Italian batches for a relaxed rumpled drape. Styled with a band collar and curved hem.",
      details:
        "100% French Normandy Linen (165 GSM). Natural bone buttons. Pre-washed for zero shrinkage. Made in Tuscany.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop",
          altText: "Florentine Washed Linen Shirt - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop",
          altText: "Florentine Washed Linen Shirt - Texture",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "S", color: "Sand Beige", colorHex: "#D8CBB5", stock: 5 },
        { size: "M", color: "Sand Beige", colorHex: "#D8CBB5", stock: 9 },
        { size: "L", color: "Sand Beige", colorHex: "#D8CBB5", stock: 5 },
        { size: "XL", color: "Sand Beige", colorHex: "#D8CBB5", stock: 3 },
      ],
    },
    {
      name: "Wool-Cashmere Heavy Overshirt",
      slug: "wool-cashmere-heavy-overshirt",
      sku: "LEG-SH-004",
      categoryId: shirtsId,
      price: 340,
      comparePrice: 395,
      stock: 14,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "A substantial mid-weight architectural outer shirt spun from 90% virgin merino wool and 10% Mongolian cashmere. Fully lined with cupro silk.",
      details:
        "90% Virgin Wool, 10% Cashmere. 100% Japanese Bemberg Cupro lining. Horn buttons. Dry clean only. Made in Biella, Italy.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
          altText: "Wool-Cashmere Heavy Overshirt - Studio",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1620012253295-c15c429f66bf?q=80&w=1200&auto=format&fit=crop",
          altText: "Wool-Cashmere Heavy Overshirt - Texture",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "M", color: "Charcoal Melange", colorHex: "#333333", stock: 5 },
        { size: "L", color: "Charcoal Melange", colorHex: "#333333", stock: 6 },
        { size: "XL", color: "Charcoal Melange", colorHex: "#333333", stock: 3 },
      ],
    },

    // --- T-SHIRTS ---
    {
      name: "Heavyweight Mercerized Tee",
      slug: "heavyweight-mercerized-tee",
      sku: "LEG-TS-001",
      categoryId: tshirtsId,
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
      categoryId: tshirtsId,
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
        { size: "L", color: "Ecru", colorHex: "#F5F2EB", stock: 7 },
      ],
    },
    {
      name: "Supima Ribbed Long-Sleeve",
      slug: "supima-ribbed-long-sleeve",
      sku: "LEG-TS-003",
      categoryId: tshirtsId,
      price: 145,
      comparePrice: 175,
      stock: 25,
      isPublished: true,
      isFeatured: true,
      isNewArrival: false,
      description:
        "Fine-gauge American Supima cotton with a micro-ribbed knit. Elegant tubular cuffs and clean binding around the neck line for sharp solo wear or under tailored coats.",
      details:
        "100% Extra-Long Staple American Supima Cotton. Reactive dye finish. Machine wash gentle. Made in Los Angeles, USA.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop",
          altText: "Supima Ribbed Long-Sleeve - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop",
          altText: "Supima Ribbed Long-Sleeve - Detail",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "S", color: "Slate Grey", colorHex: "#646A72", stock: 6 },
        { size: "M", color: "Slate Grey", colorHex: "#646A72", stock: 10 },
        { size: "L", color: "Slate Grey", colorHex: "#646A72", stock: 6 },
        { size: "XL", color: "Slate Grey", colorHex: "#646A72", stock: 3 },
      ],
    },
    {
      name: "Vintage Washed Boxy Tee",
      slug: "vintage-washed-boxy-tee",
      sku: "LEG-TS-004",
      categoryId: tshirtsId,
      price: 115,
      comparePrice: null,
      stock: 32,
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      description:
        "Enzyme-washed heavy cotton with sun-faded nuances along seamlines. Built with a relaxed, dropped shoulder drape and generous sleeve opening.",
      details:
        "100% Combed Cotton (260 GSM). Vintage wash process. Reinforced neck tape. Made in Portugal.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop",
          altText: "Vintage Washed Boxy Tee - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop",
          altText: "Vintage Washed Boxy Tee - Angle",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "S", color: "Faded Black", colorHex: "#2B2B2B", stock: 8 },
        { size: "M", color: "Faded Black", colorHex: "#2B2B2B", stock: 12 },
        { size: "L", color: "Faded Black", colorHex: "#2B2B2B", stock: 8 },
        { size: "XL", color: "Faded Black", colorHex: "#2B2B2B", stock: 4 },
      ],
    },

    // --- PANTS ---
    {
      name: "Single-Pleat Virgin Wool Trouser",
      slug: "single-pleat-virgin-wool-trouser",
      sku: "LEG-PT-001",
      categoryId: pantsId,
      price: 290,
      comparePrice: 340,
      stock: 16,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "Impeccably tailored from Australian virgin wool with a gentle taper from knee to hem. Features side adjusters, a clean front pleat, and blind-stitched cuffs.",
      details:
        "100% Virgin Wool (Super 120s). Brass buckle side tab adjusters. Half-lined in viscose to knee. Dry clean only. Made in Naples, Italy.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop",
          altText: "Single-Pleat Virgin Wool Trouser - Full Shot",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1200&auto=format&fit=crop",
          altText: "Single-Pleat Virgin Wool Trouser - Pleat Detail",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Charcoal Grey", colorHex: "#2E3033", stock: 4 },
        { size: "32", color: "Charcoal Grey", colorHex: "#2E3033", stock: 6 },
        { size: "34", color: "Charcoal Grey", colorHex: "#2E3033", stock: 4 },
        { size: "36", color: "Charcoal Grey", colorHex: "#2E3033", stock: 2 },
      ],
    },
    {
      name: "Tapered Architectural Chino",
      slug: "tapered-architectural-chino",
      sku: "LEG-PT-002",
      categoryId: pantsId,
      price: 220,
      comparePrice: null,
      stock: 28,
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      description:
        "High-density Japanese cotton twill with an immaculate structured drape. Cut with a mid-rise waist, slight thigh volume, and a razor-sharp bottom taper.",
      details:
        "100% Kurabo Cotton Twill (9.5oz). Genuine horn button closure. Coin pocket with hidden rivet. Made in Okayama, Japan.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200&auto=format&fit=crop",
          altText: "Tapered Architectural Chino - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop",
          altText: "Tapered Architectural Chino - Detail",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Khaki Stone", colorHex: "#C4B59D", stock: 6 },
        { size: "32", color: "Khaki Stone", colorHex: "#C4B59D", stock: 10 },
        { size: "34", color: "Khaki Stone", colorHex: "#C4B59D", stock: 8 },
        { size: "36", color: "Khaki Stone", colorHex: "#C4B59D", stock: 4 },
      ],
    },
    {
      name: "Relaxed Wool Flannel Pant",
      slug: "relaxed-wool-flannel-pant",
      sku: "LEG-PT-003",
      categoryId: pantsId,
      price: 310,
      comparePrice: 360,
      stock: 15,
      isPublished: true,
      isFeatured: false,
      isNewArrival: false,
      description:
        "Spun from buttery Vitale Barberis Canonico melange flannel. Features a straight wide leg silhouette with tailored belt loops and buttoned jetted rear pockets.",
      details:
        "100% Wool Flannel from VBC Italy. Corozo nut buttons. French fly with hook and eye. Dry clean only. Made in Italy.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop",
          altText: "Relaxed Wool Flannel Pant - Editorial",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop",
          altText: "Relaxed Wool Flannel Pant - Fabric",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Heather Grey", colorHex: "#808285", stock: 3 },
        { size: "32", color: "Heather Grey", colorHex: "#808285", stock: 6 },
        { size: "34", color: "Heather Grey", colorHex: "#808285", stock: 4 },
        { size: "36", color: "Heather Grey", colorHex: "#808285", stock: 2 },
      ],
    },
    {
      name: "Drawstring Tailored Easy Pant",
      slug: "drawstring-tailored-easy-pant",
      sku: "LEG-PT-004",
      categoryId: pantsId,
      price: 245,
      comparePrice: null,
      stock: 22,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "Blending satorial codes with modern ease. Encased elastic waistband with braided cotton drawcord, front pressed creases, and relaxed tapered leg.",
      details:
        "98% Tropical Virgin Wool, 2% Elastane. Polished metal aglets. Slash pockets with pick-stitching. Made in Portugal.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1200&auto=format&fit=crop",
          altText: "Drawstring Tailored Easy Pant - Studio",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200&auto=format&fit=crop",
          altText: "Drawstring Tailored Easy Pant - Waistband",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Onyx Black", colorHex: "#121212", stock: 5 },
        { size: "32", color: "Onyx Black", colorHex: "#121212", stock: 9 },
        { size: "34", color: "Onyx Black", colorHex: "#121212", stock: 5 },
        { size: "36", color: "Onyx Black", colorHex: "#121212", stock: 3 },
      ],
    },

    // --- DENIM ---
    {
      name: "14oz Japanese Selvedge Straight Jean",
      slug: "14oz-japanese-selvedge-straight-jean",
      sku: "LEG-DN-001",
      categoryId: denimId,
      price: 280,
      comparePrice: 320,
      stock: 30,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      description:
        "Woven on vintage Toyoda GL9 shuttle looms in Kojima, Okayama. Features a classic pink line selvedge ID, custom branded copper rivets, and a mid-rise straight silhouette.",
      details:
        "100% Zimbabwe Long-Staple Cotton (14oz). Pure indigo rope-dyed. Solid brass donut button fly. Chainstitched waistband and hem. Made in Okayama, Japan.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop",
          altText: "14oz Japanese Selvedge Jean - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
          altText: "14oz Japanese Selvedge Jean - Texture",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1200&auto=format&fit=crop",
          altText: "14oz Japanese Selvedge Jean - Cuff ID",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Raw Indigo", colorHex: "#1A2B4C", stock: 6 },
        { size: "32", color: "Raw Indigo", colorHex: "#1A2B4C", stock: 12 },
        { size: "34", color: "Raw Indigo", colorHex: "#1A2B4C", stock: 8 },
        { size: "36", color: "Raw Indigo", colorHex: "#1A2B4C", stock: 4 },
      ],
    },
    {
      name: "Washed Relaxed Taper Denim",
      slug: "washed-relaxed-taper-denim",
      sku: "LEG-DN-002",
      categoryId: denimId,
      price: 260,
      comparePrice: null,
      stock: 25,
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      description:
        "Artisanal vintage stone-wash with subtle hand-whiskering. Relaxed through hip and thigh with a modern neat taper toward the shoe opening.",
      details:
        "100% Ring-Spun Cotton (13oz). Eco-enzyme wash process. Deerskin leather patch. Made in Okayama, Japan.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
          altText: "Washed Relaxed Taper Denim - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop",
          altText: "Washed Relaxed Taper Denim - Angle",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Vintage Blue", colorHex: "#59708D", stock: 5 },
        { size: "32", color: "Vintage Blue", colorHex: "#59708D", stock: 10 },
        { size: "34", color: "Vintage Blue", colorHex: "#59708D", stock: 7 },
        { size: "36", color: "Vintage Blue", colorHex: "#59708D", stock: 3 },
      ],
    },
    {
      name: "Ecru Loomstate Selvedge Jean",
      slug: "ecru-loomstate-selvedge-jean",
      sku: "LEG-DN-003",
      categoryId: denimId,
      price: 275,
      comparePrice: 315,
      stock: 18,
      isPublished: true,
      isFeatured: false,
      isNewArrival: true,
      description:
        "Unbleached seeded natural ecru denim woven on antique shuttle looms. Shows natural cotton seed flecks throughout for rich tactile depth.",
      details:
        "100% Unbleached Organic Cotton (13.5oz). Red-line selvedge tick. Vegetable tanned leather waistband patch. Made in Japan.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1200&auto=format&fit=crop",
          altText: "Ecru Loomstate Selvedge Jean - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop",
          altText: "Ecru Loomstate Selvedge Jean - Texture",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Natural Ecru", colorHex: "#ECE7DD", stock: 4 },
        { size: "32", color: "Natural Ecru", colorHex: "#ECE7DD", stock: 8 },
        { size: "34", color: "Natural Ecru", colorHex: "#ECE7DD", stock: 4 },
        { size: "36", color: "Natural Ecru", colorHex: "#ECE7DD", stock: 2 },
      ],
    },
    {
      name: "Matte Jet Black Selvedge Denim",
      slug: "matte-jet-black-selvedge-denim",
      sku: "LEG-DN-004",
      categoryId: denimId,
      price: 295,
      comparePrice: null,
      stock: 20,
      isPublished: true,
      isFeatured: true,
      isNewArrival: false,
      description:
        "Sulphur-dyed warp and weft for a deep, impenetrable jet-black shade that fades into subtle monochromatic grey high points over years of wear.",
      details:
        "100% Supima Cotton Selvedge (14oz). Black oxide coated hardware. Matte black leather patch. Made in Okayama, Japan.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop",
          altText: "Matte Jet Black Selvedge Denim - Front",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop",
          altText: "Matte Jet Black Selvedge Denim - Angle",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { size: "30", color: "Jet Black", colorHex: "#0D0D0D", stock: 5 },
        { size: "32", color: "Jet Black", colorHex: "#0D0D0D", stock: 8 },
        { size: "34", color: "Jet Black", colorHex: "#0D0D0D", stock: 5 },
        { size: "36", color: "Jet Black", colorHex: "#0D0D0D", stock: 2 },
      ],
    },
  ];

  for (const p of productsData) {
    const { images, variants, ...prodData } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...prodData,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
      },
    });
    console.log(`Created product: ${createdProduct.name} (${createdProduct.sku})`);
  }

  console.log(`Successfully seeded ${productsData.length} multiple products!`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
