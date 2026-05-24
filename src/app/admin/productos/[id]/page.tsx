import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";

export const metadata = {
  title: "Editar producto — Admin",
  robots: { index: false, follow: false },
};

export default async function EditarProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = createServiceClient();
  const [productRes, categoriesRes] = await Promise.all([
    service.from("products").select("*").eq("id", id).maybeSingle(),
    service
      .from("categories")
      .select("id, name, color")
      .order("sort_order", { ascending: true }),
  ]);

  if (!productRes.data) notFound();

  return (
    <>
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-soft hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Productos
      </Link>
      <h1 className="font-display text-5xl text-foreground leading-none mb-2">
        Editar producto
      </h1>
      <p className="text-foreground-soft mb-8">{productRes.data.name}</p>
      <ProductForm
        product={productRes.data}
        categories={categoriesRes.data ?? []}
      />
    </>
  );
}
