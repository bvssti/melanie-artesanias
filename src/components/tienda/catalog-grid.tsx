"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "./product-card";
import { Input } from "@/components/ui/input";
import type { Product } from "@/data/products";
import { categories } from "@/data/categories";

type SortKey = "destacados" | "precio-asc" | "precio-desc" | "nombre";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nombre", label: "Nombre A–Z" },
];

interface Props {
  products: Product[];
  showCategoryFilter?: boolean;
  initialCategory?: string;
}

export function CatalogGrid({
  products,
  showCategoryFilter = true,
  initialCategory = "todos",
}: Props) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("destacados");

  const filtered = useMemo(() => {
    let list = [...products];
    if (showCategoryFilter && category !== "todos") {
      list = list.filter((p) => p.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "precio-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "nombre":
        list.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      case "destacados":
        list.sort(
          (a, b) => Number(!!b.featured) - Number(!!a.featured)
        );
        break;
    }
    return list;
  }, [products, category, query, sort, showCategoryFilter]);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar amigurumis, patrones, agendas…"
            className="pl-12"
            aria-label="Buscar productos"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {showCategoryFilter && (
            <div className="flex flex-wrap gap-2" role="tablist">
              <FilterPill
                active={category === "todos"}
                label="Todos"
                onClick={() => setCategory("todos")}
              />
              {categories.map((c) => (
                <FilterPill
                  key={c.slug}
                  active={category === c.slug}
                  label={c.name}
                  onClick={() => setCategory(c.slug)}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="sort" className="text-sm text-foreground-soft">
              Ordenar:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-full border border-border bg-bg-card px-4 text-sm font-medium text-foreground focus:outline-3 focus:outline-accent focus:outline-offset-2"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-foreground-soft" aria-live="polite">
          {filtered.length}{" "}
          {filtered.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="font-display text-4xl text-foreground mb-2">
            Sin resultados
          </div>
          <p className="text-foreground-soft">
            Prueba con otra búsqueda o limpia los filtros.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={!!active}
      onClick={onClick}
      className={
        active
          ? "px-5 py-2 rounded-full border-[1.5px] bg-foreground text-bg border-foreground text-sm font-medium min-h-10"
          : "px-5 py-2 rounded-full border-[1.5px] bg-bg-card text-foreground-soft border-border hover:border-secondary hover:text-foreground text-sm font-medium min-h-10 transition-colors"
      }
    >
      {label}
    </button>
  );
}
