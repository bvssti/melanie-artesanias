import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login } from "../actions";

export const metadata = {
  title: "Acceso admin — Artesanías Melanie",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen grid place-items-center bg-muted/40 px-4">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="block text-center mb-8">
          <div className="font-display text-5xl text-foreground leading-none">
            Artesanías Melanie
          </div>
          <div className="text-xs text-secondary uppercase tracking-[1.5px] mt-1">
            Panel admin
          </div>
        </Link>
        <form
          action={login}
          className="bg-bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-md)]"
        >
          <h1 className="font-display text-4xl text-foreground leading-none mb-2">
            Hola Melanie
          </h1>
          <p className="text-foreground-soft text-sm mb-6">
            Ingresa para gestionar tu tienda.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 p-3 rounded-2xl bg-pastel-rose/40 border border-pastel-rose-deep/30 text-sm text-foreground"
            >
              {decodeURIComponent(error)}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-6">
            Entrar
          </Button>

          <p className="text-xs text-secondary text-center mt-5">
            ¿Olvidaste tu contraseña? Escríbeme y la reseteamos juntos.
          </p>
        </form>
      </div>
    </div>
  );
}
