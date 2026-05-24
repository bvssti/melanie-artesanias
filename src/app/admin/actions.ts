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
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().int().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  category_id: z.string().uuid(),
  category_label: z.string().min(2),
  color: z.enum(["rose", "sage", "lavender"]),
  type: z.enum(["physical", "digital"]),
  badge: z.string().optional().nullable(),
  featured: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
  details: z.string().optional(), // separado por líneas
  images: z.string().optional(),  // URLs separadas por líneas
  pdf_url: z.string().url().optional().or(z.literal("")),
});

async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return supabase;
}

export async function saveProduct(prevState: unknown, formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string | null;
  const raw = {
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    category_id: formData.get("category_id"),
    category_label: formData.get("category_label"),
    color: formData.get("color"),
    type: formData.get("type"),
    badge: formData.get("badge") || null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    details: formData.get("details") || "",
    images: formData.get("images") || "",
    pdf_url: formData.get("pdf_url") || "",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const data = parsed.data;
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

  const service = createServiceClient();
  if (id) {
    const { error } = await service
      .from("products")
      .update(payload)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await service.from("products").insert(payload);
    if (error) return { error: error.message };
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
