"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Check, RotateCcw, ArrowRight, Layers } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { getClientCategories } from "@/lib/cached-categories";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  category: { name: string; slug: string };
  images: { url: string; altText?: string | null; isPrimary?: boolean }[];
  variants: { size: string; color: string; colorHex?: string | null; stock: number }[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "popular", label: "Most Desired" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const initialCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smooth body scroll lock for mobile filter drawer
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen]);

  // Handle Escape key for mobile filter drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileFilterOpen) {
        setMobileFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileFilterOpen]);


  // Sync category from URL param whenever searchParams changes
  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat || "all");
  }, [searchParams]);

  // Load categories and initial products from database
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catData, prodRes] = await Promise.all([
          getClientCategories(),
          fetch("/api/products"),
        ]);
        if (Array.isArray(catData)) {
          setCategories(catData.filter((c: any) => c.isActive));
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
      } catch (err) {
        console.error("Failed to load shop data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute dynamic lowest and highest price in catalog so price filter never hides products unexpectedly
  const minCatalogPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.min(...products.map((p) => p.price || 0));
  }, [products]);

  const maxCatalogPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    const maxP = Math.max(...products.map((p) => p.price || 0));
    return Math.max(Math.ceil(maxP / 500) * 500, 1000);
  }, [products]);

  // Robust category matcher: handles "t-shirts", "t shirts", "tshirts", casing
  const isCategoryMatch = (catSlug?: string | null, targetSlug?: string | null) => {
    if (!targetSlug || targetSlug === "all") return true;
    if (!catSlug) return false;
    const s1 = catSlug.toLowerCase().replace(/[\s_-]+/g, "");
    const s2 = targetSlug.toLowerCase().replace(/[\s_-]+/g, "");
    return s1 === s2 || catSlug.toLowerCase() === targetSlug.toLowerCase();
  };

  // Handler to select category and push to URL
  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    if (catSlug === "all") {
      router.push("/shop", { scroll: false });
    } else {
      router.push(`/shop?category=${catSlug}`, { scroll: false });
    }
  };

  // Compute available sizes and colors across catalog
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => p.variants?.forEach((v) => sizes.add(v.size)));
    return Array.from(sizes);
  }, [products]);

  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    products.forEach((p) =>
      p.variants?.forEach((v) => {
        if (!colorMap.has(v.color)) {
          colorMap.set(v.color, v.colorHex || "#121212");
        }
      })
    );
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter (flexible normalized slug match)
        if (selectedCategory !== "all" && !isCategoryMatch(p.category?.slug, selectedCategory)) {
          return false;
        }
        // Price filter: ONLY filter if user actively chose a price limit
        if (priceRange !== null && p.price > priceRange) {
          return false;
        }
        // Size filter
        if (selectedSize && !p.variants?.some((v) => v.size === selectedSize)) {
          return false;
        }
        // Color filter
        if (selectedColor && !p.variants?.some((v) => v.color === selectedColor)) {
          return false;
        }
        // Stock filter
        if (inStockOnly && p.stock <= 0) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "popular") return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        return 0; // default newest
      });
  }, [products, selectedCategory, selectedSize, selectedColor, priceRange, inStockOnly, sortBy]);

  // Group products by category for separated category view
  const groupedByCategory = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        products: filteredProducts.filter((p) => isCategoryMatch(p.category?.slug, cat.slug)),
      }))
      .filter((group) => group.products.length > 0);
  }, [categories, filteredProducts]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedSize(null);
    setSelectedColor(null);
    setPriceRange(null);
    setInStockOnly(false);
    setSortBy("newest");
    router.push("/shop", { scroll: false });
  };

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (priceRange !== null && priceRange < maxCatalogPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => isCategoryMatch(c.slug, selectedCategory));
  }, [categories, selectedCategory]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Top Header */}
        <div className="border-b border-[#E8E5E0] pb-8 mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
            LEGEND Clothing
          </span>
          <h1 className="text-3xl sm:text-4xl font-light tracking-[0.15em] uppercase text-[#121212] mt-1">
            {selectedCategory !== "all"
              ? activeCategoryObj?.name || "The Collection"
              : "All Garments & Collections"}
          </h1>
          <p className="text-xs sm:text-sm text-[#66635F] mt-2 max-w-xl">
            {selectedCategory !== "all" && activeCategoryObj?.description
              ? activeCategoryObj.description
              : "Artisanal Italian cottons, heavyweight Japanese selvedge denim, and architectural tailoring crafted with timeless refinement."}
          </p>
        </div>

        {/* Sticky Category Collections Navigation & Controls Bar */}
        <div className="sticky top-[58px] sm:top-[64px] z-30 bg-[#FAF8F5] pt-2.5 pb-3 mb-8 border-b border-[#E8E5E0] shadow-xs">
          {/* Category Pill Tabs Bar with Live Product Counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            <button
              onClick={() => handleSelectCategory("all")}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full border transition-all duration-200 shrink-0 flex items-center gap-2.5 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 ${selectedCategory === "all"
                ? "bg-[#121212] text-white border-[#121212]"
                : "bg-white text-[#66635F] border-[#E8E5E0] hover:border-[#121212] hover:text-[#121212]"
                }`}
            >
              <span className="font-medium">All Pieces</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedCategory === "all"
                  ? "bg-white/20 text-white"
                  : "bg-black/5 text-[#8E8B85]"
                  }`}
              >
                {products.length}
              </span>
            </button>
            {categories.map((cat) => {
              const isSelected = isCategoryMatch(cat.slug, selectedCategory);
              const catCount = products.filter((p) => isCategoryMatch(p.category?.slug, cat.slug)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full border transition-all duration-200 shrink-0 flex items-center gap-2.5 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 ${isSelected
                    ? "bg-[#121212] text-white border-[#121212]"
                    : "bg-white text-[#66635F] border-[#E8E5E0] hover:border-[#121212] hover:text-[#121212]"
                    }`}
                >
                  <span className="font-medium">{cat.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isSelected ? "bg-[#9B783E] text-white" : "bg-black/5 text-[#8E8B85]"
                      }`}
                  >
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls Bar: Results Count + Filter Button (Mobile) + Sort Dropdown */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2.5 border-t border-[#E8E5E0]/60">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 sm:gap-2 border border-[#E8E5E0] bg-white text-[11px] sm:text-xs uppercase tracking-wider text-[#121212] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:border-[#9B783E] active:scale-95 transition-all duration-200 cursor-pointer shadow-xs shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#9B783E]" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#9B783E] text-white text-[9px] flex items-center justify-center font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <span className="text-[10px] sm:text-xs text-[#66635F] tracking-wide inline-flex items-center gap-1 whitespace-nowrap">
                <span>Showing</span>
                <strong className="text-[#121212] font-semibold">{filteredProducts.length}</strong>
                <span>pieces</span>
                {selectedCategory !== "all" && (
                  <span className="hidden sm:inline">
                    {" "}in <strong className="text-[#9B783E] font-medium">{activeCategoryObj?.name || selectedCategory}</strong>
                  </span>
                )}
              </span>
            </div>

            {/* Luxury Rounded Sort Dropdown */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8E8B85] hidden sm:inline">
                Sort By:
              </span>
              <div ref={sortRef} className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className={`group flex items-center justify-between gap-2 sm:gap-3 bg-white border text-[11px] sm:text-xs uppercase tracking-wider text-[#121212] py-1.5 sm:py-2 pl-3 sm:pl-4 pr-2 sm:pr-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm ${
                    sortOpen
                      ? "border-[#9B783E] ring-2 ring-[#9B783E]/20 bg-white"
                      : "border-[#E8E5E0] hover:border-[#9B783E]"
                  }`}
                >
                  <span className="font-medium text-[#121212] group-hover:text-[#9B783E] transition-colors">
                    {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Newest Arrivals"}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                      sortOpen
                        ? "bg-[#9B783E] text-white"
                        : "bg-[#FAF8F5] text-[#8E8B85] group-hover:bg-[#9B783E]/10 group-hover:text-[#9B783E]"
                    }`}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        sortOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                {/* Floating Menu with Border Radius & Glassmorphic Elevation */}
                {sortOpen && (
                  <div
                    role="listbox"
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E8E5E0] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 border-b border-[#F0EDE8] mb-1">
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8E8B85]">
                        Sort Selection
                      </span>
                    </div>
                    {SORT_OPTIONS.map((option) => {
                      const isSelected = sortBy === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "text-[#9B783E] font-semibold bg-[#9B783E]/10"
                              : "text-[#4A4845] hover:text-[#121212] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#9B783E]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar Filters (Desktop) + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          {/* Left Desktop Sidebar Filters */}
          <aside className="hidden lg:block sticky top-[180px] max-h-[calc(100vh-195px)] overflow-y-auto space-y-8 pr-6 border-r border-[#E8E5E0] scrollbar-thin">
            {/* Header & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5E0]">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212]">
                Refine Selection
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-[#9B783E] hover:text-[#826330] flex items-center gap-1 uppercase tracking-wider group active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform duration-300" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-[#121212] mb-3">
                Category
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleSelectCategory("all")}
                  className={`w-full text-left text-xs py-1.5 transition-all duration-200 flex items-center justify-between hover:translate-x-1 cursor-pointer ${selectedCategory === "all"
                    ? "text-[#121212] font-semibold"
                    : "text-[#66635F] hover:text-[#121212]"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span>All Categories</span>
                    <span className="text-[10px] text-[#8E8B85]">({products.length})</span>
                  </div>
                  {selectedCategory === "all" && <Check className="w-3 h-3 text-[#9B783E]" />}
                </button>
                {categories.map((cat) => {
                  const isCatActive = isCategoryMatch(cat.slug, selectedCategory);
                  const count = products.filter((p) => isCategoryMatch(p.category?.slug, cat.slug)).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.slug)}
                      className={`w-full text-left text-xs py-1.5 transition-all duration-200 flex items-center justify-between hover:translate-x-1 cursor-pointer ${isCatActive
                        ? "text-[#121212] font-semibold"
                        : "text-[#66635F] hover:text-[#121212]"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-[#8E8B85]">({count})</span>
                      </div>
                      {isCatActive && <Check className="w-3 h-3 text-[#9B783E]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-[#121212]">
                  Max Price
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#121212]">
                    LKR {(priceRange ?? maxCatalogPrice).toLocaleString()}
                  </span>
                  {priceRange !== null && (
                    <button
                      onClick={() => setPriceRange(null)}
                      className="text-[10px] text-[#8E8B85] hover:text-[#121212] underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={minCatalogPrice}
                max={maxCatalogPrice}
                step={50}
                value={priceRange ?? maxCatalogPrice}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#9B783E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8E8B85] mt-1">
                <span>LKR {minCatalogPrice.toLocaleString()}</span>
                <span>LKR {maxCatalogPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Size Filter */}
            {availableSizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-[#121212]">
                    Size
                  </h4>
                  {selectedSize && (
                    <button
                      onClick={() => setSelectedSize(null)}
                      className="text-[10px] text-[#8E8B85] hover:text-[#121212] underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSize(selectedSize === size ? null : size)
                      }
                      className={`min-w-[36px] h-8 px-2 text-xs uppercase font-medium border transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${selectedSize === size
                        ? "border-[#121212] bg-[#121212] text-white"
                        : "border-[#E8E5E0] bg-white text-[#121212] hover:border-[#121212]"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Filter */}
            {availableColors.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-[#121212]">
                    Color
                  </h4>
                  {selectedColor && (
                    <button
                      onClick={() => setSelectedColor(null)}
                      className="text-[10px] text-[#8E8B85] hover:text-[#121212] underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() =>
                        setSelectedColor(selectedColor === color.name ? null : color.name)
                      }
                      className={`w-full flex items-center gap-2.5 text-xs py-1.5 text-left transition-all duration-200 hover:translate-x-1 cursor-pointer group ${selectedColor === color.name
                        ? "font-semibold text-[#121212]"
                        : "text-[#66635F] hover:text-[#121212]"
                        }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#D8D4CD] shrink-0 group-hover:scale-115 transition-transform duration-200"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="pt-2 border-t border-[#E8E5E0]">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#121212] hover:text-[#9B783E] transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-none border-[#D8D4CD] accent-[#9B783E] cursor-pointer"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Right Product Grid: Category-Separated or Filtered Display */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-[#E8E5E0]/60 rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center border border-[#E8E5E0] bg-white p-8">
                <p className="text-sm font-light text-[#121212]">
                  No pieces matched your current filter criteria.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-6 py-2.5 bg-[#121212] text-white text-xs uppercase tracking-widest hover:bg-[#9B783E] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : selectedCategory === "all" ? (
              /* SEPARATED BY CATEGORY WHEN VIEWING ALL PIECES */
              <div className="space-y-16">
                {groupedByCategory.map(({ category, products: catProducts }, groupIdx) => (
                  <section
                    key={category.id}
                    className={`space-y-6 ${groupIdx > 0 ? "pt-12 border-t border-[#E8E5E0]" : ""}`}
                  >
                    {/* Category Group Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-5 h-px bg-[#9B783E]" />
                          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9B783E] font-medium">
                            Category Collection
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.15em] text-[#121212]">
                            {category.name}
                          </h2>
                          <span className="text-[10px] uppercase tracking-wider bg-black/5 text-[#66635F] px-2.5 py-0.5 rounded-full border border-[#E8E5E0]">
                            {catProducts.length} {catProducts.length === 1 ? "Piece" : "Pieces"}
                          </span>
                        </div>
                        {category.description && (
                          <p className="text-xs text-[#66635F] mt-1.5 max-w-lg">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleSelectCategory(category.slug)}
                        className="self-start sm:self-auto text-xs uppercase tracking-[0.16em] text-[#9B783E] hover:text-[#826330] flex items-center gap-1.5 font-medium transition-all group cursor-pointer"
                      >
                        <span>View Only {category.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>

                    {/* Products Grid for this category */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      {catProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* SPECIFIC CATEGORY FILTERED VIEW */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E5E0]">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#9B783E] font-medium">
                      Category Collection
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.15em] text-[#121212] mt-0.5">
                      {activeCategoryObj?.name || selectedCategory}
                    </h2>
                    <p className="text-xs text-[#66635F] mt-1 max-w-xl">
                      {activeCategoryObj?.description ||
                        `Displaying all pieces in the ${selectedCategory} collection.`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory("all")}
                    className="text-xs uppercase tracking-wider text-[#9B783E] hover:text-[#826330] underline font-medium cursor-pointer"
                  >
                    View All Categories
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer with smooth cubic-bezier transitions */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-400 ${
          mobileFilterOpen ? "pointer-events-auto visible" : "pointer-events-none invisible delay-300"
        }`}
        aria-hidden={!mobileFilterOpen}
      >
        <div
          onClick={() => setMobileFilterOpen(false)}
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs drawer-backdrop ${
            mobileFilterOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`fixed inset-y-0 right-0 max-w-sm w-full bg-[#FAF8F5] border-l border-[#E8E5E0] shadow-2xl flex flex-col drawer-panel ${
            mobileFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-5 border-b border-[#E8E5E0] flex items-center justify-between bg-white">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#121212]">
              Filter Products
            </span>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="p-2 text-[#121212] hover:text-[#9B2C2C] hover:bg-black/5 rounded-full hover:rotate-90 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-5 h-5 stroke-1" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 overscroll-contain">
              {/* Category */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#121212] mb-2">
                  Category
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSelectCategory("all")}
                    className={`px-3 py-1.5 text-xs uppercase tracking-wider border hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${selectedCategory === "all"
                      ? "border-[#121212] bg-[#121212] text-white"
                      : "border-[#E8E5E0] bg-white text-[#121212] hover:border-[#121212]"
                      }`}
                  >
                    All ({products.length})
                  </button>
                  {categories.map((cat) => {
                    const isCatActive = isCategoryMatch(cat.slug, selectedCategory);
                    const count = products.filter((p) => isCategoryMatch(p.category?.slug, cat.slug)).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={`px-3 py-1.5 text-xs uppercase tracking-wider border hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${isCatActive
                          ? "border-[#121212] bg-[#121212] text-white"
                          : "border-[#E8E5E0] bg-white text-[#121212] hover:border-[#121212]"
                          }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[#121212]">
                    Max Price
                  </span>
                  <div className="flex items-center gap-2">
                    <span>LKR {(priceRange ?? maxCatalogPrice).toLocaleString()}</span>
                    {priceRange !== null && (
                      <button
                        onClick={() => setPriceRange(null)}
                        className="text-[10px] text-[#8E8B85] hover:text-[#121212] underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={minCatalogPrice}
                  max={maxCatalogPrice}
                  step={50}
                  value={priceRange ?? maxCatalogPrice}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#9B783E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8E8B85] mt-1">
                  <span>LKR {minCatalogPrice.toLocaleString()}</span>
                  <span>LKR {maxCatalogPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Size */}
              {availableSizes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#121212] mb-2">
                    Size
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedSize(selectedSize === size ? null : size)
                        }
                        className={`w-10 h-10 border text-xs uppercase hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${selectedSize === size
                          ? "border-[#121212] bg-[#121212] text-white"
                          : "border-[#E8E5E0] bg-white text-[#121212] hover:border-[#121212]"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[#E8E5E0] bg-white flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 border border-[#E8E5E0] text-xs uppercase tracking-wider text-[#121212] hover:border-[#121212] hover:bg-black/5 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9B783E] hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
              >
                View Results ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

