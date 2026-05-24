"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveProduct, type ProductFormState } from "../actions";
import { ImageUploader } from "./image-uploader";

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

// Quita acentos, pasa a minúsculas, cambia no-alfanuméricos por "-".
// Rango ̀-ͯ = "Combining Diacritical Marks" que aparece al hacer NFD.
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const isEditing = !!product;
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(saveProduct, null);

  // Valores iniciales: si el server devolvió valores tras error, usar esos;
  // si no, los del producto (modo edición). Cambian con cada submit fallido
  // y React aplica defaultValue al resetear el form.
  const initial = state?.values ?? toInitial(product);

  const fieldErrors = state?.ok === false ? state.fieldErrors ?? {} : {};
  const formError = state?.ok === false ? state.formError : undefined;

  // Auto-slug desde nombre (solo si el slug no ha sido tocado manualmente).
  const [name, setName] = useState(initial.name ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const slugTouched = useRef(!!initial.slug);

  // Re-sync cuando llega un nuevo `state` (echo del server tras error).
  useEffect(() => {
    if (state?.values) {
      setName(state.values.name ?? "");
      setSlug(state.values.slug ?? "");
      slugTouched.current = !!state.values.slug;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (!slugTouched.current && name) {
      setSlug(slugify(name));
    }
  }, [name]);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Identidad">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field error={fieldErrors.name}>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder='Conejito Pastel "Tomás"'
              aria-invalid={!!fieldErrors.name}
            />
          </Field>
          <Field
            error={fieldErrors.slug}
            hint="Se genera desde el nombre. Edítalo si quieres."
          >
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                slugTouched.current = true;
                setSlug(e.currentTarget.value);
              }}
              pattern="^[a-z0-9-]+$"
              placeholder="conejito-pastel-tomas"
              aria-invalid={!!fieldErrors.slug}
            />
          </Field>
        </div>
        <Field error={fieldErrors.description}>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            required
            defaultValue={initial.description}
            rows={4}
            placeholder="Conejito tejido a crochet en tonos pastel..."
            aria-invalid={!!fieldErrors.description}
          />
        </Field>
        <Field error={fieldErrors.details}>
          <Label htmlFor="details">Detalles (uno por línea)</Label>
          <Textarea
            id="details"
            name="details"
            defaultValue={initial.details}
            rows={4}
            placeholder={
              "Alto: 22 cm aprox.\nMateriales: algodón premium\nRelleno: guata hipoalergénica"
            }
          />
        </Field>
      </Section>

      <Section title="Categoría y estilo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field error={fieldErrors.category_id}>
            <Label htmlFor="category_id">Categoría</Label>
            <select
              id="category_id"
              name="category_id"
              required
              defaultValue={initial.category_id || ""}
              className="h-12 w-full rounded-full border border-border bg-bg-card px-5 text-[15px] focus:outline-3 focus:outline-accent focus:outline-offset-2"
              aria-invalid={!!fieldErrors.category_id}
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
          <Field error={fieldErrors.category_label}>
            <Label htmlFor="category_label">Etiqueta visible</Label>
            <Input
              id="category_label"
              name="category_label"
              required
              defaultValue={initial.category_label}
              placeholder="Amigurumi · Patrón digital · Agenda"
              aria-invalid={!!fieldErrors.category_label}
            />
          </Field>
          <Field error={fieldErrors.color}>
            <Label htmlFor="color">Color pastel</Label>
            <select
              id="color"
              name="color"
              required
              defaultValue={initial.color || "rose"}
              className="h-12 w-full rounded-full border border-border bg-bg-card px-5 text-[15px] focus:outline-3 focus:outline-accent focus:outline-offset-2"
            >
              <option value="rose">Rosa polvo</option>
              <option value="sage">Sage</option>
              <option value="lavender">Lavanda</option>
            </select>
          </Field>
          <Field error={fieldErrors.type}>
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              name="type"
              required
              defaultValue={initial.type || "physical"}
              className="h-12 w-full rounded-full border border-border bg-bg-card px-5 text-[15px] focus:outline-3 focus:outline-accent focus:outline-offset-2"
            >
              <option value="physical">Físico (con envío)</option>
              <option value="digital">Digital (PDF)</option>
            </select>
          </Field>
        </div>
        <Field error={fieldErrors.badge}>
          <Label htmlFor="badge">Etiqueta destacada (opcional)</Label>
          <Input
            id="badge"
            name="badge"
            defaultValue={initial.badge}
            placeholder="Nuevo, Pack ahorro, Personalizable…"
          />
        </Field>
      </Section>

      <Section title="Precio y stock">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field error={fieldErrors.price}>
            <Label htmlFor="price">Precio (CLP)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step={100}
              required
              defaultValue={initial.price}
              placeholder="18500"
              aria-invalid={!!fieldErrors.price}
            />
          </Field>
          <Field
            error={fieldErrors.stock}
            hint="Para digitales se ignora."
          >
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              required
              defaultValue={initial.stock || "0"}
              placeholder="3"
              aria-invalid={!!fieldErrors.stock}
            />
          </Field>
        </div>
      </Section>

      <Section title="Archivos">
        <Field error={fieldErrors.images}>
          <Label>Imágenes del producto</Label>
          <ImageUploader
            initial={parseLines(initial.images)}
            name="images"
            disabled={pending}
          />
        </Field>
        <Field
          error={fieldErrors.pdf_url}
          hint="Solo para patrones digitales."
        >
          <Label htmlFor="pdf_url">URL del PDF</Label>
          <Input
            id="pdf_url"
            name="pdf_url"
            type="url"
            defaultValue={initial.pdf_url}
            placeholder="https://xxx.supabase.co/storage/v1/object/sign/..."
            aria-invalid={!!fieldErrors.pdf_url}
          />
        </Field>
      </Section>

      <Section title="Visibilidad">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              defaultChecked={initial.published}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-sm">Publicado (visible en la tienda)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initial.featured}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-sm">Destacado en la home</span>
          </label>
        </div>
      </Section>

      {formError && (
        <div
          role="alert"
          className="p-3 rounded-2xl bg-pastel-rose/40 border border-pastel-rose-deep/30 text-sm"
        >
          {formError}
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={pending}>
          {pending
            ? isEditing
              ? "Guardando…"
              : "Creando…"
            : isEditing
              ? "Guardar cambios"
              : "Crear producto"}
        </Button>
        <Button asChild variant="secondary" disabled={pending}>
          <Link href="/admin/productos">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

// Convierte el producto inicial en un mapa { [field]: string } compatible
// con el shape de `state.values` que devuelve el server action.
function toInitial(
  product?: ProductFormProps["product"]
): Record<string, string> {
  if (!product) {
    // Defaults razonables para producto nuevo.
    return { published: "on" };
  }
  return {
    slug: product.slug,
    name: product.name,
    description: product.description,
    details: product.details?.join("\n") ?? "",
    price: String(product.price),
    stock: String(product.stock),
    category_id: product.category_id,
    category_label: product.category_label,
    color: product.color,
    type: product.type,
    badge: product.badge ?? "",
    images: product.images?.join("\n") ?? "",
    pdf_url: product.pdf_url ?? "",
    featured: product.featured ? "on" : "",
    published: product.published ? "on" : "",
  };
}

function parseLines(v: string | undefined): string[] {
  if (!v) return [];
  return v.split("\n").map((s) => s.trim()).filter(Boolean);
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

function Field({
  children,
  error,
  hint,
}: {
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col">
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className={cn("text-xs text-destructive mt-1.5 font-medium")}
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-secondary mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}
