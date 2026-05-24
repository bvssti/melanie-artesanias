import Link from "next/link";
import { Settings, ExternalLink } from "lucide-react";

export function SetupRequired() {
  return (
    <div className="min-h-screen grid place-items-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-[560px] bg-bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-md)]">
        <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent grid place-items-center mb-5">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="font-display text-5xl text-foreground leading-none">
          Falta configurar Supabase
        </h1>
        <p className="text-foreground-soft mt-3 leading-relaxed">
          El panel admin requiere conexión a Supabase para login y gestión de
          productos/pedidos. Aún no agregas las credenciales en{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
            .env.local
          </code>
          .
        </p>

        <ol className="mt-6 space-y-3 text-sm">
          <Step n={1}>
            Crea un proyecto gratuito en{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              supabase.com <ExternalLink className="w-3 h-3" />
            </a>
          </Step>
          <Step n={2}>
            Corre el SQL de{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded">
              src/lib/supabase/schema.sql
            </code>{" "}
            en el SQL Editor
          </Step>
          <Step n={3}>
            Copia las claves de Settings → API y pégalas en{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded">.env.local</code>
          </Step>
          <Step n={4}>
            Reinicia el dev server (<code className="bg-muted px-1.5 py-0.5 rounded">npm run dev</code>)
          </Step>
        </ol>

        <div className="mt-6 p-4 rounded-2xl bg-muted/60 text-xs text-foreground-soft">
          Pasos detallados en{" "}
          <code className="bg-bg-card border border-border px-1.5 py-0.5 rounded">
            SETUP.md
          </code>{" "}
          en la raíz del proyecto.
        </div>

        <Link
          href="/"
          className="inline-block mt-6 text-sm text-foreground-soft hover:text-foreground transition-colors"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-foreground text-bg text-xs font-bold grid place-items-center">
        {n}
      </span>
      <span className="text-foreground-soft pt-0.5">{children}</span>
    </li>
  );
}
