import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.6.1c-.9-.4-1.7-1-2.4-1.7s-1.3-1.5-1.7-2.4c-.1-.2-.1-.4.1-.5l.4-.5c.1-.1.2-.3.2-.5s.1-.3 0-.5-.6-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4S6 7.8 6 9.3s1.1 3 1.2 3.2c.1.2 2.1 3.3 5.2 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.4-.3-.7-.5zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.5.8 3.2 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.5 2h3.1c.2 1.5 1 2.8 2.2 3.7 1 .8 2.3 1.3 3.7 1.3v3.1c-1.5 0-2.9-.4-4.2-1v6.6c0 4-3.2 7.2-7.2 7.2S3 19.7 3 15.7s3.2-7.2 7.2-7.2v3.1c-2.3 0-4.1 1.9-4.1 4.1s1.9 4.1 4.1 4.1 4.1-1.9 4.1-4.1V2h-1.8z" />
    </svg>
  );
}

const sections = [
  {
    title: "Tienda",
    links: [
      { href: "/catalogo/amigurumis", label: "Amigurumis" },
      { href: "/catalogo/patrones", label: "Patrones" },
      { href: "/catalogo/agendas", label: "Agendas" },
      { href: "/catalogo", label: "Novedades" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/envios", label: "Envíos" },
      { href: "/cambios", label: "Cambios" },
      { href: "/faq", label: "Preguntas frecuentes" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { href: "/sobre", label: "La historia" },
      { href: "/taller", label: "El taller" },
      { href: "/materiales", label: "Materiales" },
      { href: "/terminos", label: "Términos" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-foreground text-[#E5E0D7] pt-16 pb-8 mt-24">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div>
            <div className="font-display text-3xl text-white leading-none">
              Artesanías Melanie
            </div>
            <div className="text-secondary text-xs uppercase tracking-[1px] mt-1">
              Hecho a mano · Con amor
            </div>
            <p className="mt-4 text-sm text-[#B8B0A3] max-w-[30ch]">
              Pequeño taller artesanal de amigurumis, patrones y agendas
              personalizadas.
            </p>
            <div className="flex gap-2.5 mt-5">
              <a
                href="https://wa.me/56900000000"
                className="w-10 h-10 rounded-full bg-white/5 grid place-items-center hover:bg-accent transition-colors"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href="https://instagram.com"
                className="w-10 h-10 rounded-full bg-white/5 grid place-items-center hover:bg-accent transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href="https://tiktok.com"
                className="w-10 h-10 rounded-full bg-white/5 grid place-items-center hover:bg-accent transition-colors"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TikTokIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href="mailto:hola@artesaniasmelanie.cl"
                className="w-10 h-10 rounded-full bg-white/5 grid place-items-center hover:bg-accent transition-colors"
                aria-label="Email"
              >
                <Mail className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <div className="font-bold text-white text-xs uppercase tracking-[1.5px] mb-4">
                {section.title}
              </div>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#B8B0A3] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap justify-between gap-4 text-xs text-[#8A8278]">
          <div>© {year} Artesanías Melanie. Todos los derechos reservados.</div>
          <div>Hecho con cariño en Chile</div>
        </div>
      </Container>
    </footer>
  );
}
