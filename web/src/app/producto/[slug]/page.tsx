import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container, SectionHeader } from "@/components/ui/container";
import { ProductDetail } from "@/components/tienda/product-detail";
import { ProductCard } from "@/components/tienda/product-card";
import { getProductBySlug, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product)
    return { title: "Producto no encontrado — Artesanías Melanie" };
  return {
    title: `${product.name} — Artesanías Melanie`,
    description: product.description,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products
    .filter(
      (p) => p.category === product.category && p.id !== product.id
    )
    .slice(0, 4);

  return (
    <>
      <Navbar />
      <main>
        <section className="pt-8 pb-16">
          <Container>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-sm text-foreground-soft hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </Link>
            <ProductDetail product={product} />
          </Container>
        </section>

        {related.length > 0 && (
          <section className="py-16 border-t border-border bg-muted/40">
            <Container>
              <SectionHeader
                eyebrow="Te puede gustar"
                title="También en esta categoría"
              />
              <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </Container>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
