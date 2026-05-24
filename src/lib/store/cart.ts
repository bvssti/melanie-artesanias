"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  type: Product["type"];
  color: Product["color"];
  categoryLabel: string;
}

interface CartState {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setOpen: (open) => set({ isOpen: open }),
      add: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.id === product.id);
        const desired = (existing?.quantity ?? 0) + quantity;
        const maxAllowed =
          product.type === "digital" ? 99 : Math.max(0, product.stock);
        const finalQty = Math.min(desired, maxAllowed);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: finalQty } : i
            ),
            isOpen: true,
          });
        } else if (finalQty > 0) {
          set({
            items: [
              ...items,
              {
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                quantity: finalQty,
                stock: product.stock,
                type: product.type,
                color: product.color,
                categoryLabel: product.categoryLabel,
              },
            ],
            isOpen: true,
          });
        }
      },
      remove: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),
      setQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.id !== id) return i;
            const max = i.type === "digital" ? 99 : Math.max(0, i.stock);
            return { ...i, quantity: Math.min(quantity, max) };
          }),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "artesanias-melanie-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function useCartCount() {
  return useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}

export function useCartTotal() {
  return useCart((s) =>
    s.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
}
