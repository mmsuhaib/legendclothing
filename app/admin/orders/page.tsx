"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  Edit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  ExternalLink,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  total: number;
  shippingAddress: string;
  city: string;
  country: string;
  trackingNumber?: string | null;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    variantInfo?: string | null;
  }[];
}

const ALL_STATUSES = [
  "Pending Payment",
  "Payment Review",
  "Payment Confirmed",
  "Processing",
  "Ready to Ship",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Payment Rejected",
];

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "Payment Confirmed":
    case "Delivered":
      return "bg-[#F0FDF4] text-[#2A6B46] border-[#BBF7D0]";
    case "Payment Review":
    case "Processing":
      return "bg-[#FAF4EB] text-[#9B783E] border-[#EAD7BA]";
    case "Ready to Ship":
    case "Shipped":
      return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
    case "Cancelled":
    case "Payment Rejected":
      return "bg-[#FFF5F5] text-[#9B2C2C] border-[#FED7D7]";
    case "Pending Payment":
    default:
      return "bg-[#FAF8F5] text-[#66635F] border-[#E8E5E0]";
  }
};

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Inline row status updating state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Edit modal (for tracking & status)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleInlineStatusChange = async (order: Order, newStatus: string) => {
    if (order.status === newStatus) return;
    setUpdatingOrderId(order.id);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
      toast(`Order #${order.orderNumber} updated to ${newStatus}`, "success");
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "Error updating order status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditTracking(order.trackingNumber || "");
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          trackingNumber: editTracking || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id
            ? { ...o, status: editStatus, trackingNumber: editTracking || null }
            : o
        )
      );

      toast(`Order #${editingOrder.orderNumber} updated successfully`, "success");
      setEditingOrder(null);
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "Error updating order", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete order");
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      toast(`Order #${orderToDelete.orderNumber} deleted successfully`, "success");
      setOrderToDelete(null);
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "Error deleting order", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (selectedStatus === "ALL") return true;
    return o.status === selectedStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5E0]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
            Fulfillment & Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-[#121212] mt-0.5">
            Orders Pipeline
          </h1>
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-[#E8E5E0] px-4 py-2 text-xs uppercase tracking-wider text-[#121212] focus:outline-none"
        >
          <option value="ALL">All Statuses ({orders.length})</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s} ({orders.filter((o) => o.status === s).length})
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E5E0]">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#9B783E]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8E8B85]">
            No orders found matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E5E0] text-[10px] uppercase tracking-wider text-[#8E8B85]">
                  <th className="p-4 font-semibold">Order</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Tracking #</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0]">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]/80">
                    <td className="p-4 font-mono font-medium text-[#121212]">
                      <Link
                        href={`/order/${order.orderNumber}`}
                        className="hover:text-[#9B783E] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#121212]">{order.customerName}</div>
                      <div className="text-[11px] text-[#66635F]">
                        {order.city}, {order.country}
                      </div>
                    </td>
                    <td className="p-4 text-[#66635F]">
                      {order.items.map((i) => (
                        <div key={i.id} className="truncate max-w-[200px]">
                          {i.quantity}x {i.productName} ({i.variantInfo || "Std"})
                        </div>
                      ))}
                    </td>
                    <td className="p-4 font-semibold text-[#121212]">
                      LKR {Math.round(order.total).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {/* Put Status directly in the row */}
                      <div className="relative inline-flex items-center">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          onChange={(e) => handleInlineStatusChange(order, e.target.value)}
                          className={`appearance-none cursor-pointer pr-7 pl-2.5 py-1.5 text-[10px] uppercase font-semibold border rounded-none transition-colors focus:outline-none focus:ring-1 focus:ring-[#9B783E] disabled:opacity-50 ${getStatusBadgeStyle(
                            order.status
                          )}`}
                          title="Change order status"
                        >
                          {ALL_STATUSES.map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-white text-[#121212] py-1 font-sans"
                            >
                              {s}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                          {updatingOrderId === order.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-[#8E8B85]" />
                          ) : (
                            <ChevronDown className="w-3 h-3 opacity-60 text-current" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#66635F]">
                      {order.trackingNumber || "—"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Link
                          href={`/order/${order.orderNumber}`}
                          target="_blank"
                          title="View Order Details Page"
                          className="p-1.5 border border-[#E8E5E0] hover:border-[#121212] text-[#8E8B85] hover:text-[#121212] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(order)}
                          title="Edit Tracking & Status Details"
                          className="px-2.5 py-1.5 border border-[#E8E5E0] hover:border-[#121212] text-xs uppercase tracking-wider font-semibold text-[#121212] flex items-center gap-1.5 transition-colors"
                        >
                          <Truck className="w-3 h-3 text-[#8E8B85]" />
                          <span className="hidden md:inline">Track</span>
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          title="Delete Order"
                          className="p-1.5 border border-[#E8E5E0] hover:border-[#9B2C2C] text-[#8E8B85] hover:text-[#9B2C2C] hover:bg-[#FFF5F5] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Status & Tracking Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E8E5E0] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5E0]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8E8B85]">
                  Order Fulfillment
                </span>
                <h3 className="text-base font-semibold text-[#121212]">
                  Manage #{editingOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 text-[#8E8B85] hover:text-[#121212]"
              >
                <X className="w-5 h-5 stroke-1" />
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
                Update Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs uppercase tracking-wider text-[#121212]"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
                Carrier Tracking Number
              </label>
              <input
                type="text"
                value={editTracking}
                onChange={(e) => setEditTracking(e.target.value)}
                placeholder="e.g. DHL-94821039 or FEDEX-819203"
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs font-mono text-[#121212]"
              />
            </div>

            <div className="pt-3 border-t border-[#E8E5E0] flex justify-end gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 border border-[#E8E5E0] text-xs uppercase tracking-wider text-[#121212]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={updating}
                className="px-6 py-2 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9B783E] disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E8E5E0] p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#FFF5F5] text-[#9B2C2C] border border-[#FED7D7] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-wider text-[#8E8B85]">
                  Confirm Deletion
                </span>
                <h3 className="text-base font-semibold text-[#121212] mt-0.5">
                  Delete Order #{orderToDelete.orderNumber}?
                </h3>
                <p className="text-xs text-[#66635F] mt-1.5 leading-relaxed">
                  Are you sure you want to delete this order for{" "}
                  <span className="font-semibold text-[#121212]">
                    {orderToDelete.customerName}
                  </span>{" "}
                  (LKR {Math.round(orderToDelete.total).toLocaleString()})? This will permanently remove the order record, line items, and payment details. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E5E0] flex justify-end gap-2.5">
              <button
                onClick={() => setOrderToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 border border-[#E8E5E0] text-xs uppercase tracking-wider text-[#121212] hover:border-[#121212] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="px-5 py-2 bg-[#9B2C2C] hover:bg-[#7E2424] text-white text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleting ? "Deleting..." : "Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
