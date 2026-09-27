"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ArrowRight } from "lucide-react";
import { useToast } from "@/context/toast-context";

export default function TrackOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderNumber.trim();
    if (!clean) {
      toast("Please enter your Order Reference Number", "error");
      return;
    }
    router.push(`/order/${clean}`);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-[#E8E5E0] p-8 shadow-sm text-center">
        <div className="w-14 h-14 border border-[#E8E5E0] bg-[#FAF8F5] flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-[#9B783E] stroke-1" />
        </div>

        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
          Client Concierge
        </span>
        <h1 className="text-xl sm:text-2xl font-light tracking-wide uppercase text-[#121212] mt-1 mb-2">
          Track Your Order
        </h1>
        <p className="text-xs text-[#66635F] mb-6 leading-relaxed">
          Enter your LEGEND order number (e.g., <strong>LEG-2026-8491</strong>) to check
          wire verification progress and delivery timeline.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. LEG-2026-8491"
              required
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3.5 text-xs text-center uppercase tracking-widest font-mono text-[#121212] focus:outline-none focus:border-[#121212]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#121212] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#9B783E] transition-colors flex items-center justify-center gap-2"
          >
            Track Order Status <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-[#E8E5E0] text-[11px] text-[#8E8B85]">
          Need immediate assistance? Contact our treasury team at{" "}
          <strong className="text-[#121212]">concierge@legendfashion.com</strong>
        </div>
      </div>
    </div>
  );
}
