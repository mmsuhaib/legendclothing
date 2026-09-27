import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { getCustomerSession } from "@/lib/customer-auth";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone || phone.length <= 4) return "***";
  return `${phone.slice(0, 3)} *** *** ${phone.slice(-3)}`;
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        payment: {
          include: {
            receipts: {
              orderBy: { uploadedAt: "desc" },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const admin = await getAdminSession();
    const customer = await getCustomerSession();

    // Privileged access: Administrator or the customer who placed this order
    const isOwnerOrAdmin =
      Boolean(admin) || (Boolean(customer?.id) && order.userId === customer?.id);

    if (isOwnerOrAdmin) {
      return NextResponse.json(order);
    }

    // Guest Order Tracking: Return essential tracking info while masking PII & sensitive slip URLs
    const safeOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customerName.split(" ")[0]} ***`,
      customerEmail: maskEmail(order.customerEmail),
      customerPhone: maskPhone(order.customerPhone),
      status: order.status,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      shippingAddress: `***, ${order.city}`,
      city: order.city,
      country: order.country,
      trackingNumber: order.trackingNumber,
      rejectionReason: order.rejectionReason,
      createdAt: order.createdAt,
      items: order.items,
      payment: order.payment
        ? {
            method: order.payment.method,
            amount: order.payment.amount,
            status: order.payment.status,
            receipts: order.payment.receipts.map((r) => ({
              id: r.id,
              fileName: r.fileName,
              status: r.status,
              uploadedAt: r.uploadedAt,
            })),
          }
        : null,
    };

    return NextResponse.json(safeOrder);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    const {
      status,
      trackingNumber,
      notes,
      rejectionReason,
      // For re-uploading receipt from customer side
      newReceiptUrl,
      newReceiptFileName,
    } = body;

    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: { payment: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const admin = await getAdminSession();
    const customer = await getCustomerSession();

    // If customer re-uploaded a payment receipt
    if (newReceiptUrl) {
      const isAuthorizedToReupload =
        Boolean(admin) ||
        (Boolean(customer?.id) && existingOrder.userId === customer?.id) ||
        !existingOrder.userId; // Guest order re-upload

      if (!isAuthorizedToReupload) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to upload a receipt for this order." },
          { status: 403 }
        );
      }

      if (!existingOrder.payment) {
        return NextResponse.json({ error: "Payment record not found" }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.paymentReceipt.create({
          data: {
            paymentId: existingOrder.payment!.id,
            fileUrl: newReceiptUrl,
            fileName: newReceiptFileName || "reuploaded_receipt.jpg",
            fileType: newReceiptUrl.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
            status: "SUBMITTED",
          },
        });

        await tx.payment.update({
          where: { id: existingOrder.payment!.id },
          data: {
            status: "UNDER_REVIEW",
            rejectionReason: null,
          },
        });

        return tx.order.update({
          where: { id: existingOrder.id },
          data: {
            status: "Payment Review",
            rejectionReason: null,
          },
          include: {
            items: true,
            payment: {
              include: { receipts: { orderBy: { uploadedAt: "desc" } } },
            },
          },
        });
      });

      return NextResponse.json(updated);
    }

    // Changing status, tracking numbers, or internal notes strictly requires an admin session
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required to update order status or coordinates." },
        { status: 401 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: status || existingOrder.status,
        trackingNumber: trackingNumber ?? existingOrder.trackingNumber,
        notes: notes ?? existingOrder.notes,
        rejectionReason: rejectionReason ?? existingOrder.rejectionReason,
      },
      include: {
        items: true,
        payment: {
          include: { receipts: { orderBy: { uploadedAt: "desc" } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update order" },
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
        { error: "Unauthorized: Admin session required to delete orders." },
        { status: 401 }
      );
    }

    const params = await props.params;
    const { id } = params;

    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        payment: {
          include: {
            receipts: true,
          },
        },
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Clean up payment receipts and payment if present
      if (existingOrder.payment) {
        await tx.paymentReceipt.deleteMany({
          where: { paymentId: existingOrder.payment.id },
        });
        await tx.payment.delete({
          where: { id: existingOrder.payment.id },
        });
      }

      // Clean up order items
      await tx.orderItem.deleteMany({
        where: { orderId: existingOrder.id },
      });

      // Delete the order itself
      await tx.order.delete({
        where: { id: existingOrder.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Order #${existingOrder.orderNumber} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}

