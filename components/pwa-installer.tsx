"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Download, Share, PlusSquare, X, CheckCircle2, Monitor, ArrowUpRight, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Trigger install or show instructions
  const handleInstallClick = useCallback(async () => {
    const promptEvent = deferredPromptRef.current;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
          setShowPromptBanner(false);
          setIsDismissed(false);
          setShowInstructionsModal(false);
        }
      } catch (err) {
        console.error("[LEGEND PWA] Install prompt error:", err);
        setShowInstructionsModal(true);
      }
      deferredPromptRef.current = null;
      setDeferredPrompt(null);
    } else {
      // If native prompt is not available (iOS Safari, desktop browsers, or already captured),
      // open the visual instruction modal
      setShowInstructionsModal(true);
    }
  }, []);

  const handleDismissBanner = useCallback(() => {
    try {
      sessionStorage.setItem("legend_pwa_banner_dismissed", "true");
    } catch {
      // Ignore sessionStorage errors
    }
    setShowPromptBanner(false);
    setIsDismissed(true);
  }, []);

  const handleDismissModal = useCallback(() => {
    setShowInstructionsModal(false);
  }, []);

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed PWA)
    const checkStandalone = () => {
      if (typeof window === "undefined") return false;
      const isWindowStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isNavigatorStandalone =
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      const isAndroidInstalled = document.referrer.includes("android-app://");
      return Boolean(isWindowStandalone || isNavigatorStandalone || isAndroidInstalled);
    };

    const standalone = checkStandalone();
    setIsStandalone(standalone);

    if (standalone) {
      return; // Do not show install UI if app is already running in standalone mode
    }

    // Clean up any legacy 24h lockout from old localStorage keys
    try {
      localStorage.removeItem("legend_pwa_dismissed");
      localStorage.removeItem("comfora_pwa_dismissed");
    } catch {
      // Ignore localStorage errors
    }

    // Check if user dismissed banner during the current session
    let dismissedInSession = false;
    try {
      dismissedInSession = sessionStorage.getItem("legend_pwa_banner_dismissed") === "true";
    } catch {
      dismissedInSession = false;
    }
    setIsDismissed(dismissedInSession);

    // 2. Safe Service Worker Registration (Production only)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("[LEGEND PWA] Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[LEGEND PWA] Service Worker registration:", error);
          });
      } else {
        // In development, automatically unregister any lingering service workers and clear caches
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              if (name.startsWith("legend-")) {
                caches.delete(name);
              }
            }
          });
        }
      }
    }

    // 3. Detect iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isAppleDevice);

    // 4. Android / Chrome / Edge / Desktop beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      deferredPromptRef.current = promptEvent;
      setDeferredPrompt(promptEvent);

      if (!dismissedInSession) {
        setShowPromptBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPromptBanner(false);
      setIsDismissed(false);
      setShowInstructionsModal(false);
      deferredPromptRef.current = null;
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. Custom event listener to open PWA install from any button in the app (e.g. Header or Footer)
    const handleOpenPwa = () => {
      try {
        sessionStorage.removeItem("legend_pwa_banner_dismissed");
      } catch {
        // Ignore
      }
      setIsDismissed(false);
      setShowPromptBanner(true);
      if (isAppleDevice || !deferredPromptRef.current) {
        setShowInstructionsModal(true);
      } else {
        handleInstallClick();
      }
    };
    window.addEventListener("open-pwa-install", handleOpenPwa);

    // 6. Appearance Timer:
    // Ensure the user sees the install banner promptly if not dismissed in session
    const timer = setTimeout(() => {
      if (!standalone && !dismissedInSession) {
        setShowPromptBanner(true);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleOpenPwa);
    };
  }, [handleInstallClick]);

  if (isStandalone || isInstalled) {
    return null;
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. Universal Floating Install Banner                                      */}
      {/* ========================================================================= */}
      {showPromptBanner && (
        <aside
          aria-label="Install App Prompt"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 transition-all duration-300"
        >
          <div className="bg-[#121212]/95 backdrop-blur-md text-[#FAF8F5] p-4 rounded-2xl border border-[#24221E] shadow-2xl flex flex-col gap-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-black p-1 flex items-center justify-center shrink-0 border border-[#9B783E]/40 shadow-xs">
                  <Image
                    src="/icon-192x192.png"
                    alt="LEGEND"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-wide text-white flex items-center gap-1.5">
                    <span>Install LEGEND App</span>
                    <span className="text-[9px] uppercase tracking-wider bg-[#9B783E]/30 text-[#D4AF37] px-1.5 py-0.5 rounded border border-[#9B783E]/40 font-bold">
                      PWA
                    </span>
                  </h4>
                  <p className="text-xs text-[#A8A59F]">
                    Fast, seamless shopping & offline luxury catalog
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismissBanner}
                aria-label="Close install prompt"
                className="text-[#A8A59F] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#9B783E] hover:bg-[#826330] text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-98"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>

              <button
                type="button"
                onClick={handleDismissBanner}
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A8A59F] hover:text-white transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 2. Sleek Floating Install Pill (Always available when banner is dismissed) */}
      {/* ========================================================================= */}
      {!showPromptBanner && isDismissed && (
        <aside
          aria-label="Quick App Install"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 right-4 sm:right-6 z-50"
        >
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-2.5 bg-[#121212]/95 hover:bg-[#22201C] backdrop-blur-md text-white px-3.5 py-2 rounded-full shadow-2xl border border-[#9B783E]/50 hover:border-[#9B783E] transition-all duration-200 group cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Install LEGEND App"
          >
            <div className="w-6 h-6 rounded-full bg-[#9B783E] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Install App</span>
            <span className="text-[9px] uppercase tracking-wider bg-[#9B783E]/30 text-[#D4AF37] px-1.5 py-0.5 rounded font-bold border border-[#9B783E]/40">
              PWA
            </span>
          </button>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 3. Step-by-Step Instructions Modal (iOS Safari or Desktop/Manual Install)  */}
      {/* ========================================================================= */}
      {showInstructionsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install Instructions"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleDismissModal();
            }
          }}
        >
          <div className="bg-[#FAF8F5] text-[#121212] p-5 sm:p-6 rounded-2xl border border-[#E8E5E0] shadow-2xl flex flex-col gap-4 w-full max-w-md transition-transform duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black p-1.5 flex items-center justify-center shrink-0 border border-[#9B783E]/40 shadow-xs">
                  <Image
                    src="/icon-192x192.png"
                    alt="LEGEND"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-[#9B783E]">
                      {isIOS ? "iPhone & iPad Safari" : "Desktop & Mobile Browser"}
                    </span>
                    <Sparkles className="w-3 h-3 text-[#9B783E]" />
                  </div>
                  <h4 className="text-sm font-semibold tracking-tight text-[#121212]">
                    Add LEGEND to Home Screen
                  </h4>
                  <p className="text-xs text-[#66635F]">
                    Enjoy full-screen standalone luxury shopping
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismissModal}
                aria-label="Dismiss instructions"
                className="text-[#8E8B85] hover:text-[#121212] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Steps */}
            {isIOS ? (
              <div className="space-y-2.5 bg-white border border-[#E8E5E0] rounded-xl p-3.5 text-xs text-[#121212]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF4EB] text-[#9B783E] flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <span className="flex-1">
                    Tap the Safari <strong className="font-semibold">Share</strong> button in the
                    bottom navigation bar
                  </span>
                  <Share className="w-4 h-4 text-[#9B783E] shrink-0" />
                </div>

                <div className="h-px bg-[#F0EDE8]" />

                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF4EB] text-[#9B783E] flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <span className="flex-1">
                    Scroll down and select{" "}
                    <strong className="font-semibold">Add to Home Screen</strong>
                  </span>
                  <PlusSquare className="w-4 h-4 text-[#9B783E] shrink-0" />
                </div>

                <div className="h-px bg-[#F0EDE8]" />

                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF4EB] text-[#9B783E] flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <span className="flex-1">
                    Tap <strong className="font-semibold">Add</strong> in the top-right corner to
                    install
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#2A6B46] shrink-0" />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 bg-white border border-[#E8E5E0] rounded-xl p-3.5 text-xs text-[#121212]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF4EB] text-[#9B783E] flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <span className="flex-1">
                    Look at the right side of your browser address bar for the{" "}
                    <strong className="font-semibold">Install</strong> icon
                  </span>
                  <Monitor className="w-4 h-4 text-[#9B783E] shrink-0" />
                </div>

                <div className="h-px bg-[#F0EDE8]" />

                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF4EB] text-[#9B783E] flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <span className="flex-1">
                    Or click browser menu (<strong className="font-semibold">⋮</strong> or{" "}
                    <strong className="font-semibold">⋯</strong>) and choose{" "}
                    <strong className="font-semibold">Install LEGEND...</strong>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#9B783E] shrink-0" />
                </div>

                <div className="h-px bg-[#F0EDE8]" />

                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF4EB] text-[#9B783E] flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <span className="flex-1">
                    Confirm <strong className="font-semibold">Install</strong> to add LEGEND to
                    your device
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#2A6B46] shrink-0" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={handleDismissModal}
                className="w-full py-2.5 bg-[#121212] hover:bg-[#2A2620] text-white rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                Got It, Thanks
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
