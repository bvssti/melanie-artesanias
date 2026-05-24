import Link from "next/link";
import { Plus, Edit2 } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { formatCLP } from "@/lib/utils";
import { DeleteProductButton } from "./delete-button";

export const metadata = {
  title: "Productos — Admin",
  robots: { index: false, follow: false },
};

async function getProducts() {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("products")
      .select(
        "id, slug, name, price, stock, type, published, featured, badge, category_label, color"
      )
      .order("created_at", { ascending: false });
    if (error) return { products: [], error: error.message };
    return { products: data ?? [], error: null as string | null };
  } catch (e) {
    return {
      products: [],
      error: e instanceof Error ? e.message : "Error desconocido",
    };
  }
}

const colorDot = {
  rose: "bg-pastel-rose",
  sage: "bg-pastel-sage",
  lavender: "bg-pastel-lavender",
} as const;

export default async function AdminProductos() {
  const { products, error } = await getProducts();

  return (
    <>
      <header className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-5xl text-foreground leading-none">
            Productos
          </h1>
          <p className="text-foreground-soft mt-2">
            Gestiona tu catálogo, stock y precios.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo producto
          </Link>
        </Button>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-pastel-rose/40 border border-pastel-rose-deep/30 text-sm">
          Error al cargar productos: <strong>{error}</strong>
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-foreground-soft">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Producto</th>
                <th className="text-left font-semibold px-4 py-3">Categoría</th>
                <th className="text-right font-semibold px-4 py-3">Precio</th>
                <th className="text-right font-semibold px-4 py-3">Stock</th>
                <th className="text-center font-semibold px-4 py-3">Estado</th>
                <th className="text-right font-semibold px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-foreground-soft"
                  >
                    {error
                      ? "Conecta Supabase para ver tus productos."
                      : "Aún no agregas productos."}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg ${colorDot[p.color as keyof typeof colorDot]}`}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-xs text-secondary">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground-soft">
                      {p.category_label}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatCLP(p.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.type === "digital" ? (
                        <span className="text-secondary text-xs">PDF</span>
                      ) : p.stock === 0 ? (
                        <span className="text-destructive font-semibold">0</span>
                      ) : p.stock <= 2 ? (
                        <span className="text-accent font-semibold">
                          {p.stock}
                        </span>
                      ) : (
                        <span className="tabular-nums">{p.stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          p.published
                            ? "inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-pastel-sage text-pastel-sage-deep"
                            : "inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-foreground-soft"
                        }
                      >
                        {p.published ? "Publicado" : "Borrador"}
                      </span>
                      {p.featured && (
                        <span className="ml-1 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                          ★
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/productos/${p.id}`}
                          className="w-8 h-8 grid place-items-center rounded-full text-foreground-soft hover:bg-muted hover:text-foreground transition-colors"
                          aria-label={`Editar ${p.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
