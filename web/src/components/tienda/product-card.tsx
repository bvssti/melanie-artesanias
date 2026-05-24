"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { getCategoryIcon } from "./category-icons";
import { getCategory } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store/cart";
import { formatCLP, cn } from "@/lib/utils";

const colorMap = {
  rose: "bg-pastel-rose text-pastel-rose-deep",
  sage: "bg-pastel-sage text-pastel-sage-deep",
  lavender: "bg-pastel-lavender text-pastel-lavender-deep",
} as const;

export function ProductCard({ product }: { product: Product }) {
  const [fav, setFav] = useState(false);
  const addToCart = useCart((s) => s.add);
  const category = getCategory(product.category);
  const Icon = category ? getCategoryIcon(category.icon) : null;
  const outOfStock = product.stock === 0;
  const lowStock = !outOfStock && product.stock <= 2;

  const stockLabel = outOfStock
    ? "Agotado"
    : product.type === "digital"
    ? "Descarga inmediata"
    : lowStock
    ? `Quedan ${product.stock}`
    : `${product.stock} disponibles`;

  const stockColor = outOfStock
    ? "text-secondary"
    : lowStock
    ? "text-accent"
    : "text-pastel-sage-deep";

  return (
    <article className="group relative bg-bg-card rounded-2xl border border-border shadow-[var(--shadow-sm)] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <Link
        href={`/producto/${product.slug}`}
        className="relative aspect-square grid place-items-center"
        aria-label={`Ver ${product.name}`}
      >
        <div className={cn("absolute inset-0", colorMap[product.color])} />
        {Icon && (
          <Icon className="relative w-20 h-20 opacity-80" strokeWidth={1.2} />
        )}
        {product.badge && (
          <Badge className="absolute top-3 left-3 z-10">{product.badge}</Badge>
        )}
      </Link>

      <button
        type="button"
        onClick={() => setFav((v) => !v)}
        aria-label={fav ? "Quitar de favoritos" : "Guardar como favorito"}
        aria-pressed={fav}
        className={cn(
          "absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-bg-card grid place-items-center shadow-[var(--shadow-sm)] transition-colors",
          fav ? "text-accent" : "text-foreground-soft hover:text-accent"
        )}
      >
        <Heart
          className="w-[18px] h-[18px]"
          fill={fav ? "currentColor" : "none"}
        />
      </button>

      <div className="p-4 pt-5 flex-1 flex flex-col">
        <div className="text-[12px] text-secondary uppercase tracking-[1px] mb-1.5">
          {product.categoryLabel}
        </div>
        <h3 className="font-semibold text-foreground mb-3 leading-snug">
          <Link
            href={`/producto/${product.slug}`}
            className="hover:text-accent transition-colors"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-foreground">
              {formatCLP(product.price)}
            </div>
            <div className={cn("text-xs font-medium mt-0.5", stockColor)}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                style={{ background: "currentColor" }}
              />
              {stockLabel}
            </div>
          </div>
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addToCart(product, 1)}
            aria-label={
              outOfStock
                ? "Producto agotado"
                : `Agregar ${product.name} al carrito`
            }
            className={cn(
              "w-10 h-10 rounded-full grid place-items-center transition-all",
              outOfStock
                ? "bg-border text-secondary cursor-not-allowed"
                : "bg-foreground text-bg hover:bg-accent hover:scale-105"
            )}
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
