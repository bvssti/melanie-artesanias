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
  pdf_url: z
    .union([z.string().url("Debe ser una URL válida"), z.literal("")])
    .optional(),
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
