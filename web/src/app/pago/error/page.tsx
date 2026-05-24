import Link from "next/link";
import { XCircle } from "lucide-react";
import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pago no completado — Artesanías Melanie",
  robots: { index: false, follow: false },
};

export default function PagoErrorPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="py-20">
          <Container>
            <div className="max-w-[560px] mx-auto text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-pastel-rose text-pastel-rose-deep grid place-items-center mb-6">
                <XCircle className="w-12 h-12" />
              </div>
              <h1 className="font-display text-6xl text-foreground leading-none">
                Pago no completado
              </h1>
              <p className="text-foreground-soft text-lg mt-5">
                Algo salió mal o cancelaste el pago. No te preocupes — tu
                carrito sigue intacto.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <Button asChild>
                  <Link href="/checkout">Volver a intentar</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/carrito">Revisar carrito</Link>
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
