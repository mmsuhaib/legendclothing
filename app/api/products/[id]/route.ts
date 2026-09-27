import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        variants: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Also fetch related products in the same category
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isPublished: true,
      },
      take: 4,
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    const headers = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };
    return NextResponse.json({ ...product, related }, { headers });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required to edit products." },
        { status: 401 }
      );
    }

    const params = await props.params;
    const { id } = params;
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

    // Use transaction to update product, images, and variants
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          sku,
          description,
          details,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          stock: parseInt(stock, 10),
          categoryId,
          isPublished,
          isFeatured,
          isNewArrival,
        },
      });

      // 2. If images are provided, recreate them
      if (images && Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: any, idx: number) => ({
              productId: id,
              url: img.url,
              altText: img.altText || `${name} view ${idx + 1}`,
              order: idx,
              isPrimary: img.isPrimary || idx === 0,
            })),
          });
        }
      }

      // 3. If variants are provided, update them
      if (variants && Array.isArray(variants)) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v: any) => ({
              productId: id,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex || "#121212",
              stock: parseInt(v.stock, 10) || 10,
              priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
            })),
          });
        }
      }

      return product;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required to delete products." },
        { status: 401 }
      );
    }

    const params = await props.params;
    const { id } = params;


    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.orderItem.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
