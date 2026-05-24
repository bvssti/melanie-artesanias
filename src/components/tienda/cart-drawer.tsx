"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, useCartTotal } from "@/lib/store/cart";
import { formatCLP, cn } from "@/lib/utils";

const colorMap = {
  rose: "bg-pastel-rose text-pastel-rose-deep",
  sage: "bg-pastel-sage text-pastel-sage-deep",
  lavender: "bg-pastel-lavender text-pastel-lavender-deep",
} as const;

export function CartDrawer() {
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const total = useCartTotal();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Aún no agregas productos"
              : `${items.length} ${items.length === 1 ? "producto" : "productos"} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-accent-soft text-accent grid place-items-center mb-4">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <p className="font-display text-3xl text-foreground leading-tight">
              Tu carrito está vacío
            </p>
            <p className="text-foreground-soft mt-2 max-w-[28ch]">
              Explora el catálogo y agrega tus artesanías favoritas.
            </p>
            <Button asChild className="mt-6" onClick={() => setOpen(false)}>
              <Link href="/catalogo">Ver catálogo</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-2xl bg-muted/50 border border-border"
                >
                  <div
                    className={cn(
                      "w-20 h-20 rounded-xl shrink-0 grid place-items-center",
                      colorMap[item.color]
                    )}
                  >
                    <ShoppingBag className="w-6 h-6 opacity-60" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="text-[11px] text-secondary uppercase tracking-wide">
                      {item.categoryLabel}
                    </div>
                    <Link
                      href={`/producto/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="font-semibold text-sm leading-tight hover:text-accent transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <QuantityControl
                        value={item.quantity}
                        max={item.type === "digital" ? 99 : item.stock}
                        onChange={(q) => setQuantity(item.id, q)}
                      />
                      <div className="text-right">
                        <div className="font-bold text-foreground">
                          {formatCLP(item.price * item.quantity)}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={`Quitar ${item.name}`}
                          className="text-[12px] text-secondary hover:text-destructive inline-flex items-center gap-1 mt-0.5 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-foreground-soft">Subtotal</span>
                <span className="font-display text-4xl text-foreground leading-none">
                  {formatCLP(total)}
                </span>
              </div>
              <p className="text-xs text-secondary mb-2">
                El costo de envío se calcula en el checkout
              </p>
              <Button asChild size="lg" onClick={() => setOpen(false)}>
                <Link href="/checkout">
                  Ir al checkout
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-foreground-soft"
              >
                Seguir comprando
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function QuantityControl({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (q: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 bg-bg-card border border-border rounded-full p-1">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Reducir cantidad"
        className="w-7 h-7 rounded-full grid place-items-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        disabled={value <= 1}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Aumentar cantidad"
        className="w-7 h-7 rounded-full grid place-items-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        disabled={value >= max}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
