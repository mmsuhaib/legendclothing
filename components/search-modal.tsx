"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch live categories for suggestions (zero hardcoding)
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setSuggestions(cats.filter((c: any) => c.isActive).map((c: any) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live search debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF8F5]/98 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      {/* Top Search Bar */}
      <div className="w-full border-b border-[#E8E5E0] bg-white/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <Search className="w-6 h-6 text-[#121212]/60" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pieces, collections, or SKU..."
              className="w-full bg-transparent text-sm sm:text-lg md:text-2xl font-light text-[#121212] placeholder:text-[#8E8B85] focus:outline-none tracking-wide"
            />
            {loading && <Loader2 className="w-5 h-5 animate-spin text-[#9B783E]" />}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#121212] hover:text-[#9B2C2C] hover:bg-black/5 rounded-full hover:rotate-90 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-6 h-6 stroke-1" />
          </button>
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {query.trim() === "" ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8E8B85] mb-4">
              Explore Collections & Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 border border-[#E8E5E0] bg-white text-xs uppercase tracking-wider text-[#121212] hover:border-[#9B783E] hover:text-[#9B783E] hover:bg-[#FAF4EB] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8E8B85]">
                {results.length} {results.length === 1 ? "Result" : "Results"} for &ldquo;{query}&rdquo;
              </p>
              <Link
                href={`/shop?search=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="text-xs uppercase tracking-wider text-[#9B783E] hover:underline flex items-center gap-1 group transition-all"
              >
                <span>View all in Shop</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.slice(0, 8).map((product) => {
                const primaryImg =
                  product.images?.find((img: any) => img.isPrimary)?.url ||
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop";

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="group flex flex-col bg-white border border-[#E8E5E0] p-3 rounded-lg transition-all duration-300 hover:border-[#121212]/40 hover:-translate-y-1 hover:shadow-md cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F4F1EA] mb-3 rounded-md">
                      <Image
                        src={primaryImg}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#8E8B85]">
                      {product.category?.name} • SKU: {product.sku}
                    </span>
                    <h4 className="text-sm font-medium text-[#121212] mt-1 line-clamp-1 group-hover:text-[#9B783E] transition-colors">
                      {product.name}
                    </h4>
                    <div className="mt-2 flex flex-col items-start leading-tight">
                      <span className="text-xs font-semibold text-[#121212]">
                        LKR {Math.round(product.price).toLocaleString()}
                      </span>
                      {product.comparePrice &&
                        Number(product.comparePrice) > Number(product.price) && (
                          <span className="text-[10px] text-[#8E8B85] line-through font-normal mt-0.5">
                            LKR {Math.round(Number(product.comparePrice)).toLocaleString()}
                          </span>
                        )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <p className="text-base text-[#121212] font-light">
                No products found matching &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-[#8E8B85] mt-2 tracking-wide">
                Please check your spelling or try searching for another term.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
