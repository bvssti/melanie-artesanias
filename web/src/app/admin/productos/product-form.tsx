"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProduct } from "../actions";

interface ProductFormProps {
  product?: {
    id: string;
    slug: string;
    name: string;
    description: string;
    details: string[] | null;
    price: number;
    stock: number;
    category_id: string;
    category_label: string;
    color: string;
    type: string;
    badge: string | null;
    images: string[] | null;
    pdf_url: string | null;
    featured: boolean;
    published: boolean;
  };
  categories: Array<{ id: string; name: string; color: string }>;
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(saveProduct, null);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Identidad">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={product?.name}
              placeholder='Conejito Pastel "Tomás"'
            />
          </Field>
          <Field>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              name="slug"
              required
              defaultValue={product?.slug}
              pattern="^[a-z0-9-]+$"
              placeholder="conejito-pastel-tomas"
            />
          </Field>
        </div>
        <Field>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            required
            defaultValue={product?.description}
            rows={4}
            placeholder="Conejito tejido a crochet en tonos pastel..."
          />
        </Field>
        <Field>
          <Label htmlFor="details">
            Detalles (uno por línea)
          </Label>
          <Textarea
            id="details"
            name="details"
            defaultValue={product?.details?.join("\n") ?? ""}
            rows={4}
            placeholder={"Alto: 22 cm aprox.\nMateriales: algodón premium\nRelleno: guata hipoalergénica"}
          />
        </Field>
      </Section>

      <Section title="Categoría y estilo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label htmlFor="category_id">Categoría</Label>
            <select
              id="category_id"
              name="category_id"
              required
              defaultValue={product?.category_id ?? ""}
              className="h-12 w-full rounded-full border border-border bg-bg-card px-5 text-[15px] focus:outline-3 focus:outline-accent focus:outline-offset-2"
            >
              <option value="" disabled>
                Selecciona
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <Label htmlFor="category_label">Etiqueta visible</Label>
            <Input
              id="category_label"
              name="category_label"
              required
              defaultValue={product?.category_label}
              placeholder="Amigurumi · Patrón digital · Agenda"
            />
          </Field>
          <Field>
            <Label htmlFor="color">Color pastel</Label>
            <select
              id="color"
              name="color"
              required
              defaultValue={product?.color ?? "rose"}
              className="h-12 w-full rounded-full border border-border bg-bg-card px-5 text-[15px] focus:outline-3 focus:outline-accent focus:outline-offset-2"
            >
              <option value="rose">Rosa polvo</option>
              <option value="sage">Sage</option>
              <option value="lavender">Lavanda</option>
            </select>
          </Field>
          <Field>
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              name="type"
              required
              defaultValue={product?.type ?? "physical"}
              className="h-12 w-full rounded-full border border-border bg-bg-card px-5 text-[15px] focus:outline-3 focus:outline-accent focus:outline-offset-2"
            >
              <option value="physical">Físico (con envío)</option>
              <option value="digital">Digital (PDF)</option>
            </select>
          </Field>
        </div>
        <Field>
          <Label htmlFor="badge">
            Etiqueta destacada (opcional)
          </Label>
          <Input
            id="badge"
            name="badge"
            defaultValue={product?.badge ?? ""}
            placeholder="Nuevo, Pack ahorro, Personalizable…"
          />
        </Field>
      </Section>

      <Section title="Precio y stock">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label htmlFor="price">Precio (CLP)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step={100}
              required
              defaultValue={product?.price ?? ""}
              placeholder="18500"
            />
          </Field>
          <Field>
            <Label htmlFor="stock">
              Stock {product?.type === "digital" || "(ignora si es digital)"}
            </Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              required
              defaultValue={product?.stock ?? 0}
              placeholder="3"
            />
          </Field>
        </div>
      </Section>

      <Section title="Archivos">
        <Field>
          <Label htmlFor="images">
            URLs de imágenes (una por línea)
          </Label>
          <Textarea
            id="images"
            name="images"
            defaultValue={product?.images?.join("\n") ?? ""}
            rows={3}
            placeholder="https://xxx.supabase.co/storage/v1/object/public/product-images/..."
          />
          <p className="text-xs text-secondary mt-1">
            Súbelas en Supabase Storage (bucket public:{" "}
            <code>product-images</code>) y pega las URLs públicas aquí.
          </p>
        </Field>
        <Field>
          <Label htmlFor="pdf_url">
            URL del PDF (solo para patrones digitales)
          </Label>
          <Input
            id="pdf_url"
            name="pdf_url"
            type="url"
            defaultValue={product?.pdf_url ?? ""}
            placeholder="https://xxx.supabase.co/storage/v1/object/sign/..."
          />
        </Field>
      </Section>

      <Section title="Visibilidad">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              defaultChecked={product?.published ?? true}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-sm">Publicado (visible en la tienda)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-sm">Destacado en la home</span>
          </label>
        </div>
      </Section>

      {state?.error && (
        <div
          role="alert"
          className="p-3 rounded-2xl bg-pastel-rose/40 border border-pastel-rose-deep/30 text-sm"
        >
          {state.error}
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button asChild variant="secondary" disabled={pending}>
          <Link href="/admin/productos">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-3xl text-foreground leading-none mb-4">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}
