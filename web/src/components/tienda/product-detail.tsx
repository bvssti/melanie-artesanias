"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Minus, ShieldCheck, Truck, Package, Download } from "lucide-react";
import type { Product } from "@/data/products";
import { getCategory } from "@/data/categories";
import { getCategoryIcon } from "./category-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { formatCLP, cn } from "@/lib/utils";

const colorMap = {
  rose: "bg-pastel-rose text-pastel-rose-deep",
  sage: "bg-pastel-sage text-pastel-sage-deep",
  lavender: "bg-pastel-lavender text-pastel-lavender-deep",
} as const;

export function ProductDetail({ product }: { product: Product }) {
  const category = getCategory(product.category);
  const Icon = category ? getCategoryIcon(category.icon) : null;
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const addToCart = useCart((s) => s.add);

  const outOfStock = product.stock === 0;
  const lowStock = !outOfStock && product.stock <= 2 && product.type === "physical";
  const maxQty = product.type === "digital" ? 10 : product.stock;

  const promises = product.type === "digital"
    ? [
        { Icon: Download, label: "Descarga inmediata", desc: "PDF disponible al momento del pago" },
        { Icon: ShieldCheck, label: "Compra segura", desc: "Procesado por Mercado Pago" },
        { Icon: Package, label: "Sin envío", desc: "Producto 100% digital" },
      ]
    : [
        { Icon: Truck, label: "Envío a todo Chile", desc: "Despacho por Starken o Chilexpress" },
        { Icon: ShieldCheck, label: "Compra segura", desc: "Procesado por Mercado Pago" },
        { Icon: Package, label: "Empaquetado con cariño", desc: "Listo para regalo si lo pides" },
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14">
      {/* Visual */}
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "relative aspect-square rounded-3xl grid place-items-center shadow-[var(--shadow-md)] overflow-hidden",
            colorMap[product.color]
          )}
        >
          {product.badge && (
            <Badge className="absolute top-5 left-5 z-10">{product.badge}</Badge>
          )}
          {Icon && (
            <Icon className="w-40 h-40 opacity-80" strokeWidth={1.1} />
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-xl border-2 cursor-pointer grid place-items-center",
                i === 0
                  ? "border-foreground"
                  : "border-border opacity-60 hover:opacity-100",
                colorMap[product.color]
              )}
            >
              {Icon && <Icon className="w-8 h-8 opacity-70" strokeWidth={1.2} />}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <Link
          href={`/catalogo/${product.category}`}
          className="text-sm text-accent hover:underline uppercase tracking-wider font-semibold"
        >
          {product.categoryLabel}
        </Link>
        <h1 className="font-display text-5xl md:text-6xl text-foreground leading-none mt-2">
          {product.name}
        </h1>

        <div className="flex items-baseline gap-3 mt-6">
          <div className="font-bold text-4xl text-foreground">
            {formatCLP(product.price)}
          </div>
          {product.type === "digital" && (
            <span className="text-sm text-foreground-soft">PDF descargable</span>
          )}
        </div>

        {/* Stock */}
        <div className="mt-3">
          {outOfStock ? (
            <span className="inline-flex items-center gap-1.5 text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Agotado por ahora
            </span>
          ) : product.type === "digital" ? (
            <span className="inline-flex items-center gap-1.5 text-pastel-sage-deep font-medium">
              <span className="w-2 h-2 rounded-full bg-pastel-sage-deep" />
              Disponible — descarga inmediata
            </span>
          ) : lowStock ? (
            <span className="inline-flex items-center gap-1.5 text-accent font-medium">
              <span className="w-2 h-2 rounded-full bg-accent" />
              ¡Últimas {product.stock} unidades!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-pastel-sage-deep font-medium">
              <span className="w-2 h-2 rounded-full bg-pastel-sage-deep" />
              {product.stock} unidades disponibles
            </span>
          )}
        </div>

        <p className="text-foreground-soft mt-5 leading-relaxed">
          {product.description}
        </p>

        {/* Quantity + add */}
        <div className="flex flex-wrap items-center gap-3 mt-8">
          {!outOfStock && (
            <div className="inline-flex items-center gap-1 bg-bg-card border border-border rounded-full p-1 h-12">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Reducir cantidad"
                disabled={qty <= 1}
                className="w-10 h-10 rounded-full grid place-items-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-semibold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                aria-label="Aumentar cantidad"
                disabled={qty >= maxQty}
                className="w-10 h-10 rounded-full grid place-items-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          <Button
            size="lg"
            disabled={outOfStock}
            onClick={() => addToCart(product, qty)}
            className="flex-1 min-w-[200px]"
          >
            {outOfStock ? "Agotado" : "Agregar al carrito"}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setFav((v) => !v)}
            aria-label={fav ? "Quitar de favoritos" : "Guardar como favorito"}
            aria-pressed={fav}
            className={fav ? "text-accent" : ""}
          >
            <Heart
              className="w-5 h-5"
              fill={fav ? "currentColor" : "none"}
            />
          </Button>
        </div>

        {/* Promises */}
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
          {promises.map(({ Icon: I, label, desc }) => (
            <li
              key={label}
              className="p-4 rounded-2xl border border-border bg-bg-card"
            >
              <div className="w-9 h-9 bg-accent-soft text-accent rounded-xl grid place-items-center mb-2">
                <I className="w-4 h-4" />
              </div>
              <div className="font-semibold text-sm">{label}</div>
              <div className="text-xs text-foreground-soft mt-0.5">{desc}</div>
            </li>
          ))}
        </ul>

        {/* Details */}
        {product.details && product.details.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <h2 className="font-display text-3xl text-foreground mb-4">
              Detalles
            </h2>
            <ul className="space-y-2">
              {product.details.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-foreground-soft"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
