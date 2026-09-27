"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleMoveToBag = (item: any) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      size: "M", // Default standard size
      color: "Standard",
      quantity: 1,
    });
    removeFromWishlist(item.productId);
    toast(`Moved ${item.name} to bag`, "success");
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-[#E8E5E0] mb-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
              Curated Favorites
            </span>
            <h1 className="text-3xl sm:text-4xl font-light tracking-[0.15em] uppercase text-[#121212] mt-1">
              Your Wishlist ({wishlist.length})
            </h1>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs uppercase tracking-wider text-[#8E8B85] hover:text-[#9B2C2C] transition-colors mt-3 sm:mt-0"
            >
              Clear All Saved
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-16 h-16 border border-[#E8E5E0] bg-white flex items-center justify-center mx-auto mb-5">
              <Heart className="w-7 h-7 text-[#8E8B85] stroke-1" />
            </div>
            <h2 className="text-lg font-light tracking-wider uppercase text-[#121212]">
              Save the pieces you love.
            </h2>
            <p className="text-xs text-[#66635F] mt-2 leading-relaxed">
              Explore our collections of tailored overshirts, selvedge denim, and
              artisanal scents. Save your favorites here to revisit anytime.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-[#121212] text-white text-xs uppercase tracking-widest hover:bg-[#9B783E] transition-colors"
            >
              Explore The Shop <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((item) => (
              <div
                key={item.productId}
                className="group flex flex-col bg-white border border-[#E8E5E0] p-3 rounded-lg transition-all hover:border-[#121212] hover:shadow-md"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F4F1EA] mb-3 rounded-md">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 border border-[#E8E5E0] text-[#8E8B85] hover:text-[#9B2C2C] transition-colors rounded-full"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#8E8B85] block">
                      {item.category}
                    </span>
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-xs sm:text-sm font-medium text-[#121212] hover:text-[#9B783E] transition-colors line-clamp-1 mt-0.5"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 flex flex-col items-start leading-tight">
                      <span className="text-xs font-semibold text-[#121212]">
                        LKR {Math.round(item.price).toLocaleString()}
                      </span>
                      {item.comparePrice &&
                        Number(item.comparePrice) > Number(item.price) && (
                          <span className="text-[10px] text-[#8E8B85] line-through font-normal mt-0.5">
                            LKR {Math.round(Number(item.comparePrice)).toLocaleString()}
                          </span>
                        )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMoveToBag(item)}
                    className="mt-4 w-full py-2.5 border border-[#121212] bg-[#FAF8F5] text-[#121212] hover:bg-[#121212] hover:text-white text-xs uppercase tracking-wider font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
