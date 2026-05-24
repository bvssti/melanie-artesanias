"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCart, useCartTotal } from "@/lib/store/cart";
import { formatCLP, cn } from "@/lib/utils";

const colorMap = {
  rose: "bg-pastel-rose text-pastel-rose-deep",
  sage: "bg-pastel-sage text-pastel-sage-deep",
  lavender: "bg-pastel-lavender text-pastel-lavender-deep",
} as const;

const regiones = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
];

export function CheckoutForm() {
  const items = useCart((s) => s.items);
  const total = useCartTotal();
  const [submitting, setSubmitting] = useState(false);

  const hasPhysical = items.some((i) => i.type === "physical");
  const hasDigital = items.some((i) => i.type === "digital");

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const data = new FormData(e.currentTarget);
    const payload = {
      customer: Object.fromEntries(data.entries()),
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    try {
      const res = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo iniciar el pago");
        setSubmitting(false);
        return;
      }
      // Redirige a Mercado Pago. En desarrollo usa sandboxInitPoint si existe.
      const url =
        process.env.NEXT_PUBLIC_MP_SANDBOX === "true"
          ? json.sandboxInitPoint
          : json.initPoint;
      if (url) {
        window.location.href = url;
      } else {
        setError("Mercado Pago no devolvió una URL de pago");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

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
          Agrega productos antes de continuar al checkout.
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
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10"
    >
      <div>
        <h1 className="font-display text-5xl md:text-6xl text-foreground leading-none mb-2">
          Finalizar compra
        </h1>
        <p className="text-foreground-soft mb-10">
          Completa tus datos y serás redirigido a Mercado Pago para pagar de
          forma segura.
        </p>

        <Section title="Tus datos" eyebrow="Información de contacto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                name="nombre"
                required
                autoComplete="name"
                placeholder="María González"
              />
            </Field>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="maria@correo.com"
              />
            </Field>
            <Field>
              <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+56 9 1234 5678"
              />
            </Field>
            <Field>
              <Label htmlFor="rut">RUT (opcional)</Label>
              <Input
                id="rut"
                name="rut"
                placeholder="12.345.678-9"
              />
            </Field>
          </div>
        </Section>

        {hasPhysical && (
          <Section title="Dirección de envío" eyebrow="Para productos físicos">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field className="sm:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  required={hasPhysical}
                  autoComplete="street-address"
                  placeholder="Av. Providencia 1234, Depto 56"
                />
              </Field>
              <Field>
                <Label htmlFor="ciudad">Ciudad / Comuna</Label>
                <Input
                  id="ciudad"
                  name="ciudad"
                  required={hasPhysical}
                  autoComplete="address-level2"
                  placeholder="Providencia"
                />
              </Field>
              <Field>
                <Label htmlFor="region">Región</Label>
                <select
                  id="region"
                  name="region"
                  required={hasPhysical}
                  defaultValue=""
                  className="h-12 w-full rounded-full border border-border bg-bg-card px-5 text-[15px] focus:outline-3 focus:outline-accent focus:outline-offset-2"
                >
                  <option value="" disabled>
                    Selecciona tu región
                  </option>
                  {regiones.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>
        )}

        <Section title="Notas para Melanie" eyebrow="Opcional">
          <Field>
            <Label htmlFor="notas">
              ¿Alguna instrucción, personalización o mensaje?
            </Label>
            <Textarea
              id="notas"
              name="notas"
              placeholder="Ej: La agenda con el nombre 'Sofía', colores rosa y celeste."
              rows={4}
            />
          </Field>
        </Section>

        {hasDigital && !hasPhysical && (
          <p className="text-sm text-foreground-soft bg-pastel-sage/30 border border-pastel-sage rounded-2xl p-4">
            Tu pedido es 100% digital — recibirás los PDFs por email tras
            confirmar el pago. No necesitamos dirección de envío.
          </p>
        )}
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 h-fit">
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display text-3xl text-foreground leading-none mb-5">
            Tu pedido
          </h2>
          <ul className="flex flex-col gap-3 mb-5 max-h-[320px] overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl shrink-0 grid place-items-center relative",
                    colorMap[item.color]
                  )}
                >
                  <ShoppingBag className="w-5 h-5 opacity-60" />
                  <span className="absolute -top-1 -right-1 bg-foreground text-bg text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-secondary uppercase tracking-wide">
                    {item.categoryLabel}
                  </div>
                  <div className="text-sm font-medium line-clamp-2 leading-snug">
                    {item.name}
                  </div>
                </div>
                <div className="text-sm font-semibold whitespace-nowrap">
                  {formatCLP(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm text-foreground-soft">
              <span>Subtotal</span>
              <span>{formatCLP(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-foreground-soft">
              <span>Envío</span>
              <span>Se acuerda por WhatsApp</span>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <span className="font-semibold">Total</span>
              <span className="font-display text-4xl text-foreground leading-none">
                {formatCLP(total)}
              </span>
            </div>
          </div>
          {error && (
            <div
              role="alert"
              className="mt-4 p-3 rounded-2xl bg-pastel-rose/40 border border-pastel-rose-deep/30 text-sm text-foreground"
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full mt-6"
          >
            {submitting ? "Procesando…" : "Pagar con Mercado Pago"}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Button>
          <p className="text-xs text-secondary text-center mt-3 inline-flex items-center justify-center gap-1.5 w-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pago seguro · No guardamos tu tarjeta
          </p>
        </div>
      </aside>
    </form>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      {eyebrow && (
        <div className="text-xs text-accent uppercase tracking-wider font-semibold mb-1">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl text-foreground leading-none mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}
