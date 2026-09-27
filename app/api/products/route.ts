import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort"); // "newest", "price_asc", "price_desc", "popular"
    const featured = searchParams.get("featured");
    const newArrival = searchParams.get("newArrival");
    const size = searchParams.get("size");
    const color = searchParams.get("color");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const wantAdmin = searchParams.get("admin") === "true";

    let includeUnpublished = false;
    if (wantAdmin) {
      const admin = await getAdminSession();
      if (admin) {
        includeUnpublished = true;
      }
    }

    const where: any = {};

    if (!includeUnpublished) {
      where.isPublished = true;
    }


    if (categorySlug && categorySlug !== "all") {
      const slugNorm = categorySlug.toLowerCase().trim().replace(/[\s_]+/g, "-");
      where.category = {
        OR: [
          { slug: categorySlug },
          { slug: slugNorm },
          { name: { equals: categorySlug } },
        ],
      };
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (newArrival === "true") {
      where.isNewArrival = true;
    }

    if (minPrice || maxPrice) {
      const parsedMin = minPrice ? parseFloat(minPrice) : NaN;
      const parsedMax = maxPrice ? parseFloat(maxPrice) : NaN;
      if (Number.isFinite(parsedMin) || Number.isFinite(parsedMax)) {
        where.price = {};
        if (Number.isFinite(parsedMin)) where.price.gte = parsedMin;
        if (Number.isFinite(parsedMax)) where.price.lte = parsedMax;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (size) {
      where.variants = {
        some: {
          size: { equals: size },
        },
      };
    }

    if (color) {
      where.variants = {
        some: {
          color: { equals: color },
        },
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "popular") {
      orderBy = { isFeatured: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        variants: true,
      },
    });

    const headers = includeUnpublished
      ? { "Cache-Control": "no-store, must-revalidate" }
      : { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

    return NextResponse.json(products, { headers });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required to create products." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      slug,
      sku,
      description,
      details,
      price,
      comparePrice,
      stock,
      categoryId,
      isPublished,
      isFeatured,
      isNewArrival,
      images,
      variants,
    } = body;

    if (!name || !sku || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, SKU, Price, and Category are required" },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        sku,
        description: description || "",
        details: details || "",
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock, 10) || 10,
        categoryId,
        isPublished: isPublished ?? true,
        isFeatured: isFeatured ?? false,
        isNewArrival: isNewArrival ?? false,
        images: images?.length
          ? {
              create: images.map((img: any, idx: number) => ({
                url: img.url,
                altText: img.altText || `${name} view ${idx + 1}`,
                order: idx,
                isPrimary: idx === 0,
              })),
            }
          : undefined,
        variants: variants?.length
          ? {
              create: variants.map((v: any) => ({
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || "#121212",
                stock: parseInt(v.stock, 10) || 10,
                priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required to delete products." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const queryId = searchParams.get("id");

    let idsToDelete: string[] = [];

    if (queryId) {
      idsToDelete = [queryId];
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.ids && Array.isArray(body.ids)) {
        idsToDelete = body.ids;
      } else if (body.id) {
        idsToDelete = [body.id];
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No product IDs provided for deletion" },
        { status: 400 }
      );
    }

    // Execute atomic delete with child records cleanup
    const deletedCount = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: { productId: { in: idsToDelete } },
      });
      await tx.productVariant.deleteMany({
        where: { productId: { in: idsToDelete } },
      });
      await tx.cartItem.deleteMany({
        where: { productId: { in: idsToDelete } },
      });
      await tx.orderItem.deleteMany({
        where: { productId: { in: idsToDelete } },
      });
      await tx.review.deleteMany({
        where: { productId: { in: idsToDelete } },
      });
      const res = await tx.product.deleteMany({
        where: { id: { in: idsToDelete } },
      });
      return res.count;
    });

    return NextResponse.json({ success: true, count: deletedCount });
  } catch (error: any) {
    console.error("Failed to delete products:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete products" },
      { status: 500 }
    );
  }
}

