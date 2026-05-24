import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container } from "@/components/ui/container";
import { CatalogGrid } from "@/components/tienda/catalog-grid";
import { products } from "@/data/products";

export const metadata = {
  title: "Catálogo — Artesanías Melanie",
  description:
    "Todos los amigurumis, patrones y agendas personalizadas disponibles ahora.",
};

export default function CatalogoPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="pt-12 pb-16">
          <Container>
            <div className="text-center mb-10">
              <span className="font-display text-[28px] tracking-wider text-accent block leading-none mb-2">
                Todo nuestro catálogo
              </span>
              <h1 className="font-display text-5xl md:text-6xl text-foreground leading-none">
                Encuentra lo tuyo
              </h1>
              <p className="text-foreground-soft text-lg mt-4 max-w-[60ch] mx-auto">
                Amigurumis, patrones digitales y agendas personalizadas — todas
                hechas con cariño.
              </p>
            </div>

            <CatalogGrid products={products} />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
