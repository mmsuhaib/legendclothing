"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  LogOut,
  ChevronRight,
  Loader2,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savedAddress, setSavedAddress] = useState<any>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [user, authLoading, router]);

  // Fetch orders and saved shipping coordinates for this customer
  useEffect(() => {
    if (user?.id) {
      setLoadingOrders(true);
      fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch((err) => console.error("Could not fetch user orders", err))
        .finally(() => setLoadingOrders(false));

      fetch("/api/customer/shipping-address")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.hasSavedAddress && data?.address) {
            setSavedAddress(data.address);
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    await logout();
    toast("Signed out successfully", "success");
    router.push("/");
  };

  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#9B783E]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header banner */}
        <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-[2px] shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E8E5E0] flex items-center justify-center text-[#9B783E] font-serif text-xl font-medium">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9B783E] font-semibold">
                LEGEND Client Profile
              </span>
              <h1 className="text-xl sm:text-2xl font-light uppercase tracking-wider text-[#121212] mt-0.5">
                {user.name || "Valued Client"}
              </h1>
              <p className="text-xs text-[#66635F] mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-[#121212] text-white text-xs uppercase tracking-widest hover:bg-[#9B783E] transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 border border-[#E8E5E0] bg-white text-[#121212] hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main: Order History */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 rounded-[2px] shadow-xs">
              <div className="border-b border-[#E8E5E0] pb-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#9B783E]" />
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212]">
                    Order History ({orders.length})
                  </h2>
                </div>
              </div>

              {loadingOrders ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#9B783E]" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-8 h-8 stroke-1 text-[#8E8B85] mx-auto mb-3" />
                  <p className="text-xs uppercase tracking-wider text-[#121212] font-medium">
                    No orders on record yet
                  </p>
                  <p className="text-xs text-[#66635F] mt-1 max-w-sm mx-auto">
                    When you place an order at checkout, your pieces and delivery tracking will appear here.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block mt-4 text-xs text-[#9B783E] uppercase tracking-wider underline font-medium"
                  >
                    Explore Ready-to-Wear
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E8E5E0]">
                  {orders.map((order) => (
                    <div key={order.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-[#121212] tracking-wider">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[10px] text-[#8E8B85] ml-2 flex-inline items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 inline mr-1" />
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 font-medium rounded-full bg-[#FAF8F5] border border-[#E8E5E0] text-[#121212]">
                            {order.status}
                          </span>
                          <Link
                            href={`/order/${order.orderNumber}`}
                            className="text-xs text-[#9B783E] hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="space-y-1 text-xs text-[#66635F]">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between">
                            <span>
                              {item.quantity}× {item.productName}{" "}
                              {item.size ? `(${item.size})` : ""}
                            </span>
                            <span className="text-[#121212] font-medium">
                              LKR {Math.round(item.subtotal || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-[#F4F1EA] text-xs">
                        <span className="text-[#8E8B85]">Total Amount:</span>
                        <span className="font-semibold text-[#121212]">
                          LKR {Math.round(order.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Profile summary & concierge */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E8E5E0] p-6 space-y-4 rounded-[2px] shadow-xs">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#121212] pb-3 border-b border-[#E8E5E0]">
                Client Profile
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8E8B85] block">
                    Full Name
                  </span>
                  <span className="font-medium text-[#121212]">
                    {user.name || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8E8B85] block">
                    Email Address
                  </span>
                  <span className="font-medium text-[#121212]">{user.email}</span>
                </div>
                {user.phone && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8E8B85] block">
                      Phone / WhatsApp
                    </span>
                    <span className="font-medium text-[#121212]">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Delivery Coordinates */}
            <div className="bg-white border border-[#E8E5E0] p-6 space-y-3 rounded-[2px] shadow-xs">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#121212] pb-3 border-b border-[#E8E5E0] flex items-center justify-between">
                <span>Delivery Coordinates</span>
                <span className="text-[10px] text-[#9B783E] uppercase font-normal">Primary</span>
              </h3>
              {savedAddress ? (
                <div className="text-xs space-y-1 text-[#66635F]">
                  <p className="font-semibold text-[#121212]">
                    {savedAddress.firstName} {savedAddress.lastName}
                  </p>
                  <p>{savedAddress.address}</p>
                  <p>
                    {savedAddress.city}, {savedAddress.postalCode}
                  </p>
                  <p>{savedAddress.country}</p>
                  {savedAddress.contactNo1 && (
                    <p className="pt-1 text-[#8E8B85]">
                      Contact 1: {savedAddress.contactNo1}
                    </p>
                  )}
                  {savedAddress.contactNo2 && (
                    <p className="text-[#8E8B85]">
                      Contact 2: {savedAddress.contactNo2}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-[#8E8B85]">
                  <p>No saved delivery coordinates yet.</p>
                  <p className="text-[11px] mt-1">
                    When you check &quot;Save this information for next time&quot; at checkout, your address will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#FAF4EB] border border-[#9B783E]/20 p-6 space-y-3 rounded-[2px]">
              <div className="flex items-center gap-2 text-[#9B783E]">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">
                  Maison Concierge Care
                </h4>
              </div>
              <p className="text-[11px] text-[#66635F] leading-relaxed">
                Need tailoring guidance, size assistance, or special dispatch instructions? Our stylists are available directly on WhatsApp.
              </p>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-1.5 text-xs text-[#9B783E] uppercase tracking-wider font-semibold hover:underline"
              >
                <span>Ready to place an order</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
