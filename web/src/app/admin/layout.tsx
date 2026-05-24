import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Package, ShoppingBag, LayoutDashboard, Home } from "lucide-react";
import {
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { logout } from "./actions";
import { SetupRequired } from "./setup-required";

export const metadata = {
  title: "Admin — Artesanías Melanie",
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", Icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ShoppingBag },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirige si no hay sesión (excepto en /admin/login)
  if (!user) {
    // El layout se aplica también a /admin/login, pero ahí la página
    // muestra el form y no requiere user. Renderizamos directo el children
    // y dejamos que login/page.tsx decida.
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-muted/40">
      <aside className="hidden md:flex w-64 bg-bg-card border-r border-border flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="block">
            <div className="font-display text-3xl text-foreground leading-none">
              Melanie
            </div>
            <div className="text-xs text-secondary uppercase tracking-wider mt-1">
              Panel admin
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1" aria-label="Admin">
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-foreground-soft hover:bg-muted hover:text-foreground transition-colors font-medium text-sm"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-foreground-soft hover:bg-muted hover:text-foreground transition-colors font-medium text-sm"
          >
            <Home className="w-4 h-4" />
            Ver tienda
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-foreground-soft hover:bg-pastel-rose/40 hover:text-destructive transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
          <div className="text-xs text-secondary px-3 pt-2 truncate">
            {user.email}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="md:hidden bg-bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
          <Link href="/admin" className="font-display text-2xl text-foreground">
            Melanie · Admin
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-foreground-soft hover:text-destructive inline-flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </form>
        </div>
        <div className="p-6 md:p-10 max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
