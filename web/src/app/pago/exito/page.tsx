import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/tienda/clear-cart-on-mount";

export const metadata = {
  title: "¡Compra exitosa! — Artesanías Melanie",
  robots: { index: false, follow: false },
};

export default async function PagoExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <>
      <Navbar />
      <ClearCartOnMount />
      <main>
        <section className="py-20">
          <Container>
            <div className="max-w-[560px] mx-auto text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-pastel-sage text-pastel-sage-deep grid place-items-center mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <span className="font-display text-[28px] tracking-wider text-accent block leading-none mb-2">
                ¡Gracias por tu compra!
              </span>
              <h1 className="font-display text-6xl text-foreground leading-none">
                Tu pedido fue confirmado
              </h1>
              <p className="text-foreground-soft text-lg mt-5">
                Te enviaremos un email con los detalles del pedido. Si compraste
                un patrón digital, lo recibirás también por correo.
              </p>
              {order && (
                <p className="text-sm text-secondary mt-3 font-mono">
                  Orden: {order.slice(0, 8)}…
                </p>
              )}
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <Button asChild>
                  <Link href="/catalogo">Seguir comprando</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/">Volver al inicio</Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
