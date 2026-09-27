"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  AlertTriangle,
  ExternalLink,
  Loader2,
  X,
  Search,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

interface Receipt {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  status: string;
  uploadedAt: string;
  notes?: string | null;
}

interface OrderPayment {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  total: number;
  createdAt: string;
  rejectionReason?: string | null;
  payment?: {
    id: string;
    amount: number;
    status: string;
    referenceCode?: string | null;
    rejectionReason?: string | null;
    receipts?: Receipt[];
  } | null;
}

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("Payment Review"); // default show pending queue!

  // Receipt Lightbox Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<{
    url: string;
    name: string;
    type: string;
    orderNumber: string;
  } | null>(null);

  // Reject Modal State
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to load payment orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId: string) => {
    if (!confirm("Are you sure you want to approve this bank transfer receipt?")) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "approve",
          adminName: "Arthur Vance (Treasury)",
        }),
      });

      if (!res.ok) throw new Error("Failed to approve payment");

      toast("Payment approved successfully. Order is now Confirmed.", "success");
      fetchOrders();
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "Error approving payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingOrderId || !rejectionReason.trim()) {
      toast("Please provide a reason for rejecting the receipt", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: rejectingOrderId,
          action: "reject",
          rejectionReason,
          adminName: "Arthur Vance (Treasury)",
        }),
      });

      if (!res.ok) throw new Error("Failed to reject payment");

      toast("Payment marked as Rejected. Customer can now upload a new receipt.", "success");
      setRejectingOrderId(null);
      setRejectionReason("");
      fetchOrders();
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "Error rejecting payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "ALL") return true;
    return o.status === filterStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5E0]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#9B783E] font-medium">
            Treasury & Audit
          </span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-[#121212] mt-0.5">
            Payment Verification
          </h1>
          <p className="text-xs text-[#66635F] mt-1">
            Review and authenticate direct wire transfer receipts uploaded by clients.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Review Queue", val: "Payment Review" },
            { label: "Confirmed", val: "Payment Confirmed" },
            { label: "Rejected", val: "Payment Rejected" },
            { label: "All Orders", val: "ALL" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilterStatus(f.val)}
              className={`px-3.5 py-2 text-xs uppercase tracking-wider font-semibold border transition-colors ${
                filterStatus === f.val
                  ? "bg-[#121212] text-white border-[#121212]"
                  : "bg-white text-[#66635F] border-[#E8E5E0] hover:border-[#121212]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Table */}
      <div className="bg-white border border-[#E8E5E0] shadow-xs">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#9B783E]" />
            <p className="text-xs uppercase tracking-wider text-[#8E8B85] mt-3">
              Loading verification records...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#2A6B46] mx-auto mb-3 stroke-1" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#121212]">
              Queue Clear
            </h3>
            <p className="text-xs text-[#66635F] mt-1">
              No orders currently require payment review under &ldquo;{filterStatus}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E5E0] text-[10px] uppercase tracking-wider text-[#8E8B85]">
                  <th className="p-4 font-semibold">Order</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Receipt</th>
                  <th className="p-4 font-semibold">Submitted</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0]">
                {filteredOrders.map((order) => {
                  const latestReceipt = order.payment?.receipts?.[0];
                  const hasReceipt = Boolean(latestReceipt);

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Order Number */}
                      <td className="p-4 font-mono font-medium text-[#121212]">
                        <Link
                          href={`/order/${order.orderNumber}`}
                          className="hover:text-[#9B783E] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-semibold text-[#121212]">{order.customerName}</div>
                        <div className="text-[11px] text-[#66635F]">{order.customerEmail}</div>
                        <div className="text-[10px] text-[#8E8B85]">{order.customerPhone}</div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-semibold text-sm text-[#121212]">
                        LKR {Math.round(order.total).toLocaleString()}
                      </td>

                      {/* Receipt Preview */}
                      <td className="p-4">
                        {hasReceipt ? (
                          <div className="flex items-center gap-2">
                            {latestReceipt?.fileUrl.endsWith(".pdf") ? (
                              <div className="w-9 h-12 bg-[#F4F1EA] border border-[#E8E5E0] flex flex-col items-center justify-center text-[#9B783E]">
                                <FileText className="w-4 h-4" />
                                <span className="text-[8px] font-bold uppercase">PDF</span>
                              </div>
                            ) : (
                              <div className="relative w-9 h-12 bg-[#F4F1EA] border border-[#E8E5E0] overflow-hidden">
                                <Image
                                  src={latestReceipt!.fileUrl}
                                  alt="Receipt thumbnail"
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              </div>
                            )}

                            <button
                              onClick={() =>
                                setSelectedReceipt({
                                  url: latestReceipt!.fileUrl,
                                  name: latestReceipt!.fileName,
                                  type: latestReceipt!.fileType,
                                  orderNumber: order.orderNumber,
                                })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9B783E] hover:underline p-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8E8B85] italic">
                            No receipt attached
                          </span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="p-4 text-[#66635F] text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] uppercase font-semibold ${
                            order.status === "Payment Confirmed"
                              ? "bg-[#F0FDF4] text-[#2A6B46] border border-[#DCFCE7]"
                              : order.status === "Payment Review"
                              ? "bg-[#FAF4EB] text-[#9B783E] border border-[#F0E4D0]"
                              : order.status === "Payment Rejected"
                              ? "bg-[#FFF5F5] text-[#9B2C2C] border border-[#FED7D7]"
                              : "bg-[#FAF8F5] text-[#121212] border border-[#E8E5E0]"
                          }`}
                        >
                          {order.status}
                        </span>

                        {order.rejectionReason && (
                          <p className="text-[10px] text-[#9B2C2C] mt-1 max-w-xs line-clamp-2">
                            Reason: {order.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        {order.status === "Payment Review" ? (
                          <>
                            <button
                              onClick={() => handleApprove(order.id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-[#2A6B46] text-white text-xs uppercase font-semibold tracking-wider hover:bg-[#205235] transition-colors inline-flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>

                            <button
                              onClick={() => {
                                setRejectingOrderId(order.id);
                                setRejectionReason("");
                              }}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-[#9B2C2C] text-white text-xs uppercase font-semibold tracking-wider hover:bg-[#7D2323] transition-colors inline-flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        ) : order.status === "Payment Confirmed" ? (
                          <span className="text-[11px] text-[#2A6B46] font-medium">
                            ✓ Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="text-[11px] text-[#8E8B85] hover:text-[#121212] underline"
                          >
                            Re-verify
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Receipt Lightbox Viewer Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white border border-[#E8E5E0] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5E0]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8E8B85]">
                  Wire Transfer Receipt Audit
                </span>
                <h3 className="text-sm font-semibold text-[#121212]">
                  Order #{selectedReceipt.orderNumber} — {selectedReceipt.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-[#121212] hover:opacity-60"
              >
                <X className="w-5 h-5 stroke-1" />
              </button>
            </div>

            {/* Document display */}
            <div className="relative w-full h-[55vh] sm:h-[65vh] bg-[#FAF8F5] border border-[#E8E5E0] flex items-center justify-center overflow-hidden">
              {selectedReceipt.url.endsWith(".pdf") ? (
                <iframe
                  src={selectedReceipt.url}
                  className="w-full h-full"
                  title="PDF Receipt Viewer"
                />
              ) : (
                <Image
                  src={selectedReceipt.url}
                  alt={selectedReceipt.name}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={selectedReceipt.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#9B783E] hover:underline flex items-center gap-1 uppercase tracking-wider font-semibold"
              >
                Open in new tab <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-6 py-2 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9B783E]"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Rejection Reason Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E8E5E0] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5E0]">
              <div className="flex items-center gap-2 text-[#9B2C2C]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Reject Bank Transfer
                </h3>
              </div>
              <button
                onClick={() => setRejectingOrderId(null)}
                className="p-1 text-[#8E8B85] hover:text-[#121212]"
              >
                <X className="w-5 h-5 stroke-1" />
              </button>
            </div>

            <p className="text-xs text-[#66635F]">
              Please state why this receipt is being rejected. The customer will be
              prompted on their order tracking page with this message and given the
              ability to upload a new receipt.
            </p>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[#8E8B85]">
                Quick Reason Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Receipt amount does not match the order total.",
                  "Reference code is missing or incorrect.",
                  "Payment slip image is blurry or unreadable.",
                  "Beneficiary bank account details do not match.",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="text-[11px] p-2 bg-[#FAF8F5] border border-[#E8E5E0] hover:border-[#121212] text-left text-[#121212]"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
                Rejection Reason (Required) *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
                placeholder="Enter specific details for the customer..."
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#9B2C2C]"
              />
            </div>

            <div className="pt-3 border-t border-[#E8E5E0] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="px-4 py-2 border border-[#E8E5E0] text-xs uppercase tracking-wider text-[#121212]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || actionLoading}
                className="px-6 py-2 bg-[#9B2C2C] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#7D2323] disabled:opacity-50"
              >
                {actionLoading ? "Submitting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
