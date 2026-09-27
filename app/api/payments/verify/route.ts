import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required to verify payments." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, action, rejectionReason } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: "orderId and action ('approve' | 'reject') are required" },
        { status: 400 }
      );
    }

    if (action === "reject" && !rejectionReason) {
      return NextResponse.json(
        { error: "A rejection reason is required when rejecting payment" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isApprove = action === "approve";

    const updated = await prisma.$transaction(async (tx) => {
      // Update payment record
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: isApprove ? "APPROVED" : "REJECTED",
            verifiedAt: new Date(),
            verifiedBy: admin.name || admin.email,
            rejectionReason: isApprove ? null : rejectionReason,
          },
        });


        // Also update receipts status
        await tx.paymentReceipt.updateMany({
          where: { paymentId: order.payment.id },
          data: {
            status: isApprove ? "APPROVED" : "REJECTED",
            notes: isApprove ? "Verified by Admin" : rejectionReason,
          },
        });
      }

      // Update order status
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: isApprove ? "Payment Confirmed" : "Payment Rejected",
          rejectionReason: isApprove ? null : rejectionReason,
        },
        include: {
          items: true,
          payment: {
            include: { receipts: true },
          },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to verify payment:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
