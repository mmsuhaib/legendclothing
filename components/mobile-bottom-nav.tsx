"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  // Don't show inside admin routes to avoid collision with admin UI
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home, active: pathname === "/" },
    { label: "Shop", href: "/shop", icon: Compass, active: pathname === "/shop" || pathname.startsWith("/product") },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      active: pathname === "/wishlist",
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      label: "Bag",
      onClick: openCart,
      icon: ShoppingBag,
      active: false,
      badge: totalItems > 0 ? totalItems : null,
    },
    {
      label: user ? "Account" : "Sign In",
      href: user ? "/account" : "/login",
      icon: User,
      active: pathname === "/account" || pathname === "/login",
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#E8E5E0] px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-sm">
      <div className="flex items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const content = (
            <div className="relative flex flex-col items-center justify-center py-1 px-3 transition-transform duration-200 group-hover:-translate-y-0.5">
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 group-hover:scale-115 ${
                    item.active ? "text-[#9B783E]" : "text-[#66635F] group-hover:text-[#9B783E]"
                  }`}
                  strokeWidth={item.active ? 2 : 1.5}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-[#9B783E] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-115 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] uppercase tracking-wider mt-1 transition-colors duration-200 ${
                  item.active
                    ? "font-semibold text-[#121212]"
                    : "text-[#8E8B85] group-hover:text-[#121212]"
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="group flex-1 flex justify-center items-center py-0.5 rounded-md hover:bg-black/[0.03] active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href!}
              className="group flex-1 flex justify-center items-center py-0.5 rounded-md hover:bg-black/[0.03] active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label={item.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
