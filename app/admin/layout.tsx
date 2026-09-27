"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  Package,
  Layers,
  FileEdit,
  ExternalLink,
  Store,
  Boxes,
  LogOut,
  Loader2,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // If on the login page, render clean login view without admin chrome
  const isLoginPage = pathname === "/admin/login";

  // Close mobile navigation drawer whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    // Check authentication against /api/admin/me
    let isMounted = true;
    fetch("/api/admin/me")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
            setIsCheckingAuth(false);
          } else {
            router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  useEffect(() => {
    if (isLoginPage) return;

    // Fetch pending payment count for badge
    fetch("/api/orders?status=Payment%20Review")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setPendingPaymentsCount(data.length);
        }
      })
      .catch((e) => console.error("Could not fetch pending payments count", e));
  }, [pathname, isLoginPage]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error", err);
    }
    router.push("/admin/login");
    router.refresh();
  };

  // 1. If currently on login page, render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 2. While verifying authentication, render luxury loading placeholder
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <Image
          src="/logo.png"
          alt="LEGEND"
          width={150}
          height={28}
          className="h-7 w-auto object-contain mb-2"
        />
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#9B783E] font-medium mb-6 block">
          Treasury & Operations
        </span>
        <div className="flex items-center gap-2.5 text-xs text-[#66635F]">
          <Loader2 className="w-4 h-4 text-[#9B783E] animate-spin" />
          <span className="uppercase tracking-wider text-[11px]">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      label: "Payment Verification",
      href: "/admin/payments",
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null,
    },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes },
    { label: "CMS & Storefront", href: "/admin/cms", icon: FileEdit },
  ];

  const renderNavLinks = (onItemClick?: () => void) => (
    <nav className="p-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
              isActive
                ? "bg-[#121212] text-white"
                : "text-[#66635F] hover:bg-[#FAF8F5] hover:text-[#121212]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 stroke-1" />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-[#9B783E] text-white"
                    : "bg-[#FAF4EB] text-[#9B783E] border border-[#F0E4D0]"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderProfileFooter = () => (
    <div className="border-t border-[#E8E5E0] bg-[#FAF8F5] divide-y divide-[#E8E5E0]">
      {/* Authenticated Admin profile badge */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {adminUser?.name?.charAt(0) || "A"}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-[#121212] truncate">
                {adminUser?.name || "Admin"}
              </p>
              <p className="text-[10px] text-[#8E8B85] truncate font-mono">
                {adminUser?.email || "admin@legendfashion.com"}
              </p>
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-[#9B783E]/10 text-[#9B783E] font-medium shrink-0">
            {adminUser?.role || "Admin"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-wider text-red-700 bg-white border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Storefront Link */}
      <div className="p-3">
        <Link
          href="/"
          className="flex items-center justify-between px-2 py-1.5 text-xs uppercase tracking-wider text-[#66635F] hover:text-[#121212] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 stroke-1" />
            <span>Storefront</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[#8E8B85]" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row">
      {/* 1. Mobile Top Navigation Bar (< md) */}
      <header className="sticky top-0 z-30 md:hidden bg-white border-b border-[#E8E5E0] px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="LEGEND"
            width={100}
            height={20}
            className="h-5 w-auto object-contain"
          />
          <span className="text-[8px] uppercase tracking-[0.25em] text-[#9B783E] font-medium border-l border-[#E8E5E0] pl-2">
            Operations
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {pendingPaymentsCount > 0 && (
            <Link
              href="/admin/payments"
              className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FAF4EB] border border-[#F0E4D0] text-[#9B783E] text-[10px] font-bold rounded-full"
            >
              <CreditCard className="w-3 h-3" />
              <span>{pendingPaymentsCount} Review</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#121212] hover:bg-[#FAF8F5] border border-[#E8E5E0] rounded-none transition-colors"
            aria-label="Toggle operations navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-1" />
            ) : (
              <Menu className="w-5 h-5 stroke-1" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Mobile Navigation Drawer (< md) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-[#E8E5E0] flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E8E5E0] flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex flex-col gap-1">
                  <Image
                    src="/logo.png"
                    alt="LEGEND"
                    width={110}
                    height={22}
                    className="h-5 w-auto object-contain"
                  />
                  <span className="text-[8px] uppercase tracking-[0.3em] text-[#9B783E] font-medium">
                    Treasury & Operations
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#121212] hover:opacity-70"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5 stroke-1" />
                </button>
              </div>

              {/* Nav links */}
              {renderNavLinks(() => setMobileMenuOpen(false))}
            </div>

            {/* Profile footer inside drawer */}
            {renderProfileFooter()}
          </div>
        </div>
      )}

      {/* 3. Desktop Persistent Sidebar (>= md) */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-[#E8E5E0] shrink-0 flex-col justify-between sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Admin Wordmark Header */}
          <div className="p-6 border-b border-[#E8E5E0] flex items-center justify-between">
            <Link href="/admin" className="flex flex-col gap-1.5">
              <Image
                src="/logo.png"
                alt="LEGEND"
                width={130}
                height={26}
                priority
                className="h-6 w-auto object-contain"
              />
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#9B783E] font-medium">
                Treasury & Operations
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          {renderNavLinks()}
        </div>

        {/* User Info & Footer */}
        {renderProfileFooter()}
      </aside>

      {/* 4. Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
