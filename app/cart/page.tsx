"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Minus, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    freeShippingThreshold,
    shippingLabel,
  } = useCart();

  const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const effectiveShipping = isFreeShipping ? 0 : shippingFee;
  const grandTotal = subtotal + effectiveShipping;

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#E8E5E0] pb-8 mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
            Order Review
          </span>
          <h1 className="text-3xl sm:text-4xl font-light tracking-[0.15em] uppercase text-[#121212] mt-1">
            Your Shopping Bag ({cart.reduce((acc, i) => acc + i.quantity, 0)})
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-16 h-16 border border-[#E8E5E0] bg-white flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-7 h-7 text-[#8E8B85] stroke-1" />
            </div>
            <h2 className="text-lg font-light tracking-wider uppercase text-[#121212]">
              Your cart is waiting for something legendary.
            </h2>
            <p className="text-xs text-[#66635F] mt-2 leading-relaxed">
              Explore our refined seasonal selection of artisanal shirts, trousers, and scents.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-[#121212] text-white text-xs uppercase tracking-widest hover:bg-[#9B783E] transition-colors"
            >
              Explore The Shop <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Bag Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Shipping notice */}
              <div className="p-4 bg-white border border-[#E8E5E0] text-xs flex items-center justify-between">
                <span className="text-[#66635F]">{shippingLabel}</span>
                <span className="font-semibold text-[#121212]">
                  {effectiveShipping === 0 ? "Complimentary" : `LKR ${effectiveShipping.toLocaleString()}`}
                </span>
              </div>

              {/* Items Table */}
              <div className="bg-white border border-[#E8E5E0] divide-y divide-[#E8E5E0]">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                  >
                    {/* Image & Title */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-26 bg-[#F4F1EA] border border-[#E8E5E0] shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-sm font-medium text-[#121212] hover:text-[#9B783E] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex items-center gap-3 text-xs text-[#66635F]">
                          {item.size && (
                            <span>
                              Size: <strong className="text-[#121212]">{item.size}</strong>
                            </span>
                          )}
                          {item.color && (
                            <span>
                              Color: <strong className="text-[#121212]">{item.color}</strong>
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-[#121212] sm:hidden">
                          LKR {Math.round(item.price).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Price Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E8E5E0] bg-[#FAF8F5]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-white text-[#121212] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 text-xs font-semibold text-[#121212]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-white text-[#121212] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-sm font-semibold text-[#121212]">
                          LKR {(Math.round(item.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8E8B85] hover:text-[#9B2C2C] p-2 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 stroke-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-[#E8E5E0] p-6 space-y-6 sticky top-28">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212] pb-3 border-b border-[#E8E5E0]">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-[#66635F]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#121212]">LKR {Math.round(subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#66635F]">
                    <span>{shippingLabel}</span>
                    <span className="font-semibold text-[#121212]">
                      {effectiveShipping === 0 ? "Complimentary" : `LKR ${effectiveShipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#66635F]">
                    <span>Payment Methods</span>
                    <span className="font-semibold text-[#121212]">Online Bank Wire / COD</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-[#121212] pt-4 border-t border-[#E8E5E0]">
                    <span>Total Amount</span>
                    <span>LKR {Math.round(grandTotal).toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[#121212] text-[#FAF8F5] py-4 text-xs font-semibold uppercase tracking-widest hover:bg-[#9B783E] transition-colors"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#8E8B85]">
                  <ShieldCheck className="w-4 h-4 text-[#9B783E]" />
                  <span>Secure Bank Wire & Receipt Verification</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
