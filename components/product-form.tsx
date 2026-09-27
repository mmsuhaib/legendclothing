"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  UploadCloud,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImageItem {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const DENIM_SIZES = ["28", "30", "32", "34", "36", "38", "40"];
const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"];

const isDenimCategory = (cat?: { name?: string; slug?: string } | null) => {
  if (!cat) return false;
  const name = (cat.name || "").toLowerCase();
  const slug = (cat.slug || "").toLowerCase();
  return (
    name.includes("denim") ||
    slug.includes("denim") ||
    name.includes("jean") ||
    slug.includes("jean")
  );
};

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [comparePrice, setComparePrice] = useState(
    initialData?.comparePrice ? initialData.comparePrice.toString() : ""
  );
  const [stock, setStock] = useState(initialData?.stock?.toString() || "15");
  const [description] = useState(initialData?.description || "");
  const [details, setDetails] = useState(initialData?.details || "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival ?? true);

  // Images state
  const [images, setImages] = useState<ProductImageItem[]>(
    initialData?.images || []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sizes & Colors Tags
  const [sizes, setSizes] = useState<string[]>(() => {
    if (initialData?.variants?.length) {
      return Array.from(new Set(initialData.variants.map((v: any) => v.size)));
    }
    if (isDenimCategory(initialData?.category)) {
      return DENIM_SIZES;
    }
    return STANDARD_SIZES;
  });
  const [newSizeInput, setNewSizeInput] = useState("");

  const [colors, setColors] = useState<string[]>(
    initialData?.variants?.length
      ? Array.from(new Set(initialData.variants.map((v: any) => v.color)))
      : ["Ivory", "Obsidian Black"]
  );
  const [newColorInput, setNewColorInput] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCategories(data);
        if (!categoryId && data.length > 0) {
          const firstCat = data[0];
          setCategoryId(firstCat.id);
          if (!initialData?.variants?.length) {
            setSizes(isDenimCategory(firstCat) ? DENIM_SIZES : STANDARD_SIZES);
          }
        }
      });
  }, [categoryId, initialData]);

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const selectedCat = categories.find((c) => c.id === newCatId);
    if (isDenimCategory(selectedCat)) {
      setSizes(DENIM_SIZES);
    } else {
      setSizes(STANDARD_SIZES);
    }
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg|avif|gif)$/i.test(file.name);
    if (!isImage) {
      toast("Please select a valid image file (PNG, JPG, WEBP, SVG)", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Image upload failed");
      }
      const data = await res.json();

      setImages((prev) => [
        ...prev,
        {
          url: data.url,
          altText: `${name || "Product"} photo`,
          isPrimary: prev.length === 0,
        },
      ]);
      toast("Image uploaded successfully", "success");
    } catch (e: any) {
      toast(e?.message || "Error uploading image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: newImageUrl.trim(),
        altText: `${name || "Product"} photo`,
        isPrimary: prev.length === 0,
      },
    ]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const item = copy.splice(from, 1)[0];
      copy.splice(to, 0, item);
      return copy;
    });
  };

  // Tag Handlers
  const handleAddSize = () => {
    const s = newSizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) {
      setSizes([...sizes, s]);
      setNewSizeInput("");
    }
  };

  const handleRemoveSize = (s: string) => {
    setSizes(sizes.filter((item) => item !== s));
  };

  const handleAddColor = () => {
    const c = newColorInput.trim();
    if (c && !colors.includes(c)) {
      setColors([...colors, c]);
      setNewColorInput("");
    }
  };

  const handleRemoveColor = (c: string) => {
    setColors(colors.filter((item) => item !== c));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price || !categoryId) {
      toast("Please fill in all required fields", "error");
      return;
    }

    if (images.length === 0) {
      toast("Please add at least one product image", "error");
      return;
    }

    setLoading(true);

    // Build variants combination
    const variants = [];
    for (const c of colors) {
      for (const s of sizes) {
        variants.push({
          size: s,
          color: c,
          colorHex: c.toLowerCase().includes("black")
            ? "#121212"
            : c.toLowerCase().includes("white") || c.toLowerCase().includes("ivory")
            ? "#FAF8F5"
            : "#66635F",
          stock: Math.max(1, Math.floor(parseInt(stock, 10) / (colors.length * sizes.length || 1))),
        });
      }
    }

    const payload = {
      name,
      sku,
      categoryId,
      price: parseFloat(price),
      comparePrice:
        comparePrice && !isNaN(parseFloat(comparePrice))
          ? parseFloat(comparePrice)
          : null,
      stock: parseInt(stock, 10) || 10,
      description,
      details,
      isPublished,
      isFeatured,
      isNewArrival,
      images,
      variants,
    };

    try {
      const url = isEdit ? `/api/products/${initialData.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      toast(isEdit ? "Product updated" : "Product created successfully", "success");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast(err?.message || "Error saving product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Basic Details */}
      <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212] pb-3 border-b border-[#E8E5E0]">
          1. General Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="sm:col-span-2">
            <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
              Piece Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Riviera Oxford Overshirt"
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
              SKU Reference *
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              placeholder="e.g. LEG-SH-009"
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs font-mono text-[#121212] focus:outline-none focus:border-[#121212]"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
              Inventory Stock Level *
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min={0}
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
              Selling / Retail Price (LKR) *
            </label>
            <input
              type="number"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="e.g. 4785"
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
            />
            <p className="mt-1 text-[11px] text-[#8E8B85]">
              Active sale price charged at checkout (e.g. LKR 4,785)
            </p>
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
              Original / Compare-At Price (LKR)
            </label>
            <input
              type="number"
              step="1"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              placeholder="e.g. 15950 (Strikethrough price)"
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
            />
            <p className="mt-1 text-[11px] text-[#8E8B85]">
              Optional. Displays struck-through beneath the sale price (e.g. ~~LKR 15,950~~)
            </p>
          </div>

          {/* Live Storefront Price Display Preview */}
          <div className="sm:col-span-2 bg-[#FAF8F5] border border-[#E8E5E0] p-4 rounded-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#8E8B85] font-semibold block">
                Storefront Price Display Preview
              </span>
              <span className="text-[11px] text-[#66635F]">
                How customers will see this item&apos;s price on product cards &amp; details:
              </span>
            </div>
            <div className="flex flex-col items-end leading-tight">
              <span className="text-base sm:text-lg font-bold text-[#121212]">
                LKR {price && !isNaN(Number(price)) ? Math.round(Number(price)).toLocaleString() : "0"}
              </span>
              {comparePrice &&
                !isNaN(Number(comparePrice)) &&
                Number(comparePrice) > (Number(price) || 0) && (
                  <span className="text-xs sm:text-sm text-[#8E8B85] line-through font-normal mt-0.5">
                    LKR {Math.round(Number(comparePrice)).toLocaleString()}
                  </span>
                )}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1.5">
              Fabric & Care Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              placeholder="100% Egyptian Cotton, Mother of Pearl buttons, Hand wash cold..."
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
            />
          </div>
        </div>
      </div>

      {/* Multiple Image Management */}
      <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212]">
            2. Multiple Photography Gallery
          </h3>
          <p className="text-xs text-[#66635F] mt-1">
            Upload files or provide image URLs. Reorder, designate primary image, and manage gallery.
          </p>
        </div>

        {/* Upload Drop area & URL Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border-2 border-dashed border-[#D8D4CD] bg-[#FAF8F5] p-6 text-center relative hover:border-[#121212] transition-colors flex flex-col items-center justify-center">
            <input
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.avif"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {uploadingImage ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#9B783E]" />
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-[#8E8B85] mb-2 stroke-1" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#121212]">
                  Upload Image File
                </span>
                <span className="text-[10px] text-[#8E8B85] mt-0.5">JPG, PNG, WEBP</span>
              </>
            )}
          </div>

          <div className="border border-[#E8E5E0] p-6 bg-[#FAF8F5] flex flex-col justify-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#121212]">
              Or Add External Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-[#E8E5E0] p-2 text-xs text-[#121212]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 bg-[#121212] text-white text-xs uppercase font-semibold tracking-wider hover:bg-[#9B783E]"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Images List / Drag & Reorder */}
        {images.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase tracking-wider text-[#8E8B85] block">
              Active Photos ({images.length}) — Click Star to set Primary
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative group bg-[#F4F1EA] border p-2 flex flex-col justify-between ${
                    img.isPrimary ? "border-[#9B783E] ring-1 ring-[#9B783E]" : "border-[#E8E5E0]"
                  }`}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-white mb-2">
                    <Image
                      src={img.url}
                      alt={img.altText || `View ${idx + 1}`}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </div>

                  {img.isPrimary && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#9B783E] bg-[#FAF4EB] py-0.5 text-center mb-1">
                      Primary Cover
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E8E5E0] text-[#66635F]">
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className={`p-1 hover:text-[#9B783E] ${img.isPrimary ? "text-[#9B783E]" : ""}`}
                      title="Set Primary"
                    >
                      <Star className={`w-3.5 h-3.5 ${img.isPrimary ? "fill-[#9B783E]" : ""}`} />
                    </button>

                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 hover:text-[#121212] disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, idx + 1)}
                        disabled={idx === images.length - 1}
                        className="p-1 hover:text-[#121212] disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 hover:text-[#9B2C2C]"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Variants (Sizes & Colors) */}
      <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212] pb-3 border-b border-[#E8E5E0]">
          3. Sizing & Colors
        </h3>

        {/* Sizes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#121212]">
              Available Sizes
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8E8B85] uppercase tracking-wider">
                Presets:
              </span>
              <button
                type="button"
                onClick={() => setSizes(STANDARD_SIZES)}
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-[#E8E5E0] bg-[#FAF8F5] hover:bg-[#121212] hover:text-white transition-colors"
              >
                S to XXL
              </button>
              <button
                type="button"
                onClick={() => setSizes(DENIM_SIZES)}
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-[#E8E5E0] bg-[#FAF8F5] hover:bg-[#121212] hover:text-white transition-colors"
              >
                Denim (28–40)
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {sizes.map((s) => (
              <span
                key={s}
                className="px-3 py-1 bg-[#FAF8F5] border border-[#E8E5E0] text-xs font-medium text-[#121212] flex items-center gap-1.5"
              >
                {s}
                <button
                  type="button"
                  onClick={() => handleRemoveSize(s)}
                  className="text-[#8E8B85] hover:text-[#9B2C2C]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-xs">
            <input
              type="text"
              value={newSizeInput}
              onChange={(e) => setNewSizeInput(e.target.value)}
              placeholder="e.g. XXL or 36"
              className="bg-[#FAF8F5] border border-[#E8E5E0] p-2 text-xs text-[#121212] flex-1"
            />
            <button
              type="button"
              onClick={handleAddSize}
              className="px-3 py-2 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold"
            >
              Add Size
            </button>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2 pt-4 border-t border-[#E8E5E0]">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#121212]">
            Available Colors
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {colors.map((c) => (
              <span
                key={c}
                className="px-3 py-1 bg-[#FAF8F5] border border-[#E8E5E0] text-xs font-medium text-[#121212] flex items-center gap-1.5"
              >
                {c}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(c)}
                  className="text-[#8E8B85] hover:text-[#9B2C2C]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-xs">
            <input
              type="text"
              value={newColorInput}
              onChange={(e) => setNewColorInput(e.target.value)}
              placeholder="e.g. Italian Navy"
              className="bg-[#FAF8F5] border border-[#E8E5E0] p-2 text-xs text-[#121212] flex-1"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="px-3 py-2 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold"
            >
              Add Color
            </button>
          </div>
        </div>
      </div>

      {/* Visibility Toggles */}
      <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 flex flex-wrap gap-8 text-xs text-[#121212]">
        <label className="flex items-center gap-2 cursor-pointer font-semibold uppercase tracking-wider">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-[#9B783E]"
          />
          <span>Published on Storefront</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-semibold uppercase tracking-wider">
          <input
            type="checkbox"
            checked={isNewArrival}
            onChange={(e) => setIsNewArrival(e.target.checked)}
            className="accent-[#9B783E]"
          />
          <span>Show in New Arrivals</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-semibold uppercase tracking-wider">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="accent-[#9B783E]"
          />
          <span>Featured Staple</span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-3.5 border border-[#E8E5E0] text-xs uppercase tracking-wider text-[#121212]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-[#121212] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#9B783E] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Update Piece" : "Create Piece"}
        </button>
      </div>
    </form>
  );
}
