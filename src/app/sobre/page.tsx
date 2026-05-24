import Link from "next/link";
import { Heart, Sparkles, Package, MapPin } from "lucide-react";
import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sobre Melanie — Artesanías Melanie",
  description:
    "Conoce la historia detrás del taller. Amigurumis tejidos uno por uno, con tiempo, paciencia y cariño.",
};

const valores = [
  {
    Icon: Heart,
    title: "Hecho con tiempo",
    desc: "Cada pieza puede tomar varios días de trabajo. No hay máquinas, solo manos y paciencia.",
  },
  {
    Icon: Sparkles,
    title: "Materiales cuidados",
    desc: "Algodón premium e hilo amigurumi hipoalergénico. Cariñoso con la piel.",
  },
  {
    Icon: Package,
    title: "Empacado con cariño",
    desc: "Cada pedido va con un pequeño detalle y mucho cuidado al embalar.",
  },
  {
    Icon: MapPin,
    title: "Envío a todo Chile",
    desc: "Despacho rápido por Starken o Chilexpress, según tu comuna.",
  },
];

export default function SobrePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="pt-12 pb-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[var(--shadow-lg)] grid place-items-center bg-pastel-rose text-pastel-rose-deep">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-32 h-32"
                  aria-hidden
                >
                  <circle cx="12" cy="10" r="6" />
                  <path d="M9 16l-2 5M15 16l2 5M9 9h.01M15 9h.01M9.5 12c.83.67 2.17.67 3 0" />
                </svg>
                <div className="absolute top-8 right-8 bg-bg-card px-4 py-2.5 rounded-2xl font-display text-3xl text-accent shadow-[var(--shadow-md)] -rotate-3">
                  Desde 2022
                </div>
                <div className="absolute bottom-8 left-8 bg-bg-card px-4 py-2.5 rounded-2xl font-display text-3xl text-pastel-sage-deep shadow-[var(--shadow-md)] rotate-3">
                  Pequeño taller
                </div>
              </div>
              <div>
                <span className="font-display text-[28px] tracking-wider text-accent block leading-none">
                  Hola, soy Melanie
                </span>
                <h1 className="font-display text-6xl md:text-7xl text-foreground leading-none my-5">
                  Detrás de cada<br />puntada
                </h1>
                <p className="text-foreground-soft text-lg">
                  Mi historia con el crochet empezó casi por casualidad: una
                  tarde de invierno, un ovillo de algodón rosado y muchas ganas
                  de aprender. Lo que comenzó como un pasatiempo se convirtió
                  poco a poco en mi forma favorita de expresarme.
                </p>
                <p className="text-foreground-soft text-lg mt-4">
                  Hoy tejo amigurumis para personas que quieren regalar algo
                  único, escribo patrones para quienes recién empiezan, y
                  decoro agendas para acompañar nuevas historias. Todo desde mi
                  taller, todo a mano, todo con cariño.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Button asChild>
                    <Link href="/catalogo">Ver el catálogo</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="https://wa.me/56900000000" target="_blank">
                      Escribirme por WhatsApp
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 bg-muted/50 border-y border-border">
          <Container>
            <div className="text-center mb-12">
              <span className="font-display text-[28px] tracking-wider text-accent block leading-none mb-2">
                Lo que valoro
              </span>
              <h2 className="font-display text-5xl md:text-6xl text-foreground leading-none">
                Mi forma de trabajar
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {valores.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-6 bg-bg-card rounded-2xl border border-border"
                >
                  <div className="w-12 h-12 bg-accent-soft text-accent rounded-xl grid place-items-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-foreground mb-1">{title}</div>
                  <div className="text-sm text-foreground-soft">{desc}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-20">
          <Container>
            <div className="bg-gradient-to-br from-pastel-rose to-accent-soft rounded-3xl px-8 py-16 text-center shadow-[var(--shadow-md)]">
              <span className="font-display text-[28px] tracking-wider text-accent block leading-none mb-2">
                ¿Tienes una idea?
              </span>
              <h2 className="font-display text-5xl md:text-6xl text-foreground leading-none">
                Hagámosla juntas
              </h2>
              <p className="text-foreground-soft text-lg mt-4 max-w-[50ch] mx-auto">
                Si quieres un amigurumi o agenda totalmente personalizada,
                escríbeme y conversemos.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="https://wa.me/56900000000" target="_blank">
                  Escribirme por WhatsApp
                </Link>
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
