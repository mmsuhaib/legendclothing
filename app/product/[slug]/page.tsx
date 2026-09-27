"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useToast } from "@/context/toast-context";
import { SizeGuideModal } from "@/components/size-guide-modal";
import { LightboxModal } from "@/components/lightbox-modal";
import { ProductCard } from "@/components/product-card";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  details?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  category: { name: string; slug: string; image?: string | null };
  images: { id: string; url: string; altText?: string | null; isPrimary?: boolean }[];
  variants: {
    id: string;
    size: string;
    color: string;
    colorHex?: string | null;
    stock: number;
  }[];
  related?: any[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart, shippingFee, shippingLabel } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Selection state
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    details: false,
    shipping: false,
    returns: false,
  });

  // Fetch product data
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProduct(data);
          // Set initial variants
          if (data.variants && data.variants.length > 0) {
            setSelectedColor(data.variants[0].color);
            setSelectedSize(data.variants[0].size);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-light uppercase tracking-wider text-[#121212]">
          Piece Not Found
        </h2>
        <p className="text-xs text-[#66635F] mt-2">
          The requested item is no longer in our current archive.
        </p>
        <Link
          href="/shop"
          className="mt-6 px-6 py-3 bg-[#121212] text-white text-xs uppercase tracking-widest hover:bg-[#9B783E]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.category?.image
        ? [
          {
            id: "category-default",
            url: product.category.image,
            altText: product.name,
          },
        ]
        : [];

  // Distinct colors and sizes from variants
  const distinctColors = Array.from(
    new Map(
      product.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex || "#121212" }])
    ).values()
  );

  const distinctSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: images[0]?.url,
      size: selectedSize || "Standard",
      color: selectedColor || "Standard",
      quantity,
      stock: product.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    toast(`Added to your bag (${quantity})`, "success");
  };

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: images[0]?.url,
      size: selectedSize || "Standard",
      color: selectedColor || "Standard",
      quantity,
      stock: product.stock,
    });
    router.push("/checkout");
  };

  const isFavorited = isInWishlist(product.id);

  const discountPercent =
    product.comparePrice && Number(product.comparePrice) > Number(product.price)
      ? Math.round(
          ((Number(product.comparePrice) - Number(product.price)) /
            Number(product.comparePrice)) *
            100
        )
      : null;

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#8E8B85] mb-8">
          <Link href="/" className="hover:text-[#121212]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#121212]">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-[#121212]">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-[#121212] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Product Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Large Image Gallery with Vertical Thumbnails (8 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Vertical Thumbnails (Desktop) */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[680px] shrink-0 pb-2 md:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-22 sm:w-20 sm:h-26 shrink-0 border overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${activeImageIndex === idx
                        ? "border-[#121212] ring-2 ring-[#121212]"
                        : "border-[#E8E5E0] hover:border-[#121212] opacity-80 hover:opacity-100"
                      }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover object-top transition-transform duration-300 hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Primary Large Image */}
            <div className="relative flex-1 aspect-[3/4] bg-white border border-[#E8E5E0] overflow-hidden group">
              <Image
                src={images[activeImageIndex]?.url}
                alt={images[activeImageIndex]?.altText || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-103 cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Lightbox Zoom Action Button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-xs border border-[#E8E5E0] text-[#121212] hover:text-[#9B783E] hover:bg-white hover:border-[#9B783E]/40 hover:scale-110 active:scale-95 shadow-xs transition-all duration-200 cursor-pointer"
                aria-label="Expand image"
                title="Fullscreen Zoom"
              >
                <Maximize2 className="w-4 h-4 stroke-1" />
              </button>

              {/* Discount Tag */}
              {discountPercent && (
                <span className="absolute top-4 left-4 bg-[#121212] text-[#FAF8F5] text-[10px] tracking-widest uppercase font-medium px-2.5 py-1 shadow-xs">
                  Save {discountPercent}%
                </span>
              )}

              {/* Prev / Next controls for quick browsing */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/85 hover:bg-white border border-[#E8E5E0] hover:border-[#121212]/30 text-[#121212] hover:text-[#9B783E] hover:scale-110 active:scale-90 shadow-sm transition-all duration-200 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/85 hover:bg-white border border-[#E8E5E0] hover:border-[#121212]/30 text-[#121212] hover:text-[#9B783E] hover:scale-110 active:scale-90 shadow-sm transition-all duration-200 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Mobile photo counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2.5 py-1 tracking-widest font-mono">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>
          </div>

          {/* RIGHT: Product Information (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-7">
            {/* Header info */}
            <div className="border-b border-[#E8E5E0] pb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.25em] uppercase text-[#8E8B85]">
                  {product.category?.name} • SKU: {product.sku}
                </span>
                <button
                  onClick={() => {
                    toggleWishlist({
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      comparePrice: product.comparePrice,
                      image: images[0]?.url,
                      category: product.category?.name,
                    });
                    if (!isFavorited) toast("Saved to your wishlist", "success");
                  }}
                  className="p-2 rounded-full text-[#121212] hover:text-[#9B783E] hover:bg-black/5 hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
                  aria-label="Wishlist toggle"
                >
                  <Heart
                    className={`w-5 h-5 transition-transform duration-200 ${isFavorited ? "fill-[#9B783E] text-[#9B783E] scale-110" : "stroke-1 hover:scale-110"
                      }`}
                  />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-light tracking-[0.08em] uppercase text-[#121212]">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="flex items-start gap-4 pt-1">
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-2xl sm:text-3xl font-semibold text-[#121212] tracking-tight">
                    LKR {Math.round(product.price).toLocaleString()}
                  </span>
                  {product.comparePrice &&
                    Number(product.comparePrice) > Number(product.price) && (
                      <span className="text-base sm:text-lg text-[#8E8B85] line-through font-normal mt-0.5">
                        LKR {Math.round(Number(product.comparePrice)).toLocaleString()}
                      </span>
                    )}
                </div>
                {discountPercent && (
                  <span className="mt-1 text-[11px] font-semibold text-[#B91C1C] bg-red-50 border border-red-200 px-2.5 py-1 rounded-xs tracking-wider uppercase">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-[#66635F] leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            {distinctColors.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#121212]">
                    Color: <strong className="font-normal text-[#66635F]">{selectedColor}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {distinctColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-8 h-8 rounded-full border p-0.5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-2xs flex items-center justify-center ${selectedColor === color.name
                          ? "border-[#121212] ring-2 ring-[#121212]/30"
                          : "border-[#D8D4CD] hover:border-[#121212]"
                        }`}
                      title={color.name}
                    >
                      <span
                        className="w-full h-full rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {selectedColor === color.name && (
                        <Check className={`w-3.5 h-3.5 absolute ${color.hex === "#FFFFFF" || color.hex === "#FAF8F5" ? "text-black" : "text-white"}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {distinctSizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#121212]">
                    Select Size
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-[#9B783E] hover:text-[#826330] hover:underline underline-offset-4 text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {distinctSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-11 px-3 text-xs uppercase font-medium border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${selectedSize === size
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

            {/* Stock Status & Quantity */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E8E5E0] text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    product.stock > 0 ? "bg-[#2A6B46]" : "bg-red-500"
                  }`}
                />
                <span className="text-[#66635F]">
                  {product.stock > 0
                    ? "In Stock — Ready for Dispatch"
                    : "Out of Stock"}
                </span>
              </div>

              {/* Quantity counter */}
              <div className="flex items-center border border-[#E8E5E0] bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-[#FAF4EB] hover:text-[#9B783E] active:scale-90 text-[#121212] transition-all duration-150 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-3 text-xs font-semibold text-[#121212]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 hover:bg-[#FAF4EB] hover:text-[#9B783E] active:scale-90 text-[#121212] transition-all duration-150 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-xs ${justAdded
                    ? "bg-[#2A6B46] text-white scale-[1.01] ring-2 ring-[#2A6B46]/30 shadow-md"
                    : "bg-[#121212] text-[#FAF8F5] hover:bg-[#9B783E] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                  }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-2 animate-in zoom-in-75" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-1" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-4 border border-[#121212] bg-white text-[#121212] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#121212] hover:text-[#FAF8F5] hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* Guarantee badges */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#E8E5E0] text-center text-[10px] uppercase tracking-wider text-[#66635F]">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#9B783E] stroke-1" />
                <span>Express Courier</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#9B783E] stroke-1" />
                <span>Bank Wire Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#9B783E] stroke-1" />
                <span>30-Day Exchanges</span>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="divide-y divide-[#E8E5E0] border-b border-[#E8E5E0]">
              {/* Description & Fit */}

              {/* Details & Fabric */}
              <div>
                <button
                  onClick={() => toggleAccordion("details")}
                  className="w-full py-3.5 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-[#121212]"
                >
                  <span>Fabric & Care Details</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8E8B85] transition-transform ${openAccordions.details ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {openAccordions.details && (
                  <div className="pb-4 text-xs text-[#66635F] leading-relaxed space-y-2 animate-in fade-in">
                    <p>{product.details || "Crafted from 100% natural long-staple fibers."}</p>
                    <p>
                      Dry clean recommended, or machine wash cold on delicate cycle with
                      mild detergent. Lay flat to dry away from direct heat.
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div>
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full py-3.5 flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-[#121212]"
                >
                  <span>{shippingLabel} </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8E8B85] transition-transform ${openAccordions.shipping ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {openAccordions.shipping && (
                  <div className="pb-4 text-xs text-[#66635F] leading-relaxed space-y-2 animate-in fade-in">
                    <p>
                      Fixed delivery fee of LKR {shippingFee.toLocaleString()} applied to all orders across Sri Lanka.
                      Orders are dispatched within 24-48 business hours following verification.
                    </p>
                    <p>
                      Estimated delivery: 2-3 business days with direct door-to-door tracking.
                    </p>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {product.related && product.related.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#E8E5E0]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
                  Complementary
                </span>
                <h3 className="text-xl sm:text-2xl font-light tracking-wider uppercase text-[#121212] mt-1">
                  Complete the Look
                </h3>
              </div>
              <Link
                href={`/shop?category=${product.category?.slug}`}
                className="text-xs uppercase tracking-wider text-[#9B783E] hover:underline"
              >
                More in {product.category?.name} →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {product.related.map((rel: any) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        currentIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        categoryName={product.category?.name}
      />
    </div>
  );
}
