"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import GoogleLoginButton from "@/components/google-login-button";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#9B783E]" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { user, login, register } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, redirect, router]);

  // Check URL error parameter (e.g. from Google OAuth callback)
  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
      toast(errorParam, "error");
    }
  }, [searchParams, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Invalid credentials.");
      toast(res.error || "Sign in failed", "error");
    } else {
      toast("Welcome back!", "success");
      router.push(redirect);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
    });
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to create account.");
      toast(res.error || "Registration failed", "error");
    } else {
      toast("Account registered successfully!", "success");
      router.push(redirect);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-[#E8E5E0] p-8 sm:p-10 shadow-xs rounded-[2px]">
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#9B783E] font-semibold">
            Maison Account Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.18em] text-[#121212]">
            {tab === "login" ? "Client Sign In" : "Client Registration"}
          </h1>
          <p className="text-xs text-[#66635F]">
            {tab === "login"
              ? "Access your luxury orders, delivery coordinates, and expedited checkout."
              : "Create your personal LEGEND account for tailored shopping."}
          </p>
        </div>

        {/* Fast Google Authentication */}
        <div className="space-y-3.5">
          <GoogleLoginButton
            redirect={redirect}
            label={tab === "login" ? "Continue with Google" : "Register with Google"}
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E8E5E0] w-full" />
            <span className="bg-white px-3 text-[10px] text-[#8E8B85] uppercase tracking-widest font-medium shrink-0">
              Or with email & password
            </span>
            <div className="border-t border-[#E8E5E0] w-full" />
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E8E5E0]">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 pb-3 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              tab === "login"
                ? "border-[#121212] text-[#121212] font-semibold"
                : "border-transparent text-[#8E8B85] hover:text-[#121212]"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError("");
            }}
            className={`flex-1 pb-3 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              tab === "register"
                ? "border-[#121212] text-[#121212] font-semibold"
                : "border-transparent text-[#8E8B85] hover:text-[#121212]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 rounded-[2px]">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Forms */}
        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="client@example.com"
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#121212] hover:bg-[#9B783E] text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Julian Vance"
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 019-2834"
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="client@example.com"
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                Password (min 6 chars) *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#121212] hover:bg-[#9B783E] text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#E8E5E0] text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8E8B85]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9B783E]" />
            <span>Secure 256-Bit SSL Encrypted Client Authentication</span>
          </div>
          <Link
            href="/admin/login"
            className="text-[10px] text-[#8E8B85] hover:text-[#121212] transition-colors block"
          >
            Staff & Atelier Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
