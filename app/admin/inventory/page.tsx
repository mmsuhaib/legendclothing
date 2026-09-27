"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Boxes, Save, Loader2, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/context/toast-context";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: { name: string };
  images?: { url: string; isPrimary: boolean }[];
}

export default function AdminInventoryPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stockValues, setStockValues] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?admin=true");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        const initialStock: { [key: string]: number } = {};
        data.forEach((p: Product) => {
          initialStock[p.id] = p.stock;
        });
        setStockValues(initialStock);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (id: string, val: string) => {
    const parsed = parseInt(val, 10);
    setStockValues((prev) => ({
      ...prev,
      [id]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleSaveStock = async (product: Product) => {
    const newStock = stockValues[product.id];
    setSavingId(product.id);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          stock: newStock,
        }),
      });

      if (!res.ok) throw new Error("Failed to update stock");

      toast(`Stock for "${product.name}" updated to ${newStock}`, "success");
      fetchProducts();
    } catch (e: any) {
      toast(e?.message || "Error updating stock", "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E5E0]">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
          Warehouse Logistics
        </span>
        <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-[#121212] mt-0.5">
          Inventory Control
        </h1>
        <p className="text-xs text-[#66635F] mt-1">
          Monitor inventory levels and execute immediate stock adjustments.
        </p>
      </div>

      {/* Inventory Table */}
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
                  <th className="p-4 font-semibold">Piece</th>
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Current Stock</th>
                  <th className="p-4 font-semibold">Stock Status</th>
                  <th className="p-4 font-semibold text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0]">
                {products.map((p) => {
                  const currentVal = stockValues[p.id] ?? p.stock;
                  const isModified = currentVal !== p.stock;
                  const isLow = currentVal <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80">
                      <td className="p-4">
                        <div className="font-semibold text-[#121212]">{p.name}</div>
                      </td>
                      <td className="p-4 font-mono text-[#8E8B85]">{p.sku}</td>
                      <td className="p-4 text-[#66635F]">{p.category?.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={currentVal}
                            onChange={(e) => handleStockChange(p.id, e.target.value)}
                            className={`w-24 p-2 border text-xs font-semibold focus:outline-none ${
                              isLow
                                ? "border-[#9B783E] bg-[#FAF4EB] text-[#9B783E]"
                                : "border-[#E8E5E0] bg-[#FAF8F5] text-[#121212]"
                            }`}
                          />
                          <span className="text-[11px] text-[#8E8B85]">units</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[#9B783E] text-[11px] font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#2A6B46] text-[11px]">
                            <Check className="w-3.5 h-3.5" /> Optimal
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={savingId === p.id || !isModified}
                          className="px-4 py-2 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9B783E] transition-colors disabled:opacity-30 inline-flex items-center gap-1.5"
                        >
                          {savingId === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Save
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
    </div>
  );
}
