import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const email = searchParams.get("email");
    const orderNumber = searchParams.get("orderNumber");
    const userId = searchParams.get("userId");

    const admin = await getAdminSession();
    const customer = await getCustomerSession();

    // Authorization check:
    // 1. Admins have global read access with all filters.
    // 2. Logged-in customers can only query their own orders (matching session userId).
    // 3. Anonymous callers are denied.
    if (!admin) {
      if (!customer) {
        return NextResponse.json(
          { error: "Unauthorized: Please sign in to view orders." },
          { status: 401 }
        );
      }
      if (!userId || userId !== customer.id) {
        return NextResponse.json(
          { error: "Forbidden: You are only authorized to view your own orders." },
          { status: 403 }
        );
      }
    }

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (email) {
      where.customerEmail = { contains: email };
    }
    if (orderNumber) {
      where.orderNumber = { contains: orderNumber };
    }
    if (userId) {
      where.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payment: {
          include: {
            receipts: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      apartment,
      city,
      state,
      postalCode,
      country,
      items,
      receiptUrl,
      receiptFileName,
      notes,
    } = body;

    if (!customerName || (!customerEmail && !customerPhone) || !items || !items.length) {
      return NextResponse.json(
        { error: "Customer name, contact phone or email, and items are required" },
        { status: 400 }
      );
    }

    // Resolve email (fallback to clean phone-based email for WhatsApp orders if email not provided)
    const finalEmail =
      customerEmail && customerEmail.trim()
        ? customerEmail.trim().toLowerCase()
        : `${(customerPhone || "client").replace(/\D/g, "") || "order"}@whatsapp.legend.com`;

    // 1. Authoritative Server-Side Pricing Lookup from Database
    const productIds = items
      .map((it: any) => it.productId)
      .filter((id: any): id is string => typeof id === "string" && Boolean(id));

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const validatedItems = items.map((item: any) => {
      const dbProd = productMap.get(item.productId);
      let authoritativePrice = 0;
      let productName = item.name || "Maison Garment";

      if (dbProd) {
        authoritativePrice = dbProd.price;
        productName = dbProd.name;

        // Check if a specific variant overrides the price
        if (item.size || item.color) {
          const matchedVariant = dbProd.variants.find(
            (v) =>
              (!item.size || v.size === item.size) &&
              (!item.color || v.color === item.color)
          );
          if (matchedVariant?.priceOverride != null) {
            authoritativePrice = matchedVariant.priceOverride;
          }
        }
      } else {
        // Fallback for custom configured items
        authoritativePrice = Math.max(0, Number(item.price) || 0);
      }

      const itemQty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
      const itemSubtotal = Math.round(authoritativePrice * itemQty * 100) / 100;
      calculatedSubtotal += itemSubtotal;

      return {
        productId: item.productId,
        productName,
        productImage: item.image,
        variantInfo: `Size: ${item.size || "Standard"}, Color: ${item.color || "Standard"}`,
        size: item.size || null,
        color: item.color || null,
        quantity: itemQty,
        price: authoritativePrice,
        subtotal: itemSubtotal,
      };
    });

    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;
    const calculatedShippingFee = calculatedSubtotal >= 250 ? 0.0 : 15.0;
    const calculatedTotal =
      Math.round((calculatedSubtotal + calculatedShippingFee) * 100) / 100;

    // 2. Distinctive, high-entropy collision-free order number
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const orderNumber = `LEG-2026-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    const hasReceipt = Boolean(receiptUrl);
    // Server enforces workflow statuses rather than trusting client parameters
    const initialStatus = hasReceipt ? "Payment Review" : "Pending Payment";
    const paymentStatus = hasReceipt ? "UNDER_REVIEW" : "PENDING";
    const paymentMethod =
      body.paymentMethod === "CASH_ON_DELIVERY"
        ? "CASH_ON_DELIVERY"
        : hasReceipt
        ? "BANK_TRANSFER"
        : "WHATSAPP";

    // Bind userId to authenticated session if logged in
    const customerSession = await getCustomerSession();
    const finalUserId = customerSession?.id || null;

    // 3. Atomic transaction: create order and decrement inventory
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: finalUserId,
          customerName,
          customerEmail: finalEmail,
          customerPhone: customerPhone || "",
          shippingAddress,
          apartment: apartment || null,
          city,
          state: state || null,
          postalCode: postalCode || null,
          country: country || "Sri Lanka",
          subtotal: calculatedSubtotal,
          shippingFee: calculatedShippingFee,
          total: calculatedTotal,
          status: initialStatus,
          notes: notes || null,
          items: {
            create: validatedItems,
          },
          payment: {
            create: {
              method: paymentMethod,
              amount: calculatedTotal,
              status: paymentStatus,
              referenceCode: orderNumber,
              receipts: hasReceipt
                ? {
                    create: [
                      {
                        fileUrl: receiptUrl,
                        fileName: receiptFileName || "receipt.jpg",
                        fileType: receiptUrl.endsWith(".pdf")
                          ? "application/pdf"
                          : "image/jpeg",
                        status: "SUBMITTED",
                      },
                    ],
                  }
                : undefined,
            },
          },
        },
        include: {
          items: true,
          payment: {
            include: {
              receipts: true,
            },
          },
        },
      });

      // Decrement inventory stock accurately
      for (const item of validatedItems) {
        if (item.productId) {
          await tx.product
            .update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
            .catch(() => null);

          if (item.size || item.color) {
            await tx.productVariant
              .updateMany({
                where: {
                  productId: item.productId,
                  size: item.size || undefined,
                  color: item.color || undefined,
                },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              })
              .catch(() => null);
          }
        }
      }

      // Persist shipping address for customer if requested and user is authenticated
      if (body.saveForNextTime && finalUserId) {
        const existingAddress = await tx.address.findFirst({
          where: { userId: finalUserId },
          orderBy: { updatedAt: "desc" },
        });

        if (existingAddress) {
          await tx.address
            .update({
              where: { id: existingAddress.id },
              data: {
                fullName: customerName,
                streetAddress: shippingAddress,
                city: city || "",
                postalCode: postalCode || "",
                country: country || "Sri Lanka",
                phone: customerPhone || "",
                apartment: apartment || null,
                isDefault: true,
              },
            })
            .catch(() => null);
        } else {
          await tx.address
            .create({
              data: {
                userId: finalUserId,
                fullName: customerName,
                streetAddress: shippingAddress,
                city: city || "",
                postalCode: postalCode || "",
                country: country || "Sri Lanka",
                phone: customerPhone || "",
                apartment: apartment || null,
                isDefault: true,
              },
            })
            .catch(() => null);
        }
      }

      return createdOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

