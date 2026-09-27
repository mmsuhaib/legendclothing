"use client";

import Link from "next/link";
import { WifiOff, RotateCw, ShoppingBag, ArrowLeft, ShieldAlert } from "lucide-react";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#E8E5E0] rounded-2xl p-8 shadow-xs">
        {/* Offline Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#FAF4EB] border border-[#9B783E]/20 flex items-center justify-center text-[#9B783E]">
          <WifiOff className="w-8 h-8" />
        </div>

        {/* Heading & Notice */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[#9B783E]">
            Offline Mode
          </span>
          <h1 className="text-2xl font-serif tracking-tight text-[#121212]">
            You Are Currently Offline
          </h1>
          <p className="text-sm text-[#66635F] leading-relaxed">
            It looks like your device lost connection. You can still view pages you previously
            visited, but live inventory, cart updates, and checkout require an active connection.
          </p>
        </div>

        {/* Security & Data note */}
        <div className="flex items-start gap-3 bg-[#FAF8F5] border border-[#E8E5E0] p-3.5 rounded-xl text-left">
          <ShieldAlert className="w-4 h-4 text-[#9B783E] shrink-0 mt-0.5" />
          <p className="text-xs text-[#66635F]">
            For your security and real-time stock integrity, checkout, payment, and account details
            are not stored offline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReload}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#121212] hover:bg-[#2A2620] text-[#FAF8F5] px-5 py-3 rounded-full text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Check Connection</span>
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 border border-[#E8E5E0] hover:border-[#121212] bg-white text-[#121212] px-5 py-3 rounded-full text-sm font-medium transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-[#9B783E]" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
