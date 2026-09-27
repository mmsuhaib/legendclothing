import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

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
            Piece Revision
          </span>
          <h1 className="text-2xl font-light tracking-wide uppercase text-[#121212]">
            Edit {product.name}
          </h1>
        </div>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
