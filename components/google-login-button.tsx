"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface GoogleLoginButtonProps {
  redirect?: string;
  className?: string;
  label?: string;
}

export default function GoogleLoginButton({
  redirect = "/",
  className = "",
  label = "Continue with Google",
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = () => {
    setLoading(true);
    // Redirect to the Google auth initiation route
    const authUrl = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`;
    window.location.href = authUrl;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      className={`w-full relative flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-[#F9F8F6] active:bg-[#F0EEEA] border border-[#DCD9D4] hover:border-[#121212]/30 text-[#121212] transition-all duration-200 shadow-2xs rounded-[2px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-[#9B783E]" />
      ) : (
        /* Official Google SVG Logo */
        <svg
          className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
      )}

      <span className="text-xs font-medium tracking-wider uppercase">
        {loading ? "Redirecting to Google..." : label}
      </span>
    </button>
  );
}
