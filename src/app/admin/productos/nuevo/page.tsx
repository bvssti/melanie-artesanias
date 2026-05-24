import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";

export const metadata = {
  title: "Nuevo producto — Admin",
  robots: { index: false, follow: false },
};

async function getCategories() {
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("categories")
      .select("id, name, color")
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function NuevoProducto() {
  const categories = await getCategories();
  return (
    <>
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-soft hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Productos
      </Link>
      <h1 className="font-display text-5xl text-foreground leading-none mb-2">
        Nuevo producto
      </h1>
      <p className="text-foreground-soft mb-8">
        Completa los datos. Podrás editarlo cuando quieras.
      </p>
      <ProductForm categories={categories} />
    </>
  );
}
