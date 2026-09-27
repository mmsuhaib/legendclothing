"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Search,
  CheckSquare,
  Square,
  MinusSquare,
  Layers,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  isPublished: boolean;
  category: { name: string; slug: string };
  images: { url: string; isPrimary: boolean }[];
}

interface DeleteModalState {
  type: "single" | "bulk";
  products: Product[];
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete Confirmation Modal state
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch products and categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?admin=true"),
        fetch("/api/categories"),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.filter((c: any) => c.isActive));
      }
    } catch (e) {
      console.error(e);
      toast("Failed to load catalog data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered products according to search and category selection
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        categoryFilter === "all" || p.category?.slug === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, categoryFilter]);

  // Master checkbox status
  const visibleIds = useMemo(() => filteredProducts.map((p) => p.id), [filteredProducts]);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = visibleIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all visible
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Open delete modal for single product
  const handleRequestSingleDelete = (product: Product) => {
    setDeleteModal({
      type: "single",
      products: [product],
    });
  };

  // Open delete modal for bulk selection
  const handleRequestBulkDelete = () => {
    const selectedProds = products.filter((p) => selectedIds.includes(p.id));
    if (selectedProds.length === 0) return;

    setDeleteModal({
      type: "bulk",
      products: selectedProds,
    });
  };

  // Confirm delete handler (for both single and bulk)
  const handleConfirmDelete = async () => {
    if (!deleteModal || deleteModal.products.length === 0) return;

    const idsToDelete = deleteModal.products.map((p) => p.id);
    setDeleting(true);

    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      if (res.ok) {
        const result = await res.json();
        const count = result.count || idsToDelete.length;

        if (deleteModal.type === "single") {
          toast(`Product "${deleteModal.products[0].name}" deleted permanently`, "success");
        } else {
          toast(`Successfully deleted ${count} products`, "success");
        }

        // Clean up state & reload
        setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
        setDeleteModal(null);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete products");
      }
    } catch (e: any) {
      toast(e?.message || "Failed to delete products", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5E0]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
            Collection Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-[#121212] mt-0.5">
            Product Management
          </h1>
          <p className="text-xs text-[#66635F] mt-1">
            Manage inventory, individual pieces, and perform batch operations across your catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9B783E] transition-all inline-flex items-center gap-2 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Piece
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 border border-[#E8E5E0]">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#8E8B85] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, or category..."
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] pl-8 pr-3 py-2 text-xs text-[#121212] focus:outline-none focus:border-[#121212] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8B85] hover:text-[#121212] text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative shrink-0 sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-3 py-2 text-xs uppercase tracking-wider text-[#121212] focus:outline-none focus:border-[#121212] cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => {
                const count = products.filter((p) => p.category?.slug === c.slug).length;
                return (
                  <option key={c.id} value={c.slug}>
                    {c.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="text-xs text-[#66635F] text-right shrink-0">
          Showing <strong className="text-[#121212]">{filteredProducts.length}</strong> of{" "}
          <strong className="text-[#121212]">{products.length}</strong> pieces
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-[#121212] text-white p-3.5 sm:px-6 shadow-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="bg-[#9B783E] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              {selectedIds.length} {selectedIds.length === 1 ? "Piece" : "Pieces"} Selected
            </span>
            <span className="text-xs text-[#FAF8F5]/80 hidden md:inline">
              Selected products ready for batch operation
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 text-xs uppercase tracking-wider text-[#FAF8F5]/80 hover:text-white border border-white/20 hover:border-white/50 transition-colors cursor-pointer"
            >
              Deselect All
            </button>
            <button
              onClick={handleRequestBulkDelete}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold transition-all inline-flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-[#E8E5E0] shadow-xs">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#9B783E]" />
            <p className="text-xs text-[#8E8B85] mt-2 uppercase tracking-wider">
              Loading collection pieces...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <p className="text-xs text-[#8E8B85]">
              {products.length === 0
                ? "No products found in the database. Click \"Add New Piece\" to create one."
                : "No products matched your search or category filter criteria."}
            </p>
            {(searchQuery || categoryFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                className="text-xs text-[#9B783E] hover:underline uppercase tracking-wider font-medium cursor-pointer inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E5E0] text-[10px] uppercase tracking-wider text-[#8E8B85]">
                  {/* Select All Checkbox */}
                  <th className="p-4 w-10">
                    <button
                      onClick={handleToggleSelectAll}
                      className="p-1 text-[#121212] hover:text-[#9B783E] transition-colors cursor-pointer flex items-center justify-center"
                      title={isAllSelected ? "Deselect All" : "Select All Visible"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#9B783E]" />
                      ) : isSomeSelected ? (
                        <MinusSquare className="w-4 h-4 text-[#9B783E]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#8E8B85]" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Name & SKU</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Published</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0]">
                {filteredProducts.map((prod) => {
                  const isSelected = selectedIds.includes(prod.id);
                  const primaryImg =
                    prod.images?.find((i) => i.isPrimary)?.url ||
                    prod.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200&auto=format&fit=crop";

                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors duration-150 ${
                        isSelected
                          ? "bg-[#FAF4EB]/80 border-l-2 border-l-[#9B783E]"
                          : "hover:bg-[#FAF8F5]/80"
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleRow(prod.id)}
                          className="p-1 text-[#121212] hover:text-[#9B783E] transition-colors cursor-pointer flex items-center justify-center"
                          title={isSelected ? "Deselect piece" : "Select piece"}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#9B783E]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#8E8B85]" />
                          )}
                        </button>
                      </td>

                      {/* Product Thumbnail */}
                      <td className="p-4">
                        <div className="relative w-12 h-16 bg-[#F4F1EA] border border-[#E8E5E0] overflow-hidden rounded-xs">
                          <Image
                            src={primaryImg}
                            alt={prod.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Name & SKU */}
                      <td className="p-4">
                        <div className="font-semibold text-[#121212] flex items-center gap-1.5">
                          <span>{prod.name}</span>
                          {isSelected && (
                            <span className="text-[9px] bg-[#9B783E] text-white px-1.5 py-0.2 rounded-xs font-mono">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-[#8E8B85] mt-0.5">
                          {prod.sku}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-[#66635F]">
                        <span className="inline-flex items-center gap-1 bg-[#FAF8F5] px-2 py-0.5 border border-[#E8E5E0] rounded-xs text-[11px]">
                          {prod.category?.name || "Unassigned"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-[#121212]">
                            LKR {Math.round(prod.price).toLocaleString()}
                          </span>
                          {prod.comparePrice &&
                            Number(prod.comparePrice) > Number(prod.price) && (
                              <span className="text-[11px] text-[#8E8B85] line-through font-normal mt-0.5">
                                LKR {Math.round(Number(prod.comparePrice)).toLocaleString()}
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            prod.stock <= 5 ? "text-[#9B783E]" : "text-[#121212]"
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>

                      {/* Published status */}
                      <td className="p-4">
                        {prod.isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[#2A6B46] text-[11px] font-semibold">
                            <Check className="w-3.5 h-3.5" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#8E8B85] text-[11px]">
                            <X className="w-3.5 h-3.5" /> Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#8E8B85] hover:text-[#121212] inline-block hover:scale-110 transition-transform cursor-pointer"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${prod.id}/edit`}
                          className="p-1.5 text-[#66635F] hover:text-[#9B783E] inline-block hover:scale-110 transition-transform cursor-pointer"
                          title="Edit Piece"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleRequestSingleDelete(prod)}
                          className="p-1.5 text-[#8E8B85] hover:text-[#9B2C2C] inline-block hover:scale-110 transition-transform cursor-pointer"
                          title="Delete Piece"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup Modal (Single & Bulk) */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-[#E8E5E0] p-6 shadow-2xl space-y-4 rounded-xs">
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold uppercase tracking-wider text-[#121212]">
                  {deleteModal.type === "single"
                    ? "Confirm Product Deletion"
                    : `Confirm Bulk Deletion (${deleteModal.products.length} Pieces)`}
                </h3>
                <p className="text-xs text-[#66635F] mt-1.5 leading-relaxed">
                  {deleteModal.type === "single" ? (
                    <>
                      Are you sure you want to permanently delete{" "}
                      <strong className="text-[#121212]">
                        &ldquo;{deleteModal.products[0]?.name}&rdquo;
                      </strong>{" "}
                      (SKU: {deleteModal.products[0]?.sku})?
                    </>
                  ) : (
                    <>
                      Are you sure you want to permanently delete the following{" "}
                      <strong className="text-[#121212]">
                        {deleteModal.products.length} selected pieces
                      </strong>{" "}
                      from the catalog?
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* List Preview of Products to be deleted */}
            <div className="max-h-48 overflow-y-auto border border-[#E8E5E0] bg-[#FAF8F5] p-2 divide-y divide-[#E8E5E0] rounded-xs">
              {deleteModal.products.map((item) => {
                const img =
                  item.images?.find((i) => i.isPrimary)?.url ||
                  item.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200&auto=format&fit=crop";

                return (
                  <div
                    key={item.id}
                    className="py-2 px-2 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-8 h-10 bg-white border border-[#E8E5E0] shrink-0 overflow-hidden rounded-xs">
                        <Image
                          src={img}
                          alt={item.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#121212] truncate">{item.name}</p>
                        <p className="text-[10px] text-[#8E8B85] font-mono">{item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-[#121212] block">
                        LKR {Math.round(item.price).toLocaleString()}
                      </span>
                      {item.comparePrice &&
                        Number(item.comparePrice) > Number(item.price) && (
                          <span className="text-[10px] text-[#8E8B85] line-through block font-normal">
                            LKR {Math.round(Number(item.comparePrice)).toLocaleString()}
                          </span>
                        )}
                      <span className="text-[10px] text-[#8E8B85] block">
                        {item.category?.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Warning Note */}
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>
                <strong>Warning:</strong> This action is irreversible. All associated inventory records, images, and variants will be deleted permanently.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#E8E5E0] flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border border-[#E8E5E0] text-xs uppercase tracking-wider hover:bg-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {deleteModal.type === "single"
                        ? "Delete Product"
                        : `Delete ${deleteModal.products.length} Pieces`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
