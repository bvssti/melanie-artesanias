import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container } from "@/components/ui/container";
import { CartPageContent } from "@/components/tienda/cart-page";

export const metadata = {
  title: "Tu carrito — Artesanías Melanie",
};

export default function CarritoPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="py-16">
          <Container>
            <CartPageContent />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
