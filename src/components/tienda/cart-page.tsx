"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, useCartTotal } from "@/lib/store/cart";
import { formatCLP, cn } from "@/lib/utils";

const colorMap = {
  rose: "bg-pastel-rose text-pastel-rose-deep",
  sage: "bg-pastel-sage text-pastel-sage-deep",
  lavender: "bg-pastel-lavender text-pastel-lavender-deep",
} as const;

export function CartPageContent() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const total = useCartTotal();

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-accent-soft text-accent grid place-items-center mb-6">
          <ShoppingBag className="w-11 h-11" />
        </div>
        <h1 className="font-display text-5xl text-foreground leading-none">
          Tu carrito está vacío
        </h1>
        <p className="text-foreground-soft text-lg mt-3 max-w-[40ch] mx-auto">
          Explora el catálogo y agrega tus piezas favoritas para empezar.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/catalogo">
            Ver catálogo
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-5xl md:text-6xl text-foreground leading-none">
            Tu carrito
          </h1>
          <button
            type="button"
            onClick={clear}
            className="text-sm text-foreground-soft hover:text-destructive inline-flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Vaciar
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 bg-bg-card rounded-2xl border border-border"
            >
              <Link
                href={`/producto/${item.slug}`}
                className={cn(
                  "w-full sm:w-28 aspect-square rounded-xl shrink-0 grid place-items-center",
                  colorMap[item.color]
                )}
              >
                <ShoppingBag className="w-10 h-10 opacity-50" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-secondary uppercase tracking-wide">
                      {item.categoryLabel}
                    </div>
                    <Link
                      href={`/producto/${item.slug}`}
                      className="font-semibold text-foreground hover:text-accent transition-colors block mt-0.5"
                    >
                      {item.name}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`Quitar ${item.name}`}
                    className="text-foreground-soft hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="inline-flex items-center gap-1 bg-muted/60 border border-border rounded-full p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.id, item.quantity - 1)
                      }
                      aria-label="Reducir cantidad"
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-full grid place-items-center hover:bg-bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.id, item.quantity + 1)
                      }
                      aria-label="Aumentar cantidad"
                      disabled={
                        item.type === "physical" &&
                        item.quantity >= item.stock
                      }
                      className="w-8 h-8 rounded-full grid place-items-center hover:bg-bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-foreground">
                      {formatCLP(item.price * item.quantity)}
                    </div>
                    <div className="text-xs text-secondary">
                      {formatCLP(item.price)} c/u
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-sm text-foreground-soft hover:text-foreground mt-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Seguir comprando
        </Link>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 h-fit">
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display text-3xl text-foreground leading-none mb-5">
            Resumen
          </h2>
          <div className="flex justify-between text-foreground-soft mb-2">
            <span>Subtotal</span>
            <span className="text-foreground font-medium">
              {formatCLP(total)}
            </span>
          </div>
          <div className="flex justify-between text-foreground-soft mb-4">
            <span>Envío</span>
            <span>Se calcula al pagar</span>
          </div>
          <div className="border-t border-border pt-4 flex items-baseline justify-between mb-6">
            <span className="font-semibold">Total</span>
            <span className="font-display text-4xl text-foreground leading-none">
              {formatCLP(total)}
            </span>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">
              Ir al checkout
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </Button>
          <p className="text-xs text-secondary text-center mt-3">
            Pagos seguros con Mercado Pago
          </p>
        </div>
      </aside>
    </div>
  );
}
