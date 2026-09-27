"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { getClientCategories } from "@/lib/cached-categories";

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    getClientCategories()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(
            data
              .filter((c: any) => c.isActive)
              .map((c: any) => ({ name: c.name, slug: c.slug }))
          );
        }
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-white border-t border-[#E8E5E0] pt-16 pb-24 lg:pb-16 text-[#121212] content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-[#E8E5E0]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block" aria-label="LEGEND Home">
              <Image
                src="/logo.png"
                alt="LEGEND"
                width={150}
                height={28}
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-[#66635F] leading-relaxed max-w-sm tracking-wide">
              An international luxury menswear maison rooted in architectural tailoring,
              pure natural fabrics, and refined sartorial silhouettes. Designed for the modern
              individual of discerning taste.
            </p>
            <div className="pt-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#8E8B85]">
                Direct Wire Transfer & Verification Enabled
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212] mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#66635F]">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="inline-block hover:text-[#9B783E] hover:translate-x-1.5 transition-all duration-200 cursor-pointer"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212] mb-4">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-[#66635F]">
              <li>
                <Link href="/order/track" className="inline-block hover:text-[#9B783E] hover:translate-x-1.5 transition-all duration-200 font-medium text-[#121212] cursor-pointer">
                  Track Order & Receipts
                </Link>
              </li>
              <li>
                <Link href="/cart" className="inline-block hover:text-[#9B783E] hover:translate-x-1.5 transition-all duration-200 cursor-pointer">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="inline-block hover:text-[#9B783E] hover:translate-x-1.5 transition-all duration-200 cursor-pointer">
                  Saved Items
                </Link>
              </li>
              <li>
                <Link href="/admin" className="inline-block hover:text-[#9B783E] hover:translate-x-1.5 transition-all duration-200 cursor-pointer">
                  Admin Verification Portal
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-pwa-install"));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-left hover:text-[#9B783E] hover:translate-x-1.5 transition-all duration-200 cursor-pointer text-xs text-[#66635F]"
                >
                  <span>Install App</span>
                  <span className="text-[9px] uppercase tracking-wider bg-[#FAF4EB] text-[#9B783E] px-1.5 py-0.5 rounded font-semibold border border-[#9B783E]/20">
                    PWA
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212]">
              The Dispatch
            </h4>
            <p className="text-xs text-[#66635F] leading-relaxed">
              Receive private invitations to seasonal releases and limited editions.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#2A6B46] bg-[#F0FDF4] p-3 border border-[#DCFCE7]">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you. You are now on the private dispatch list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-3.5 py-2.5 text-xs text-[#121212] placeholder:text-[#8E8B85] focus:outline-none focus:border-[#121212] transition-colors"
                  />
                  <button
                    type="submit"
                    className="group bg-[#121212] text-[#FAF8F5] px-4 hover:bg-[#9B783E] hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer flex items-center justify-center"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
                <p className="text-[10px] text-[#8E8B85]">
                  By subscribing, you agree to our privacy policy.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8B85]">
          <p>© {new Date().getFullYear()} LEGEND Clothing. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px] uppercase tracking-wider">
            <span>Complimentary Global Delivery</span>
            <span>•</span>
            <span>Bank Wire Verification</span>
            <span>•</span>
            <span>Pure Materials</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
