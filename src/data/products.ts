// Tipos del producto compartidos entre la UI y la capa de datos.
// Los datos reales viven en Supabase — ver src/lib/supabase/queries.ts.
import type { CategoryColor } from "./categories";

export type ProductType = "physical" | "digital";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  color: CategoryColor;
  price: number;
  stock: number;
  type: ProductType;
  badge?: string;
  description: string;
  details?: string[];
  images?: string[];
  featured?: boolean;
}
