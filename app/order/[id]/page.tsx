"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Truck,
  Building2,
  UploadCloud,
  FileText,
  Copy,
  ExternalLink,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

// WhatsApp Brand Icon component
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.301-.15-1.782-.88-2.059-.98-.277-.1-.479-.15-.68.15-.202.301-.782.98-.958 1.181-.177.202-.353.226-.654.076-.301-.15-1.272-.469-2.423-1.497-.897-.8-1.503-1.789-1.68-2.09-.176-.301-.019-.464.132-.614.136-.134.301-.351.452-.527.151-.176.202-.301.302-.502.1-.201.05-.377-.025-.527-.075-.151-.68-1.637-.932-2.243-.245-.59-.494-.51-.68-.52l-.578-.01c-.201 0-.528.075-.805.376-.276.302-1.056 1.031-1.056 2.515 0 1.484 1.082 2.916 1.233 3.117.15.201 2.129 3.251 5.158 4.56.72.312 1.282.498 1.721.637.724.23 1.383.197 1.904.12.58-.087 1.782-.728 2.033-1.432.251-.704.251-1.307.176-1.432-.076-.125-.277-.2-.578-.351zM12.056 21.685c-1.748 0-3.46-.46-4.97-1.332l-.356-.211-3.696.97.986-3.604-.232-.369A9.626 9.626 0 012.399 12.06c0-5.334 4.34-9.674 9.677-9.674 2.583 0 5.011 1.006 6.837 2.833a9.614 9.614 0 012.834 6.84c0 5.336-4.341 9.676-9.68 9.676zm8.17-17.848A11.56 11.56 0 0012.056.442C5.64.442.417 5.665.417 12.08c0 2.05.536 4.053 1.554 5.821L.05 23.95l6.236-1.636a11.59 11.59 0 005.77 1.528h.005c6.415 0 11.638-5.223 11.638-11.64 0-3.11-1.21-6.033-3.473-8.065z" />
    </svg>
  );
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: string;
  apartment?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  trackingNumber?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    productImage?: string | null;
    variantInfo?: string | null;
    size?: string | null;
    color?: string | null;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  payment?: {
    method: string;
    amount: number;
    status: string;
    receipts?: {
      id: string;
      fileUrl: string;
      fileName: string;
      fileType: string;
      status: string;
      uploadedAt: string;
      notes?: string | null;
    }[];
  };
}

const TIMELINE_STEPS = [
  { key: "Pending Payment", label: "Pending Payment" },
  { key: "Payment Review", label: "Payment Review" },
  { key: "Payment Confirmed", label: "Payment Confirmed" },
  { key: "Processing", label: "Processing" },
  { key: "Ready to Ship", label: "Ready to Ship" },
  { key: "Shipped", label: "Shipped" },
  { key: "Delivered", label: "Delivered" },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [storeWhatsApp, setStoreWhatsApp] = useState("+15550192834");
  const [loading, setLoading] = useState(true);

  // Load configured store WhatsApp number from CMS if available
  useEffect(() => {
    fetch("/api/cms")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.whatsapp_number) {
          setStoreWhatsApp(data.whatsapp_number);
        }
      })
      .catch(() => { });
  }, []);

  // Re-upload state for rejected payments
  const [newReceiptFile, setNewReceiptFile] = useState<File | null>(null);
  const [reuploading, setReuploading] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (e) {
      console.error("Failed to load order", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      toast("Order number copied to clipboard", "success");
    }
  };

  const handleReuploadReceipt = async () => {
    if (!newReceiptFile || !order) {
      toast("Please select a valid receipt file", "error");
      return;
    }

    setReuploading(true);
    try {
      // 1. Upload new receipt file
      const uploadForm = new FormData();
      uploadForm.append("file", newReceiptFile);
      uploadForm.append("type", "receipts");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload new receipt");
      const uploadData = await uploadRes.json();

      // 2. Put order update
      const updateRes = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newReceiptUrl: uploadData.url,
          newReceiptFileName: uploadData.fileName,
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to submit updated receipt");

      const updated = await updateRes.json();
      setOrder(updated);
      setNewReceiptFile(null);
      toast("New payment receipt uploaded. Status updated to Payment Review.", "success");
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "Error re-uploading receipt", "error");
    } finally {
      setReuploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-light uppercase tracking-wider text-[#121212]">
          Order Not Found
        </h2>
        <p className="text-xs text-[#66635F] mt-2">
          We could not find an order matching #{id}.
        </p>
        <Link
          href="/order/track"
          className="mt-6 px-8 py-3.5 bg-[#121212] text-white text-xs uppercase tracking-widest hover:bg-[#9B783E]"
        >
          Track Another Order
        </Link>
      </div>
    );
  }

  // Calculate current stage index in timeline
  const isRejected = order.status === "Payment Rejected";
  const isCancelled = order.status === "Cancelled";
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Status Header */}
        <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5E0] pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
                Order Status Tracking
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#121212]">
                  {order.orderNumber}
                </h1>
                <button
                  onClick={copyOrderNumber}
                  className="p-1.5 text-[#8E8B85] hover:text-[#121212] border border-[#E8E5E0] bg-[#FAF8F5]"
                  title="Copy Order ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-[#66635F] mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Current Status Pill & WhatsApp Action */}
            <div className="flex flex-col sm:items-end gap-2.5">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${order.status === "Payment Confirmed" || order.status === "Delivered"
                  ? "bg-[#F0FDF4] text-[#2A6B46] border border-[#DCFCE7]"
                  : order.status === "Payment Review" || order.status === "WhatsApp Order"
                    ? "bg-[#FAF4EB] text-[#9B783E] border border-[#F0E4D0]"
                    : order.status === "Payment Rejected"
                      ? "bg-[#FFF5F5] text-[#9B2C2C] border border-[#FED7D7]"
                      : "bg-[#FAF8F5] text-[#121212] border border-[#E8E5E0]"
                  }`}
              >
                {order.status === "WhatsApp Order" && <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />}
                {order.status === "Payment Review" && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                {order.status === "Payment Confirmed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {order.status === "Payment Rejected" && <AlertTriangle className="w-3.5 h-3.5" />}
                {order.status}
              </span>

              {/* Direct WhatsApp Concierge Chat Link */}
              <a
                href={`https://wa.me/${storeWhatsApp.replace(/\D/g, "") || "15550192834"}?text=${encodeURIComponent(
                  `Hello LEGEND Team, I am following up on my Order #${order.orderNumber}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-semibold uppercase tracking-wider rounded-[2px] shadow-xs hover:shadow-sm transition-all"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>

              {order.trackingNumber && (
                <span className="text-xs text-[#66635F]">
                  Tracking #: <strong className="text-[#121212] font-mono">{order.trackingNumber}</strong>
                </span>
              )}
            </div>
          </div>

          {/* PAYMENT REJECTED NOTICE + RE-UPLOAD */}
          {isRejected && (
            <div className="mt-6 p-5 bg-[#FFF5F5] border border-[#FED7D7] text-xs space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#9B2C2C] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold uppercase tracking-wider text-[#9B2C2C]">
                    Payment Verification Unsuccessful
                  </h3>
                  <p className="text-[#742A2A] leading-relaxed">
                    Reason from Atelier Treasury:{" "}
                    <strong>
                      &ldquo;{order.rejectionReason || "Receipt amount or reference does not match order."}&rdquo;
                    </strong>
                  </p>
                  <p className="text-[#742A2A]">
                    Please upload a corrected transfer receipt below to resubmit your order for immediate review.
                  </p>
                </div>
              </div>

              {/* Re-upload Form */}
              <div className="pt-3 border-t border-[#FED7D7] flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setNewReceiptFile(e.target.files?.[0] || null)}
                  className="text-xs text-[#121212]"
                />
                <button
                  onClick={handleReuploadReceipt}
                  disabled={!newReceiptFile || reuploading}
                  className="px-6 py-2.5 bg-[#9B2C2C] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#822424] disabled:opacity-50 flex items-center gap-2"
                >
                  {reuploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Corrected Receipt
                </button>
              </div>
            </div>
          )}

          {/* 14. ORDER STATUS TIMELINE */}
          {!isRejected && !isCancelled && (
            <div className="mt-8 pt-2">
              <div className="relative">
                {/* Horizontal Progress bar for desktop */}
                <div className="hidden md:block absolute top-4 inset-x-8 h-0.5 bg-[#E8E5E0] -z-0">
                  <div
                    className="h-full bg-[#9B783E] transition-all duration-700"
                    style={{
                      width: `${currentStepIndex >= 0
                        ? (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100
                        : 0
                        }%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                  {TIMELINE_STEPS.map((stepItem, idx) => {
                    const isPassed = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div
                        key={stepItem.key}
                        className="flex flex-col md:items-center text-left md:text-center relative z-10"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${isPassed
                            ? "bg-[#121212] text-white"
                            : "bg-white border border-[#D8D4CD] text-[#8E8B85]"
                            } ${isCurrent ? "ring-4 ring-[#9B783E]/20 border-[#9B783E]" : ""}`}
                        >
                          {isPassed ? "✓" : idx + 1}
                        </div>
                        <span
                          className={`text-[11px] uppercase tracking-wider mt-2.5 ${isCurrent
                            ? "font-bold text-[#121212]"
                            : isPassed
                              ? "font-medium text-[#121212]"
                              : "text-[#8E8B85]"
                            }`}
                        >
                          {stepItem.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items Purchased (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212] pb-3 border-b border-[#E8E5E0]">
              Pieces in this Order ({order.items.reduce((a, b) => a + b.quantity, 0)})
            </h2>

            <div className="divide-y divide-[#E8E5E0]">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="relative w-16 h-20 bg-[#F4F1EA] border border-[#E8E5E0] shrink-0 overflow-hidden">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-[#8E8B85] m-auto" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-[#121212]">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] text-[#8E8B85] mt-0.5">
                      {item.variantInfo || `Size: ${item.size || "Standard"}`}
                    </p>
                    <p className="text-[11px] text-[#66635F]">
                      Quantity: {item.quantity} × LKR {Math.round(item.price).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#121212]">
                    LKR {Math.round(item.subtotal).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-[#E8E5E0] space-y-2 text-xs">
              <div className="flex justify-between text-[#66635F]">
                <span>Subtotal</span>
                <span>LKR {Math.round(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#66635F]">
                <span>Courier Shipping</span>
                <span>{order.shippingFee === 0 ? "Complimentary" : `LKR ${Math.round(order.shippingFee ?? 0).toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#121212] pt-2 border-t border-[#E8E5E0]">
                <span>Total Amount</span>
                <span>LKR {Math.round(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Information (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white border border-[#E8E5E0] p-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212] pb-2 border-b border-[#E8E5E0]">
                Delivery Destination
              </h3>
              <div className="text-xs text-[#66635F] space-y-1">
                <p className="font-semibold text-[#121212]">{order.customerName}</p>
                <p>{order.shippingAddress}</p>
                {order.apartment && <p>{order.apartment}</p>}
                <p>
                  {order.city}
                  {order.state ? `, ${order.state}` : ""} {order.postalCode || ""}
                </p>
                <p>{order.country}</p>
                <p className="pt-2 text-[#8E8B85]">{order.customerEmail}</p>
                <p className="text-[#8E8B85]">{order.customerPhone}</p>
              </div>
            </div>

            {/* Bank Transfer Details & Uploaded Receipts */}
            <div className="bg-white border border-[#E8E5E0] p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212] pb-2 border-b border-[#E8E5E0]">
                Bank Transfer Proof
              </h3>

              <div className="text-xs space-y-2 text-[#66635F]">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-medium text-[#121212]">Wire Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span>Transfer Status</span>
                  <span className="font-semibold text-[#9B783E]">
                    {order.payment?.status || "UNDER_REVIEW"}
                  </span>
                </div>
              </div>

              {/* Uploaded receipt slips list */}
              {order.payment?.receipts && order.payment.receipts.length > 0 && (
                <div className="pt-3 border-t border-[#E8E5E0] space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#8E8B85] block">
                    Submitted Proofs of Payment
                  </span>
                  {order.payment.receipts.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-[#FAF8F5] border border-[#E8E5E0] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[#9B783E] shrink-0" />
                        <span className="truncate">{rec.fileName}</span>
                      </div>
                      <a
                        href={rec.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#9B783E] hover:underline flex items-center gap-1 shrink-0 ml-2"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Continue Shopping CTA */}
            <div className="text-center pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#121212] hover:text-[#9B783E] font-medium"
              >
                Continue Exploring LEGEND Clothing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
