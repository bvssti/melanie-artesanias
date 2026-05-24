import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/data/categories";
import { getCategoryIcon } from "./category-icons";
import { cn } from "@/lib/utils";

const colorMap = {
  rose: "bg-pastel-rose",
  sage: "bg-pastel-sage",
  lavender: "bg-pastel-lavender",
} as const;

export function CategoryCard({ category }: { category: Category }) {
  const Icon = getCategoryIcon(category.icon);
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      className={cn(
        "block group rounded-3xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] shadow-[var(--shadow-sm)]",
        colorMap[category.color]
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/50 grid place-items-center text-foreground mb-5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-display text-[40px] leading-none text-foreground mb-2">
        {category.name}
      </h3>
      <p className="text-foreground-soft mb-6">{category.description}</p>
      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
        Ver {category.name.toLowerCase()}
        <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
