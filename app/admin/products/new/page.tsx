import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 border border-[#E8E5E0] bg-white text-[#121212] hover:bg-[#FAF8F5]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
            Collection Architecture
          </span>
          <h1 className="text-2xl font-light tracking-wide uppercase text-[#121212]">
            Create New Piece
          </h1>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
