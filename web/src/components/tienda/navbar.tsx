"use client";

import Link from "next/link";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { CartDrawer } from "./cart-drawer";
import { Container } from "@/components/ui/container";
import { useCart, useCartCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/catalogo/amigurumis", label: "Amigurumis" },
  { href: "/catalogo/patrones", label: "Patrones" },
  { href: "/catalogo/agendas", label: "Agendas" },
  { href: "/sobre", label: "Sobre Melanie" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartCount();
  const openCart = useCart((s) => s.setOpen);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/85 border-b border-border">
        <Container>
          <div className="flex items-center justify-between h-[72px]">
            <Logo />

            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Navegación principal"
            >
              {links.slice(0, 4).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-full text-sm font-medium text-foreground-soft hover:text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/sobre"
                className="px-4 py-2 rounded-full text-sm font-medium text-foreground-soft hover:text-foreground hover:bg-muted transition-colors"
              >
                Sobre Melanie
              </Link>
            </nav>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Buscar"
                className="w-11 h-11 grid place-items-center rounded-full text-foreground hover:bg-muted transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => openCart(true)}
                aria-label={`Carrito${cartCount ? ` (${cartCount} ${cartCount === 1 ? "producto" : "productos"})` : ""}`}
                className="w-11 h-11 grid place-items-center rounded-full text-foreground hover:bg-muted transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-accent text-white text-[11px] font-bold min-w-[18px] h-[18px] px-1.5 rounded-full grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden w-11 h-11 grid place-items-center rounded-full text-foreground hover:bg-muted transition-colors"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div
            className={cn(
              "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300",
              mobileOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
            )}
          >
            <nav className="flex flex-col gap-1 py-2" aria-label="Navegación móvil">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-2xl text-base font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </header>

      <CartDrawer />
    </>
  );
}
