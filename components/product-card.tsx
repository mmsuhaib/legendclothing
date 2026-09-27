"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    category?: { name: string; slug: string };
    images?: { url: string; altText?: string | null; isPrimary?: boolean }[];
    variants?: { id?: string; size: string; color: string; colorHex?: string | null; stock?: number }[];
    isNewArrival?: boolean;
    isFeatured?: boolean;
    stock?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { toast } = useToast();
  const [addedSize, setAddedSize] = useState<string | null>(null);

  const isFavorited = isInWishlist(product.id);

  // Primary image
  const primaryImg =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop";

  // Secondary image for hover effect
  const secondaryImg =
    product.images && product.images.length > 1
      ? product.images[1].url
      : primaryImg;

  // Extract unique sizes and colors from variants
  const distinctSizes = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return ["One Size"];
    const sizes = new Set<string>();
    product.variants.forEach((v) => {
      if (v.size) sizes.add(v.size);
    });
    return Array.from(sizes);
  }, [product.variants]);

  const distinctColors = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    const map = new Map<string, string>();
    product.variants.forEach((v) => {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, v.colorHex || "#121212");
      }
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [product.variants]);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice,
      image: primaryImg,
      category: product.category?.name || "Collection",
    });
    if (!isFavorited) {
      toast("Saved to your wishlist", "success");
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedColor = distinctColors[0]?.name || "Standard";

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: primaryImg,
      size: size,
      color: selectedColor,
      quantity: 1,
      stock: product.stock || 15,
    });

    setAddedSize(size);
    setTimeout(() => setAddedSize(null), 1500);

    toast(`Added ${product.name} (${size}) to bag`, "success");
  };

  const discountPercent =
    product.comparePrice && Number(product.comparePrice) > Number(product.price)
      ? Math.round(
        ((Number(product.comparePrice) - Number(product.price)) /
          Number(product.comparePrice)) *
        100
      )
      : null;

  return (
    <div className="group relative flex flex-col bg-white border border-[#E8E5E0] transition-all duration-300 hover:border-[#121212]/40 hover:-translate-y-1.5 hover:shadow-xl rounded-lg overflow-hidden gpu-accelerated">
      {/* Image container with ratio 3/4 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F4F1EA] block">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 block cursor-pointer">
          <Image
            src={primaryImg}
            alt={product.name}
            fill
            quality={80}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 ${secondaryImg !== primaryImg ? "group-hover:opacity-0" : ""
              }`}
          />
          {secondaryImg !== primaryImg && (
            <Image
              src={secondaryImg}
              alt={`${product.name} preview`}
              fill
              loading="lazy"
              quality={80}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-top opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        {/* Badges: Discount & New Arrival */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent && (
            <span className="bg-[#121212] text-[#FAF8F5] text-[9px] tracking-widest uppercase font-semibold px-2.5 py-0.5 rounded-sm shadow-sm transition-transform duration-200 group-hover:scale-105">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#9B783E] text-white text-[9px] tracking-widest uppercase font-semibold px-2.5 py-0.5 rounded-sm shadow-sm transition-transform duration-200 group-hover:scale-105">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md border border-[#E8E5E0] text-[#121212] hover:text-[#9B783E] hover:bg-white hover:border-[#9B783E]/40 hover:scale-110 active:scale-90 shadow-sm transition-all duration-200 z-10 cursor-pointer rounded-full"
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          title={isFavorited ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isFavorited ? "fill-[#9B783E] text-[#9B783E] scale-110" : "stroke-1 hover:scale-110"
              }`}
          />
        </button>

        {/* Quick-Add Size Selection Drawer on Hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none group-hover:pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-[#E8E5E0] shadow-xl p-2 rounded-md flex items-center justify-between gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#121212] px-1 hidden sm:inline flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-[#9B783E]" /> Quick Add
            </span>
            <div className="flex items-center gap-1 flex-1 justify-end">
              {distinctSizes.slice(0, 4).map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  className={`h-8 sm:h-7 min-w-[32px] sm:min-w-[28px] px-2 sm:px-1.5 text-[10px] uppercase font-semibold border rounded-xs transition-all duration-200 active:scale-90 flex items-center justify-center cursor-pointer ${addedSize === size
                      ? "bg-[#2A6B46] text-white border-[#2A6B46] scale-105 shadow-xs ring-2 ring-[#2A6B46]/30"
                      : "border-[#E8E5E0] bg-white text-[#121212] hover:border-[#121212] hover:bg-[#121212] hover:text-white"
                    }`}
                  title={`Add size ${size} to bag`}
                >
                  {addedSize === size ? <Check className="w-3.5 h-3.5 stroke-2 animate-in zoom-in-75 duration-200" /> : size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product metadata */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Category kicker & subtle rating */}
          <div className="flex items-center justify-between mb-1.5">
            {product.category && (
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#9B783E] font-medium block">
                {product.category.name}
              </span>
            )}
            <div className="flex items-center gap-1 text-[10px] text-[#8E8B85]">
              <Star className="w-3 h-3 fill-[#C29D59] text-[#C29D59]" />
              <span className="font-medium text-[#121212]">4.9</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            href={`/product/${product.slug}`}
            className="text-xs sm:text-sm font-medium text-[#121212] hover:text-[#9B783E] transition-colors duration-200 line-clamp-1 tracking-wide"
          >
            {product.name}
          </Link>

          {/* Color Swatch Dots Preview */}
          {distinctColors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {distinctColors.slice(0, 4).map((color, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-2xs hover:scale-125 transition-transform duration-200 cursor-default"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {distinctColors.length > 4 && (
                <span className="text-[9px] text-[#8E8B85] font-medium">
                  +{distinctColors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-2.5 border-t border-[#F0EDE8] flex items-center justify-between">
          <div className="flex flex-col items-start leading-snug">
            <span className="text-sm font-semibold text-[#121212] tracking-tight">
              LKR {Math.round(product.price).toLocaleString("en-US")}
            </span>
            {product.comparePrice &&
              Number(product.comparePrice) > Number(product.price) ? (
              <span className="text-[11px] text-[#8E8B85] line-through font-normal">
                LKR {Math.round(Number(product.comparePrice)).toLocaleString("en-US")}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] tracking-wider uppercase text-[#8E8B85] font-medium group-hover:text-[#9B783E] transition-colors">
            View Piece →
          </span>
        </div>
      </div>
    </div>
  );
}
