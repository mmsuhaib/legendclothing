"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function CartDrawer() {
  const pathname = usePathname();
  const {
    cart,
    isOpen,
    lastAddedId,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    freeShippingThreshold,
    shippingLabel,
  } = useCart();

  const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const effectiveShippingFee = isFreeShipping ? 0 : shippingFee;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ${isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible delay-500"
        }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop with smooth blur and fade */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs drawer-backdrop ${isOpen ? "opacity-100" : "opacity-0"
          }`}
      />

      {/* Slide-out drawer panel with cubic-bezier easing */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
        <div
          className={`pointer-events-auto w-screen max-w-md bg-[#FAF8F5] border-l border-[#E8E5E0] flex flex-col shadow-2xl drawer-panel ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-[#E8E5E0] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#121212]" />
              <h2 className="text-base font-semibold tracking-widest uppercase text-[#121212]">
                Your Selection ({cart.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-[#121212] hover:text-[#9B2C2C] hover:bg-black/5 rounded-full hover:rotate-90 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-1" />
            </button>
          </div>

          {/* Dynamic Shipping Notice */}
          <div className="px-6 py-2.5 bg-[#F4F1EA] border-b border-[#E8E5E0] text-xs flex items-center justify-between">
            <span className="text-[#66635F]">{shippingLabel}</span>
            <span className="font-medium text-[#121212]">
              {effectiveShippingFee === 0 ? "Complimentary" : `LKR ${effectiveShippingFee.toLocaleString()}`}
            </span>
          </div>

          {/* Cart Items List with overscroll containment */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 border border-[#E8E5E0] bg-white flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1 text-[#8E8B85]" />
                </div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-[#121212]">
                  Your cart is waiting for something legendary.
                </h3>
                <p className="text-xs text-[#66635F] mt-2 max-w-xs">
                  Explore our curated seasonal collections crafted with timeless refinement.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-6 inline-block px-6 py-3 bg-[#121212] text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest hover:bg-[#9B783E] hover:scale-105 active:scale-95 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              cart.map((item) => {
                const isJustAdded = item.id === lastAddedId;
                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-3 rounded-[3px] border transition-all duration-500 ${isJustAdded
                        ? "border-[#9B783E]/50 bg-[#FAF4EB]/80 animate-highlight-added shadow-xs"
                        : "border-transparent pb-5 border-b border-[#E8E5E0] last:border-b-0"
                      }`}
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-26 bg-[#F4F1EA] shrink-0 border border-[#E8E5E0] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {isJustAdded && (
                          <div className="flex items-center gap-1 text-[10px] text-[#9B783E] font-semibold uppercase tracking-wider mb-1 animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            <span>Just Added</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="text-sm font-medium text-[#121212] hover:text-[#9B783E] transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#8E8B85] hover:text-[#9B2C2C] p-1.5 rounded-full hover:bg-red-50 hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 stroke-1" />
                          </button>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-[#66635F]">
                          {item.size && <span>Size: <strong className="text-[#121212]">{item.size}</strong></span>}
                          {item.size && item.color && <span>•</span>}
                          {item.color && <span>Color: <strong className="text-[#121212]">{item.color}</strong></span>}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-[#121212]">
                          LKR {Math.round(item.price).toLocaleString()}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#E8E5E0] bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-[#FAF4EB] hover:text-[#9B783E] active:scale-90 text-[#121212] transition-all duration-150 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-medium text-[#121212]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-[#FAF4EB] hover:text-[#9B783E] active:scale-90 text-[#121212] transition-all duration-150 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-[#121212]">
                          LKR {(Math.round(item.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E8E5E0] bg-white space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#66635F]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#121212]">LKR {Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#66635F]">
                  <span>{shippingLabel}</span>
                  <span className="font-medium text-[#121212]">
                    {effectiveShippingFee === 0 ? "Complimentary" : `LKR ${effectiveShippingFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#121212] pt-2 border-t border-[#E8E5E0]">
                  <span>Estimated Total</span>
                  <span>
                    LKR {Math.round(subtotal + effectiveShippingFee).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 bg-[#121212] text-[#FAF8F5] py-4 text-xs font-semibold uppercase tracking-widest hover:bg-[#9B783E] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center py-2.5 text-xs text-[#66635F] uppercase tracking-wider hover:text-[#121212] hover:tracking-widest transition-all duration-200 cursor-pointer"
                >
                  View Full Bag
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
