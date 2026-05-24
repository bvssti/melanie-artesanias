import Link from "next/link";
import { Clock } from "lucide-react";
import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pago pendiente — Artesanías Melanie",
  robots: { index: false, follow: false },
};

export default function PagoPendientePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="py-20">
          <Container>
            <div className="max-w-[560px] mx-auto text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-pastel-lavender text-pastel-lavender-deep grid place-items-center mb-6">
                <Clock className="w-12 h-12" />
              </div>
              <h1 className="font-display text-6xl text-foreground leading-none">
                Pago pendiente
              </h1>
              <p className="text-foreground-soft text-lg mt-5">
                Tu pago está siendo procesado. Te avisaremos por email cuando se
                confirme.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <Button asChild>
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
