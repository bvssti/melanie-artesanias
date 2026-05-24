// Tipos manuales — coinciden con el schema en schema.sql.
// Cuando tengas Supabase configurado puedes regenerarlos con:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts

export type CategoryColor = "rose" | "sage" | "lavender";
export type CategoryIcon = "amigurumi" | "pattern" | "notebook";
export type ProductType = "physical" | "digital";

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface DBCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: CategoryColor;
  icon: CategoryIcon;
  sort_order: number;
  created_at: string;
}

export interface DBProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[] | null;
  price: number;
  stock: number;
  category_id: string;
  category_label: string;
  color: CategoryColor;
  type: ProductType;
  badge: string | null;
  images: string[] | null;
  pdf_url: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBOrder {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_rut: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_region: string | null;
  notes: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  mp_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_type: ProductType;
  unit_price: number;
  quantity: number;
  total: number;
  created_at: string;
}
