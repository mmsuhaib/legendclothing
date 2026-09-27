"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string; altText?: string | null }[];
  currentIndex: number;
  onIndexChange: (idx: number) => void;
}

export function LightboxModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}: LightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
      }
      if (e.key === "ArrowRight") {
        onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close fullscreen view"
      >
        <X className="w-8 h-8 stroke-1" />
      </button>

      {/* Image Counter */}
      <div className="absolute top-6 left-6 text-white/70 text-xs tracking-widest uppercase">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Navigation Left */}
      {images.length > 1 && (
        <button
          onClick={() =>
            onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1)
          }
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Primary Zoomed Image */}
      <div className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center">
        <Image
          src={currentImage.url}
          alt={currentImage.altText || "Product photo zoom"}
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {/* Navigation Right */}
      {images.length > 1 && (
        <button
          onClick={() =>
            onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1)
          }
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
