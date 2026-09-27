"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  const handleDemoFill = () => {
    setEmail("admin@legendfashion.com");
    setPassword("admin123");
    setErrorMessage(null);
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed. Please check credentials.");
        setLoading(false);
        return;
      }

      // Success: redirect to target or admin dashboard
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMessage("Unable to connect to the authentication service.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#121212] flex flex-col justify-between selection:bg-[#9B783E] selection:text-white">
      {/* Top Bar with Return to Store */}
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#66635F] hover:text-[#121212] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </Link>
        <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#8E8B85]">
          <ShieldCheck className="w-4 h-4 text-[#9B783E]" />
          <span>Restricted Portal</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white border border-[#E8E5E0] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9B783E] via-[#D4AF37] to-[#9B783E]" />

          {/* Wordmark Header */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="LEGEND"
              width={160}
              height={30}
              priority
              className="h-8 w-auto object-contain mb-1.5"
            />
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#9B783E] font-medium block">
              Treasury &amp; Operations
            </span>
            <p className="text-xs text-[#8E8B85] mt-3">
              Enter authorized administrator credentials to access management controls.
            </p>
          </div>



          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50/80 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#66635F] font-medium mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E8B85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@legendfashion.com"
                  required
                  autoComplete="email"
                  className="w-full bg-[#FAF8F5] border border-[#E8E5E0] pl-10 pr-4 py-2.5 text-xs text-[#121212] placeholder:text-[#A8A5A0] focus:outline-none focus:border-[#9B783E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-[#66635F] font-medium">
                  Security Passcode
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E8B85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#FAF8F5] border border-[#E8E5E0] pl-10 pr-10 py-2.5 text-xs text-[#121212] placeholder:text-[#A8A5A0] focus:outline-none focus:border-[#9B783E] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8B85] hover:text-[#121212] p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#121212] hover:bg-[#9B783E] text-white py-3 text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-8 pt-6 border-t border-[#E8E5E0] text-center">
            <p className="text-[10px] text-[#8E8B85] uppercase tracking-wider flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9B783E]" />
              Authorized personnel only. All access is audited.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full p-6 text-center text-[11px] text-[#8E8B85]">
        &copy; {new Date().getFullYear()} LEGEND Luxury Apparel &bull; Management Systems
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xl font-light tracking-[0.3em] text-[#121212]">
              LEGEND
            </span>
            <Loader2 className="w-5 h-5 text-[#9B783E] animate-spin" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
