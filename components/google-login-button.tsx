"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface GoogleLoginButtonProps {
  redirect?: string;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton({
  redirect = "/",
  className = "",
  label = "Continue with Google",
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Initialize Google Identity Services if available
  useEffect(() => {
    if (!clientId) return;

    // Load Google Identity Services script if not already present
    const existingScript = document.getElementById("google-gsi-client");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        tryInitGIS();
      };
      document.head.appendChild(script);
    } else {
      tryInitGIS();
    }

    function tryInitGIS() {
      if (window.google?.accounts?.id && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (response.credential) {
                setLoading(true);
                setErrorMessage(null);
                try {
                  const res = await fetch("/api/auth/google/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ credential: response.credential }),
                  });
                  if (res.ok) {
                    window.location.href = redirect;
                    return;
                  }
                  const errData = await res.json().catch(() => ({}));
                  setErrorMessage(errData.error || "Authentication failed.");
                  setLoading(false);
                } catch {
                  setErrorMessage("Network error during authentication.");
                  setLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (e) {
          console.warn("Google GIS init notice:", e);
        }
      }
    }
  }, [clientId, redirect]);

  const handleGoogleClick = () => {
    setLoading(true);
    setErrorMessage(null);

    // If GIS prompt is ready, try to prompt user
    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to OAuth redirect route if popup/One-Tap is dismissed or blocked
            window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`;
          }
        });
        // Set a brief timeout fallback if user prefers full redirect
        setTimeout(() => {
          setLoading(false);
        }, 4000);
        return;
      } catch {
        // Fallback to direct redirect
      }
    }

    // Direct redirect to Google OAuth initiation route
    const authUrl = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`;
    window.location.href = authUrl;
  };

  return (
    <div className="w-full space-y-2">
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
          {loading ? "Connecting to Google..." : label}
        </span>
      </button>

      {errorMessage && (
        <p className="text-xs text-[#9B2C2C] text-center font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
