"use client";

import React from "react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
}

export function SizeGuideModal({ isOpen, onClose, categoryName = "Garments" }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const isPantsOrDenim =
    categoryName.toLowerCase().includes("pant") || categoryName.toLowerCase().includes("denim");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white border border-[#E8E5E0] p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E5E0]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
              Tailoring Standards
            </span>
            <h3 className="text-base sm:text-lg font-light tracking-wider uppercase text-[#121212]">
              Size & Fit Measurement Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#121212] hover:opacity-60 transition-opacity"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5 stroke-1" />
          </button>
        </div>

        <div className="py-6 space-y-6 text-xs text-[#66635F]">
          <p>
            All LEGEND garments are engineered with standard international architectural
            fit. Measurements below indicate garment dimensions in inches.
          </p>

          {!isPantsOrDenim ? (
            /* Tops: Shirts & T-Shirts Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-[#E8E5E0]">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E8E5E0] text-[11px] uppercase tracking-wider text-[#121212]">
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Chest</th>
                    <th className="p-2.5">Shoulder</th>
                    <th className="p-2.5">Sleeve</th>
                    <th className="p-2.5">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5E0]">
                  <tr>
                    <td className="p-2.5 font-semibold text-[#121212]">S</td>
                    <td className="p-2.5">38 - 40&quot;</td>
                    <td className="p-2.5">17.5&quot;</td>
                    <td className="p-2.5">25.0&quot;</td>
                    <td className="p-2.5">28.5&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#121212]">M</td>
                    <td className="p-2.5">40 - 42&quot;</td>
                    <td className="p-2.5">18.2&quot;</td>
                    <td className="p-2.5">25.5&quot;</td>
                    <td className="p-2.5">29.0&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#121212]">L</td>
                    <td className="p-2.5">42 - 44&quot;</td>
                    <td className="p-2.5">19.0&quot;</td>
                    <td className="p-2.5">26.0&quot;</td>
                    <td className="p-2.5">30.0&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#121212]">XL</td>
                    <td className="p-2.5">44 - 46&quot;</td>
                    <td className="p-2.5">19.8&quot;</td>
                    <td className="p-2.5">26.5&quot;</td>
                    <td className="p-2.5">30.5&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* Bottoms: Pants & Denim Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-[#E8E5E0]">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E8E5E0] text-[11px] uppercase tracking-wider text-[#121212]">
                    <th className="p-2.5">Waist</th>
                    <th className="p-2.5">Hip</th>
                    <th className="p-2.5">Thigh</th>
                    <th className="p-2.5">Inseam</th>
                    <th className="p-2.5">Leg Opening</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5E0]">
                  <tr>
                    <td className="p-2.5 font-semibold text-[#121212]">30</td>
                    <td className="p-2.5">38.0&quot;</td>
                    <td className="p-2.5">23.0&quot;</td>
                    <td className="p-2.5">32.0&quot;</td>
                    <td className="p-2.5">7.2&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#121212]">32</td>
                    <td className="p-2.5">40.0&quot;</td>
                    <td className="p-2.5">24.0&quot;</td>
                    <td className="p-2.5">32.0&quot;</td>
                    <td className="p-2.5">7.5&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#121212]">34</td>
                    <td className="p-2.5">42.0&quot;</td>
                    <td className="p-2.5">25.0&quot;</td>
                    <td className="p-2.5">33.0&quot;</td>
                    <td className="p-2.5">7.8&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#121212]">36</td>
                    <td className="p-2.5">44.0&quot;</td>
                    <td className="p-2.5">26.0&quot;</td>
                    <td className="p-2.5">33.0&quot;</td>
                    <td className="p-2.5">8.1&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-[#FAF8F5] p-3 border border-[#E8E5E0] text-[11px] leading-relaxed">
            <strong className="text-[#121212]">Unsure about your fit?</strong> We offer
            complimentary exchanges within 30 days of delivery.
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#121212] text-white text-xs uppercase tracking-widest hover:bg-[#9B783E] transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
