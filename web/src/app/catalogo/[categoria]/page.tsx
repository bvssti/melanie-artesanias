import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container } from "@/components/ui/container";
import { CatalogGrid } from "@/components/tienda/catalog-grid";
import { categories, getCategory } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";

export function generateStaticParams() {
  return categories.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) return { title: "Categoría — Artesanías Melanie" };
  return {
    title: `${cat.name} — Artesanías Melanie`,
    description: cat.description,
  };
}

const heroBg = {
  rose: "bg-pastel-rose",
  sage: "bg-pastel-sage",
  lavender: "bg-pastel-lavender",
} as const;

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) notFound();

  const items = getProductsByCategory(cat.slug);

  return (
    <>
      <Navbar />
      <main>
        <section className={`${heroBg[cat.color]} pt-12 pb-20`}>
          <Container>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-sm text-foreground-soft hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Todo el catálogo
            </Link>
            <div className="max-w-[60ch]">
              <span className="font-display text-[28px] tracking-wider text-foreground/70 block leading-none mb-2">
                Categoría
              </span>
              <h1 className="font-display text-6xl md:text-7xl text-foreground leading-none">
                {cat.name}
              </h1>
              <p className="text-foreground-soft text-lg mt-4">
                {cat.description}
              </p>
            </div>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <CatalogGrid
              products={items}
              showCategoryFilter={false}
            />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
