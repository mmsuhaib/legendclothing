"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-4 bg-white border border-[#E8E5E0] shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 text-sm ${
              t.type === "error"
                ? "border-l-4 border-l-[#9B2C2C] text-[#121212]"
                : t.type === "success"
                ? "border-l-4 border-l-[#9B783E] text-[#121212]"
                : "border-l-4 border-l-[#666] text-[#121212]"
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#9B783E] shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-[#9B2C2C] shrink-0" />}
              {t.type === "info" && <Info className="w-4 h-4 text-[#666] shrink-0" />}
              <span className="tracking-wide text-xs font-medium uppercase">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#888] hover:text-[#111] p-1 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
