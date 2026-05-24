import Link from "next/link";
import { ArrowRight, Heart, MapPin, Sparkles, Package, Star } from "lucide-react";
import { Navbar } from "@/components/tienda/navbar";
import { Footer } from "@/components/tienda/footer";
import { Container, SectionHeader } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/tienda/category-card";
import { ProductCard } from "@/components/tienda/product-card";
import { AmigurumiIcon } from "@/components/tienda/category-icons";
import { categories } from "@/data/categories";
import { getFeaturedProducts } from "@/data/products";

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 6);
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CategoriesSection />
        <FeaturedSection products={featured} />
        <AboutSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section id="inicio" className="pt-16 pb-24 relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <span className="font-display font-bold text-[28px] tracking-wider text-accent block leading-none">
              Pequeño taller — grandes detalles
            </span>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-[96px] leading-none text-foreground my-5">
              Hecho con <span className="inline-block -rotate-2 text-accent">manos</span>
              <br />y corazón
            </h1>
            <p className="text-lg text-foreground-soft max-w-[55ch]">
              Amigurumis tejidos uno por uno, patrones para que tú también
              crees, y agendas personalizadas con cariño. Cada pieza es única,
              así como tú.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild>
                <Link href="/catalogo">
                  Ver catálogo
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/sobre">Conocer la historia</Link>
              </Button>
            </div>
            <div className="flex gap-8 mt-12 flex-wrap" aria-label="Estadísticas del taller">
              {[
                { num: "+250", label: "Piezas creadas" },
                { num: "+180", label: "Clientes felices" },
                { num: "3", label: "Años tejiendo" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-5xl text-accent leading-none">
                    {s.num}
                  </div>
                  <div className="text-[13px] uppercase tracking-[1px] text-secondary mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-square rounded-3xl shadow-[var(--shadow-lg)] overflow-hidden grid place-items-center bg-gradient-to-br from-pastel-rose to-pastel-lavender">
            <div
              className="absolute w-[70%] h-[70%] rounded-full opacity-70"
              style={{
                background:
                  "radial-gradient(circle, var(--color-pastel-sage) 0%, transparent 70%)",
                top: "-10%",
                right: "-15%",
              }}
              aria-hidden
            />
            <div className="bg-bg-card rounded-2xl p-6 w-3/4 text-center shadow-[var(--shadow-md)] relative z-10">
              <div className="w-[120px] h-[120px] mx-auto mb-4 rounded-full bg-accent-soft grid place-items-center text-accent">
                <AmigurumiIcon className="w-16 h-16" strokeWidth={1.5} />
              </div>
              <div className="font-display text-4xl text-foreground leading-none">
                Pequeños tesoros
              </div>
              <div className="mt-2 text-foreground-soft text-sm">
                hechos con paciencia y cariño
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- CATEGORIES ---------------- */
function CategoriesSection() {
  return (
    <section id="categorias" className="bg-bg-card border-y border-border py-20">
      <Container>
        <SectionHeader
          eyebrow="Explora por categoría"
          title="¿Qué andas buscando?"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- FEATURED ---------------- */
function FeaturedSection({
  products,
}: {
  products: ReturnType<typeof getFeaturedProducts>;
}) {
  return (
    <section id="productos" className="py-20">
      <Container>
        <SectionHeader
          eyebrow="Recién salidos del taller"
          title="Lo más reciente"
          description="Productos disponibles ahora. Stock limitado — son piezas únicas."
        />
        <div className="flex justify-between items-end flex-wrap gap-4 mb-10">
          <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filtrar productos">
            <FilterPill active label="Todos" />
            <FilterPill label="Amigurumis" />
            <FilterPill label="Patrones" />
            <FilterPill label="Agendas" />
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-foreground-soft hover:text-foreground inline-flex items-center gap-1.5"
          >
            Ver todo el catálogo
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function FilterPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={!!active}
      className={
        active
          ? "px-5 py-2 rounded-full border-[1.5px] bg-foreground text-bg border-foreground text-sm font-medium min-h-10"
          : "px-5 py-2 rounded-full border-[1.5px] bg-bg-card text-foreground-soft border-border hover:border-secondary hover:text-foreground text-sm font-medium min-h-10 transition-colors"
      }
    >
      {label}
    </button>
  );
}

/* ---------------- ABOUT ---------------- */
function AboutSection() {
  const feats = [
    { Icon: Heart, title: "Hecho a mano", desc: "Cada pieza es única, tejida una a una" },
    { Icon: MapPin, title: "Envíos a todo el país", desc: "Despacho cuidado por Starken o Chilexpress" },
    { Icon: Sparkles, title: "Materiales suaves", desc: "Algodón e hilos hipoalergénicos" },
    { Icon: Package, title: "Personalizable", desc: "Dime tu idea y la hacemos posible" },
  ];
  return (
    <section id="sobre" className="bg-gradient-to-b from-bg to-muted py-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[var(--shadow-lg)] grid place-items-center bg-pastel-sage text-pastel-sage-deep">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[120px] h-[120px]"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div className="absolute top-8 right-8 bg-bg-card px-4 py-2.5 rounded-2xl font-display text-3xl text-accent shadow-[var(--shadow-md)] -rotate-3">
              Tejido a mano
            </div>
            <div className="absolute bottom-8 left-8 bg-bg-card px-4 py-2.5 rounded-2xl font-display text-3xl text-pastel-lavender-deep shadow-[var(--shadow-md)] rotate-3">
              Con amor desde 2022
            </div>
          </div>

          <div>
            <span className="font-display text-[28px] tracking-wider text-accent block leading-none">
              Hola, soy Melanie
            </span>
            <h2 className="font-display text-5xl md:text-6xl text-foreground leading-none my-5">
              Cada pieza<br />tiene una historia
            </h2>
            <p className="text-foreground-soft text-[17px] mb-4">
              Empecé tejiendo amigurumis para regalar a mi familia y, sin darme
              cuenta, mi pasatiempo se convirtió en un pequeño taller donde
              cada puntada lleva tiempo, paciencia y mucho cariño.
            </p>
            <p className="text-foreground-soft text-[17px]">
              Hoy comparto contigo lo que más me gusta hacer: piezas únicas,
              patrones para que tú también te animes a crear, y agendas
              personalizadas que cuentan tu propia historia.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {feats.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-5 bg-bg-card rounded-2xl border border-border"
                >
                  <div className="w-10 h-10 bg-accent-soft text-accent rounded-xl grid place-items-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-foreground">{title}</div>
                  <div className="text-sm text-foreground-soft mt-1">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Camila R.",
      loc: "Santiago",
      initial: "C",
      quote:
        "El conejito que me llegó es hermoso, mucho más bonito que en las fotos. Se nota el cariño en cada detalle.",
    },
    {
      name: "Valentina M.",
      loc: "Valparaíso",
      initial: "V",
      quote:
        "Compré el patrón del osito y son las instrucciones más claras que he visto. Logré terminar mi primer amigurumi gracias a Melanie.",
    },
    {
      name: "Javiera P.",
      loc: "Concepción",
      initial: "J",
      quote:
        "Mi agenda personalizada quedó increíble, justo como la pedí. La entrega fue rapidísima y muy bien empaquetada.",
    },
  ];
  return (
    <section className="py-20">
      <Container>
        <SectionHeader eyebrow="Lo que dicen" title="Cariño de clientes reales" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-bg-card rounded-2xl p-7 border border-border"
            >
              <div className="flex gap-0.5 text-accent mb-3" aria-label="5 de 5 estrellas">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-pastel-lavender text-pastel-lavender-deep font-display text-2xl grid place-items-center">
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-[13px] text-secondary">{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTASection() {
  return (
    <section className="py-24">
      <Container>
        <div className="bg-gradient-to-br from-pastel-rose to-accent-soft rounded-3xl px-8 py-16 text-center shadow-[var(--shadow-md)] relative overflow-hidden">
          <span className="font-display text-[28px] tracking-wider text-accent block leading-none">
            No te pierdas las novedades
          </span>
          <h2 className="font-display text-5xl md:text-6xl text-foreground leading-none my-4">
            Sé el primero en saber
          </h2>
          <p className="text-foreground-soft text-lg max-w-[50ch] mx-auto mb-8">
            Suscríbete y recibe avisos cuando agregue nuevos amigurumis, patrones
            o promos pequeñitas.
          </p>
          <form className="flex gap-2 max-w-[480px] mx-auto flex-wrap justify-center">
            <label htmlFor="email-cta" className="sr-only">
              Email
            </label>
            <Input
              id="email-cta"
              type="email"
              placeholder="tu@correo.com"
              required
              className="flex-1 min-w-[240px]"
            />
            <Button type="submit">Suscribirme</Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
