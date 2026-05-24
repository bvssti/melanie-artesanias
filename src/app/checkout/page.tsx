import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "@/components/tienda/checkout-form";

export const metadata = {
  title: "Finalizar compra — Artesanías Melanie",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="py-16">
          <Container>
            <CheckoutForm />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
