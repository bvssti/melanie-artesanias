// Capa de acceso a datos contra Supabase para lecturas PÚBLICAS.
//
// Importante: usamos `createAnonClient` (sin cookies) en todas las queries
// porque estas pages son prerenderizadas — `generateStaticParams` y
// `generateMetadata` corren fuera del request scope, donde `cookies()` tira
// "called outside a request scope" y crashea con 500.
//
// La RLS policy "public read published products" autoriza estos selects con
// la anon key, así que no perdemos seguridad.
import { createAnonClient } from "./server";
import type { CategoryColor, ProductType } from "./types";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";

function rowToProduct(row: {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[] | null;
  price: number;
  stock: number;
  category_label: string;
  color: CategoryColor;
  type: ProductType;
  badge: string | null;
  images: string[] | null;
  featured: boolean;
  categories?: { slug: string } | { slug: string }[] | null;
}): Product {
  const categorySlug = Array.isArray(row.categories)
    ? row.categories[0]?.slug
    : row.categories?.slug;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    details: row.details ?? undefined,
    price: row.price,
    stock: row.stock,
    category: categorySlug ?? "",
    categoryLabel: row.category_label,
    color: row.color,
    type: row.type,
    badge: row.badge ?? undefined,
    images: row.images ?? undefined,
    featured: row.featured,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, description, color, icon")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    color: row.color,
    icon: row.icon,
  }));
}

export async function fetchProducts(): Promise<Product[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, details, price, stock, category_label, color, type, badge, images, featured, categories(slug)"
    )
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToProduct);
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, details, price, stock, category_label, color, type, badge, images, featured, categories(slug)"
    )
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error || !data) return [];
  return data.map(rowToProduct);
}

export async function fetchProductBySlug(
  slug: string
): Promise<Product | null> {
  const supabase = createAnonClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, details, price, stock, category_label, color, type, badge, images, featured, categories(slug)"
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProduct(data);
}

export async function fetchProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, details, price, stock, category_label, color, type, badge, images, featured, categories!inner(slug)"
    )
    .eq("published", true)
    .eq("categories.slug", categorySlug)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToProduct);
}

export async function fetchRelatedProducts(
  categorySlug: string,
  excludeProductId: string,
  limit = 4
): Promise<Product[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, details, price, stock, category_label, color, type, badge, images, featured, categories!inner(slug)"
    )
    .eq("published", true)
    .eq("categories.slug", categorySlug)
    .neq("id", excludeProductId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(rowToProduct);
}

export async function fetchAllProductSlugs(): Promise<string[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("published", true);
  if (error || !data) return [];
  return data.map((r) => r.slug);
}
