"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Download,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import { getClientCategories } from "@/lib/cached-categories";

export interface NavCategory {
  id?: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  _count?: { products: number };
}

export function Header() {
  return (
    <Suspense fallback={<HeaderInner currentCat={null} />}>
      <HeaderWithSearchParams />
    </Suspense>
  );
}

function HeaderWithSearchParams() {
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("category");
  return <HeaderInner currentCat={currentCat} />;
}

function HeaderInner({ currentCat }: { currentCat: string | null }) {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  // Dynamic categories from database (zero hardcoding)
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);

  // Trigger bounce micro-animation on cart badge when items change
  useEffect(() => {
    if (totalItems > 0) {
      setIsCartBumping(true);
      const timer = setTimeout(() => setIsCartBumping(false), 650);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // Fetch live categories directly from database
  useEffect(() => {
    let isMounted = true;
    getClientCategories()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const activeOnly = data
            .filter((c: any) => c.isActive)
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              image: c.image,
              description: c.description,
              _count: c._count,
            }));
          setCategories(activeOnly);
        }
      })
      .catch((err) => console.error("Could not fetch categories", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Optimized passive scroll listener using requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const nextScrolled = window.scrollY > 20;
          setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu & dropdown when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
  }, [pathname, currentCat]);

  // Smooth body scroll lock for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle Escape key for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHomeActive = pathname === "/";
  const isShopAllActive = pathname === "/shop" && (!currentCat || currentCat === "all");

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-[#FAF8F5] transition-all duration-200 ${isScrolled
          ? "border-b border-[#E8E5E0] shadow-sm py-3.5"
          : "border-b border-[#E8E5E0]/70 py-4 sm:py-4.5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[#121212] rounded-full hover:bg-black/5 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 stroke-1" />
              </button>
            </div>

            {/* Left: Brand Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="group flex flex-col items-start transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                aria-label="LEGEND Home"
              >
                <Image
                  src="/logo.png"
                  alt="LEGEND"
                  width={150}
                  height={28}
                  priority
                  className="h-5 sm:h-6 w-auto object-contain transition-opacity duration-300 group-hover:opacity-85"
                />
                <span className="text-[7px] tracking-[0.42em] uppercase text-[#8E8B85] font-semibold mt-0.5 transition-colors duration-300 group-hover:text-[#9B783E]">
                  Clothing
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              {/* Home */}
              <Link
                href="/"
                className={`relative py-1 text-xs uppercase tracking-[0.18em] transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:transition-all after:duration-300 ${isHomeActive
                  ? "text-[#121212] font-semibold after:w-full after:bg-[#121212]"
                  : "text-[#66635F] hover:text-[#121212] after:w-0 after:bg-[#9B783E] hover:after:w-full"
                  }`}
              >
                Home
              </Link>

              {/* Shop with Category Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopDropdownOpen(true)}
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <Link
                  href="/shop"
                  className={`relative py-1 text-xs uppercase tracking-[0.18em] inline-flex items-center gap-1 transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:transition-all after:duration-300 ${isShopAllActive
                    ? "text-[#121212] font-semibold after:w-full after:bg-[#121212]"
                    : "text-[#66635F] hover:text-[#121212] after:w-0 after:bg-[#9B783E] hover:after:w-full"
                    }`}
                >
                  <span>Shop</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${shopDropdownOpen ? "rotate-180 text-[#9B783E]" : "text-[#8E8B85]"
                      }`}
                  />
                </Link>

                {/* Luxury Category Mega Dropdown */}
                {shopDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[min(620px,calc(100vw-2rem))] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-[#FAF8F5] border border-[#E8E5E0] shadow-xl p-6 rounded-xs">
                      <div className="flex items-center justify-end pb-3 mb-4 border-b border-[#E8E5E0]">
                        <Link
                          href="/shop"
                          onClick={() => setShopDropdownOpen(false)}
                          className="text-[10px] uppercase tracking-[0.2em] text-[#9B783E] hover:text-[#826330] font-medium transition-colors cursor-pointer"
                        >
                          Browse All Pieces →
                        </Link>
                      </div>

                      {/* Category Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => {
                          const href = `/shop?category=${cat.slug}`;
                          const isCatActive = pathname === "/shop" && currentCat === cat.slug;
                          return (
                            <Link
                              key={cat.slug}
                              href={href}
                              onClick={() => setShopDropdownOpen(false)}
                              className={`group flex items-center gap-3 p-2.5 rounded-sm border transition-all duration-200 cursor-pointer ${isCatActive
                                ? "bg-white border-[#9B783E] shadow-2xs"
                                : "bg-white/60 hover:bg-white border-transparent hover:border-[#E8E5E0] hover:shadow-2xs"
                                }`}
                            >
                              {cat.image ? (
                                <div className="relative w-12 h-14 rounded-xs overflow-hidden bg-[#161616] shrink-0 border border-[#E8E5E0]">
                                  <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="48px"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-14 rounded-xs bg-[#161616] text-[#C29D59] flex items-center justify-center text-sm font-light shrink-0">
                                  {cat.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-[#121212] group-hover:text-[#9B783E] transition-colors truncate">
                                    {cat.name}
                                  </h4>
                                  {cat._count?.products !== undefined && (
                                    <span className="text-[10px] text-[#8E8B85] bg-[#FAF8F5] px-1.5 py-0.5 rounded-full border border-[#E8E5E0]">
                                      {cat._count.products}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#66635F] line-clamp-1 mt-0.5">
                                  {cat.description || "Discover the seasonal collection."}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Database Category Links */}
              {categories.map((cat) => {
                const href = `/shop?category=${cat.slug}`;
                const isActive = pathname === "/shop" && currentCat === cat.slug;
                return (
                  <Link
                    key={cat.slug}
                    href={href}
                    className={`relative py-1 text-xs uppercase tracking-[0.18em] transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:transition-all after:duration-300 ${isActive
                      ? "text-[#121212] font-semibold after:w-full after:bg-[#9B783E]"
                      : "text-[#66635F] hover:text-[#121212] after:w-0 after:bg-[#9B783E] hover:after:w-full"
                      }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Wishlist, Account, Cart) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 rounded-full text-[#121212] hover:text-[#9B783E] hover:bg-black/[0.04] hover:scale-105 active:scale-95 transition-all duration-200 hidden sm:inline-flex group cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 stroke-1 group-hover:scale-110 transition-transform duration-200" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#9B783E] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium shadow-xs group-hover:scale-115 transition-transform duration-200">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Client Account / Sign In */}
              <Link
                href={user ? "/account" : "/login"}
                className="relative p-2 rounded-full text-[#121212] hover:text-[#9B783E] hover:bg-black/[0.04] hover:scale-105 active:scale-95 transition-all duration-200 hidden sm:inline-flex items-center group cursor-pointer"
                aria-label="Client Account"
                title={user ? `Account (${user.name || user.email})` : "Sign In / Register"}
              >
                <User className="w-4.5 h-4.5 stroke-1 group-hover:scale-110 transition-transform duration-200" />
                {user && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2A6B46] ring-1 ring-white" />
                )}
              </Link>

              {/* Cart trigger with smooth bump animation */}
              <button
                onClick={openCart}
                className={`relative p-2 rounded-full text-[#121212] hover:text-[#9B783E] hover:bg-black/[0.04] transition-all duration-300 flex items-center group cursor-pointer ${isCartBumping ? "scale-115 text-[#9B783E]" : "hover:scale-105 active:scale-95"
                  }`}
                aria-label="Shopping Cart"
              >
                <ShoppingBag
                  className={`w-4.5 h-4.5 stroke-1 transition-transform duration-300 ${isCartBumping ? "scale-110 -rotate-6 text-[#9B783E]" : "group-hover:scale-110"
                    }`}
                />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium shadow-xs transition-all duration-300 ${isCartBumping
                      ? "bg-[#9B783E] text-white scale-125 ring-2 ring-white animate-cart-bounce"
                      : "bg-[#121212] text-[#FAF8F5] group-hover:bg-[#9B783E] group-hover:scale-115"
                      }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu Drawer with hardware acceleration & smooth exit */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-400 ${
          mobileMenuOpen ? "pointer-events-auto visible" : "pointer-events-none invisible delay-300"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs drawer-backdrop ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF8F5] border-r border-[#E8E5E0] shadow-2xl flex flex-col drawer-panel ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-5 border-b border-[#E8E5E0] flex items-center justify-between bg-white">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col group cursor-pointer"
              aria-label="LEGEND Home"
            >
              <Image
                src="/logo.png"
                alt="LEGEND"
                width={130}
                height={24}
                className="h-5 w-auto object-contain"
              />
              <span className="text-[7px] tracking-[0.42em] uppercase text-[#8E8B85] font-semibold mt-0.5">
                Clothing
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#121212] hover:text-[#9B2C2C] hover:bg-black/5 rounded-full transition-all duration-200 hover:rotate-90 active:scale-95 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 stroke-1" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-5 space-y-6 overscroll-contain">
              {/* Primary Navigation */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8E8B85] mb-2 px-2">
                  Navigation
                </p>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between text-sm uppercase tracking-wider p-2.5 rounded-sm border transition-all duration-200 ${isHomeActive
                    ? "text-[#9B783E] font-semibold bg-white border-[#E8E5E0]"
                    : "text-[#121212] hover:text-[#9B783E] hover:bg-white border-transparent hover:border-[#E8E5E0]"
                    }`}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Home
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8E8B85] group-hover:text-[#9B783E] group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between text-sm uppercase tracking-wider p-2.5 rounded-sm border transition-all duration-200 ${isShopAllActive
                    ? "text-[#9B783E] font-semibold bg-white border-[#E8E5E0]"
                    : "text-[#121212] hover:text-[#9B783E] hover:bg-white border-transparent hover:border-[#E8E5E0]"
                    }`}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Shop All Pieces
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8E8B85] group-hover:text-[#9B783E] group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              </div>

              {/* Dynamic Categories from Database */}
              <div className="pt-4 border-t border-[#E8E5E0] space-y-1">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8E8B85] mb-2 px-2">
                  Categories
                </p>
                {categories.map((cat) => {
                  const isActive = pathname === "/shop" && currentCat === cat.slug;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center justify-between text-sm uppercase tracking-wider p-2.5 rounded-sm border transition-all duration-200 ${isActive
                        ? "text-[#9B783E] font-semibold bg-white border-[#9B783E]/40"
                        : "text-[#121212] hover:text-[#9B783E] hover:bg-white border-transparent hover:border-[#E8E5E0]"
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {cat.image ? (
                          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-[#161616] border border-[#E8E5E0] shrink-0">
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              fill
                              className="object-cover"
                              sizes="24px"
                            />
                          </div>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#9B783E]/50" />
                        )}
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {cat._count?.products !== undefined && (
                          <span className="text-[10px] text-[#8E8B85] bg-black/5 px-2 py-0.5 rounded-full font-normal">
                            {cat._count.products}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-[#8E8B85] group-hover:text-[#9B783E] group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Customer Care & Admin */}
              <div className="pt-4 border-t border-[#E8E5E0] space-y-1">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8E8B85] mb-2 px-2">
                  Customer Care & Admin
                </p>
                <Link
                  href={user ? "/account" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between text-xs uppercase tracking-wider text-[#121212] font-medium hover:bg-white p-2.5 rounded-sm border border-transparent hover:border-[#E8E5E0] transition-all duration-200"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    {user ? `Client Account (${user.name || user.email})` : "Client Sign In / Register"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8E8B85] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
                <Link
                  href="/order/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between text-xs uppercase tracking-wider text-[#66635F] hover:text-[#121212] hover:bg-white p-2.5 rounded-sm border border-transparent hover:border-[#E8E5E0] transition-all duration-200"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Track Your Order
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8E8B85] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between text-xs uppercase tracking-wider text-[#66635F] hover:text-[#121212] hover:bg-white p-2.5 rounded-sm border border-transparent hover:border-[#E8E5E0] transition-all duration-200"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Wishlist
                  </span>
                  {wishlistCount > 0 ? (
                    <span className="text-[10px] bg-[#9B783E] text-white px-2 py-0.5 rounded-full group-hover:scale-110 transition-transform duration-200">
                      {wishlistCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#8E8B85] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                  )}
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between text-xs uppercase tracking-wider text-[#9B783E] hover:text-[#826330] hover:bg-[#FAF4EB] p-2.5 rounded-sm border border-transparent hover:border-[#9B783E]/20 font-medium transition-all duration-200"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Admin Verification Portal
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-pwa-install"));
                    }
                  }}
                  className="w-full group flex items-center justify-between text-xs uppercase tracking-wider text-[#121212] hover:bg-white p-2.5 rounded-sm border border-transparent hover:border-[#E8E5E0] transition-all duration-200 cursor-pointer"
                >
                  <span className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-200">
                    <span>Install Web App</span>
                    <span className="text-[9px] uppercase tracking-wider bg-[#9B783E]/15 text-[#9B783E] px-1.5 py-0.5 rounded font-semibold border border-[#9B783E]/30">
                      PWA
                    </span>
                  </span>
                  <Download className="w-3.5 h-3.5 text-[#9B783E] group-hover:translate-y-0.5 transition-transform duration-200" />
                </button>
              </div>
            </div>

            <div className="p-5 border-t border-[#E8E5E0] bg-white text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#8E8B85]">
                LEGEND — Modern Sartorial Maison
              </p>
            </div>
          </div>
        </div>
    </>
  );
}
