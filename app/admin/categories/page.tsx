"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Loader2,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  order: number;
  isActive: boolean;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [order, setOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Image Upload state
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation popup state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setOrder((categories.length + 1).toString());
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setOrder(cat.order.toString());
    setIsActive(cat.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      image,
      order: parseInt(order, 10) || 0,
      isActive,
    };

    try {
      const url = "/api/categories";
      const method = editingCategory ? "PUT" : "POST";
      const body = editingCategory
        ? JSON.stringify({ ...payload, id: editingCategory.id })
        : JSON.stringify(payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Failed to save category");

      toast(
        editingCategory ? "Category updated" : "Category created successfully",
        "success"
      );
      setModalOpen(false);
      fetchCategories();
    } catch (e: any) {
      toast(e?.message || "Error saving category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg|avif|gif)$/i.test(file.name);
    if (!isImage) {
      toast("Please select a valid image file (PNG, JPG, WEBP, SVG)", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "categories"); // Saves to public/uploads/categories

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload image");
      }

      const data = await res.json();
      setImage(data.url);
      toast("Image uploaded to public folder successfully", "success");
    } catch (e: any) {
      toast(e?.message || "Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/categories?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`Category "${deleteTarget.name}" deleted successfully`, "success");
        setDeleteTarget(null);
        fetchCategories();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete category");
      }
    } catch (e: any) {
      toast(e?.message || "Error deleting category", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, isActive: !cat.isActive }),
      });
      if (res.ok) {
        toast(`Category is now ${!cat.isActive ? "Active" : "Hidden"}`, "success");
        fetchCategories();
      }
    } catch (e) {
      toast("Failed to update status", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5E0]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
            Taxonomy & Navigation
          </span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-[#121212] mt-0.5">
            Categories Architecture
          </h1>
          <p className="text-xs text-[#66635F] mt-1">
            Dynamic SQL-driven categories automatically reflected in Storefront navigation.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9B783E] transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-[#E8E5E0]">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#9B783E]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E5E0] text-[10px] uppercase tracking-wider text-[#8E8B85]">
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Order</th>
                  <th className="p-4 font-semibold">Category Name</th>
                  <th className="p-4 font-semibold">Slug</th>
                  <th className="p-4 font-semibold">Pieces Count</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FAF8F5]/80">
                    <td className="p-4">
                      <div className="relative w-12 h-14 bg-[#F4F1EA] border border-[#E8E5E0] overflow-hidden">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Layers className="w-5 h-5 text-[#8E8B85] m-auto" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-[#121212]">
                      #{cat.order}
                    </td>
                    <td className="p-4 font-semibold text-[#121212]">{cat.name}</td>
                    <td className="p-4 font-mono text-[#8E8B85]">/{cat.slug}</td>
                    <td className="p-4 text-[#66635F]">
                      {cat._count?.products ?? 0} pieces
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          cat.isActive
                            ? "bg-[#F0FDF4] text-[#2A6B46] border border-[#DCFCE7]"
                            : "bg-[#FAF8F5] text-[#8E8B85] border border-[#E8E5E0]"
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <Check className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-[#66635F] hover:text-[#9B783E]"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 text-[#8E8B85] hover:text-[#9B2C2C] transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-[#E8E5E0] p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5E0]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#121212]">
                {editingCategory ? `Edit ${editingCategory.name}` : "Add New Category"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#8E8B85] hover:text-[#121212]"
              >
                <X className="w-5 h-5 stroke-1" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  required
                  placeholder="e.g. Leather Goods"
                  className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="e.g. leather-goods"
                  className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs font-mono text-[#121212] focus:outline-none focus:border-[#121212]"
                />
              </div>

              {/* Category Image Upload to public folder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block uppercase tracking-wider font-semibold text-[#121212] text-xs">
                    Category Image (Public Upload)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-[#9B783E] hover:underline uppercase tracking-wider font-medium cursor-pointer"
                  >
                    {showUrlInput ? "Hide Direct URL" : "Or Enter URL"}
                  </button>
                </div>

                {/* Hidden File Input for public folder upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.avif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="hidden"
                />

                {/* Image Preview if image is set */}
                {image ? (
                  <div className="relative border border-[#E8E5E0] bg-[#FAF8F5] p-3 flex items-center gap-3">
                    <div className="relative w-20 h-24 bg-[#F4F1EA] border border-[#E8E5E0] overflow-hidden shrink-0">
                      <Image
                        src={image}
                        alt="Category Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Image attached</span>
                      </div>
                      <p className="font-mono text-[11px] text-[#66635F] truncate bg-white p-1.5 border border-[#E8E5E0]">
                        {image}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="px-3 py-1.5 bg-[#121212] text-white text-[10px] uppercase tracking-wider font-medium hover:bg-[#9B783E] transition-colors inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          {uploading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          Upload New Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage("")}
                          className="px-2.5 py-1.5 border border-[#E8E5E0] text-[#66635F] text-[10px] uppercase tracking-wider hover:text-red-600 hover:border-red-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone to public/uploads/categories */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                      isDragOver
                        ? "border-[#9B783E] bg-[#FAF4EB]"
                        : "border-[#E8E5E0] hover:border-[#121212] bg-[#FAF8F5]"
                    }`}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#9B783E]" />
                        <span className="text-xs uppercase tracking-wider font-medium text-[#66635F]">
                          Uploading to public/uploads/categories...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <div className="w-9 h-9 rounded-full bg-white border border-[#E8E5E0] flex items-center justify-center text-[#8E8B85]">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-[#121212] uppercase tracking-wider block">
                            Upload Category Image
                          </span>
                          <span className="text-[#8E8B85] block text-[11px] mt-0.5">
                            Drag & drop or click to browse (JPG, PNG, WEBP max 10MB)
                          </span>
                          <span className="text-[10px] text-[#9B783E] block mt-1 font-mono">
                            Saved to public/uploads/categories/
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Direct URL Input */}
                {showUrlInput && (
                  <div className="pt-1.5">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Or paste external image URL (e.g. https://images.unsplash.com/...)"
                      className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-2.5 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Short description for category header..."
                  className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold uppercase tracking-wider text-xs">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[#9B783E]"
                  />
                  <span>Active & Visible in Navbar</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8E5E0] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E5E0] text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9B783E] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E8E5E0] p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#121212]">
                  Confirm Category Deletion
                </h3>
                <p className="text-xs text-[#66635F] mt-1.5 leading-relaxed">
                  Are you sure you want to permanently delete category{" "}
                  <span className="font-semibold text-[#121212]">
                    &ldquo;{deleteTarget.name}&rdquo;
                  </span>
                  ?
                </p>
                {deleteTarget._count && deleteTarget._count.products > 0 && (
                  <div className="mt-2.5 p-2.5 bg-[#FAF8F5] border border-[#E8E5E0] text-[11px] text-[#8E8B85]">
                    ⚠️ This category currently has{" "}
                    <span className="font-semibold text-[#121212]">
                      {deleteTarget._count.products} pieces
                    </span>
                    . Products will remain in inventory but will no longer be linked to this category.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E5E0] flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-[#E8E5E0] text-xs uppercase tracking-wider hover:bg-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Category
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
