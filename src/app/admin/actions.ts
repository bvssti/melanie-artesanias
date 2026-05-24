"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabase, createServiceClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";

// ============================================================
// AUTH
// ============================================================

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ============================================================
// PRODUCTOS
// ============================================================

const productSchema = z.object({
  slug: z
    .string()
    .min(2, "El slug debe tener al menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.coerce
    .number({ error: "Precio inválido" })
    .int("Sin decimales")
    .nonnegative("No puede ser negativo"),
  stock: z.coerce
    .number({ error: "Stock inválido" })
    .int("Sin decimales")
    .nonnegative("No puede ser negativo"),
  category_id: z.string().uuid("Categoría inválida"),
  category_label: z.string().min(2, "Mínimo 2 caracteres"),
  color: z.enum(["rose", "sage", "lavender"]),
  type: z.enum(["physical", "digital"]),
  badge: z.string().optional().nullable(),
  featured: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
  details: z.string().optional(), // separado por líneas
  images: z.string().optional(),  // URLs separadas por líneas
  // Path interno dentro del bucket privado `product-pdfs` (no URL pública).
  // Lo genera el PdfUploader; aquí solo validamos forma básica.
  pdf_url: z.string().max(255, "Path demasiado largo").optional(),
});

// Shape de retorno del server action. `null` = idle (sin submit todavía).
export type ProductFormState =
  | null
  | {
      ok: false;
      formError?: string;
      fieldErrors?: Partial<Record<string, string>>;
      values: Record<string, string>;
    };

function rawFromForm(formData: FormData): Record<string, string> {
  // Volcamos los inputs visibles a un objeto serializable que el cliente
  // usa como defaultValues cuando el form rerenderiza tras un error.
  const fields = [
    "slug",
    "name",
    "description",
    "price",
    "stock",
    "category_id",
    "category_label",
    "color",
    "type",
    "badge",
    "details",
    "images",
    "pdf_url",
  ] as const;
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = formData.get(f);
    out[f] = typeof v === "string" ? v : "";
  }
  out.featured = formData.get("featured") === "on" ? "on" : "";
  out.published = formData.get("published") === "on" ? "on" : "";
  return out;
}

async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return supabase;
}

export async function saveProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const id = (formData.get("id") as string | null) || null;
  const values = rawFromForm(formData);

  const parsed = productSchema.safeParse({
    slug: values.slug,
    name: values.name,
    description: values.description,
    price: values.price,
    stock: values.stock,
    category_id: values.category_id,
    category_label: values.category_label,
    color: values.color,
    type: values.type,
    badge: values.badge || null,
    featured: values.featured === "on",
    published: values.published === "on",
    details: values.details,
    images: values.images,
    pdf_url: values.pdf_url || "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, fieldErrors, values };
  }

  const data = parsed.data;
  const service = createServiceClient();

  // Slug único: chequea antes de insertar/actualizar para devolver error
  // inline en vez de un 23505 críptico de Postgres.
  const { data: slugClash } = await service
    .from("products")
    .select("id")
    .eq("slug", data.slug)
    .maybeSingle();

  if (slugClash && slugClash.id !== id) {
    return {
      ok: false,
      fieldErrors: { slug: "Ya existe un producto con ese slug" },
      values,
    };
  }

  const payload = {
    slug: data.slug,
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    category_id: data.category_id,
    category_label: data.category_label,
    color: data.color,
    type: data.type,
    badge: data.badge?.toString().trim() || null,
    featured: !!data.featured,
    published: data.published ?? true,
    details: data.details
      ? data.details.split("\n").map((s) => s.trim()).filter(Boolean)
      : null,
    images: data.images
      ? data.images.split("\n").map((s) => s.trim()).filter(Boolean)
      : null,
    pdf_url: data.pdf_url || null,
  };

  if (id) {
    const { error } = await service
      .from("products")
      .update(payload)
      .eq("id", id);
    if (error) return { ok: false, formError: error.message, values };
  } else {
    const { error } = await service.from("products").insert(payload);
    if (error) return { ok: false, formError: error.message, values };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const service = createServiceClient();
  const { error } = await service.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { ok: true };
}

// ------------------------------------------------------------
// Upload de PDF de producto digital al bucket PRIVADO `product-pdfs`.
// Usa service_role para bypassear cualquier policy de storage y porque
// el bucket no debe ser legible públicamente — los clientes descargan
// vía /api/download/[token] con URL firmada.
// ------------------------------------------------------------

const PDF_MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export type UploadPdfResult =
  | { ok: true; path: string; filename: string }
  | { ok: false; error: string };

export async function uploadProductPdf(
  formData: FormData
): Promise<UploadPdfResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No se recibió ningún archivo" };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Solo se aceptan archivos PDF" };
  }
  if (file.size > PDF_MAX_BYTES) {
    return { ok: false, error: "El PDF no puede pesar más de 20 MB" };
  }

  const service = createServiceClient();
  // Path con timestamp + random para evitar colisiones y dificultar guessing.
  // Bucket es privado, igual no es URL adivinable, pero por higiene.
  const safeStem = file.name
    .replace(/\.pdf$/i, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "patron";
  const path = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeStem}.pdf`;

  const { error } = await service.storage
    .from("product-pdfs")
    .upload(path, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, path, filename: file.name };
}

// Borra un PDF del bucket. Best-effort: ignora errores para no bloquear
// al usuario si la operación de Storage falla.
export async function deleteProductPdf(path: string): Promise<void> {
  await requireAdmin();
  if (!path) return;
  const service = createServiceClient();
  await service.storage.from("product-pdfs").remove([path]);
}

// ============================================================
// PEDIDOS
// ============================================================

const orderStatuses = [
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  if (!orderStatuses.includes(status)) {
    return { error: "Estado inválido" };
  }
  const service = createServiceClient();
  const { error } = await service
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true };
}
