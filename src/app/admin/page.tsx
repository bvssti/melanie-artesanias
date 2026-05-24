import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";
import { createServerSupabase, createServiceClient } from "@/lib/supabase/server";
import { formatCLP } from "@/lib/utils";

async function getStats() {
  try {
    const service = createServiceClient();
    const [productsRes, ordersRes, recentRes, lowStockRes] = await Promise.all([
      service.from("products").select("id", { count: "exact", head: true }),
      service
        .from("orders")
        .select("id, total, status", { count: "exact" })
        .eq("status", "paid"),
      service
        .from("orders")
        .select(
          "id, order_number, customer_name, total, status, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(5),
      service
        .from("products")
        .select("id, name, stock, type")
        .eq("type", "physical")
        .lte("stock", 2)
        .order("stock", { ascending: true })
        .limit(5),
    ]);

    const revenue =
      ordersRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;

    return {
      productsCount: productsRes.count ?? 0,
      paidOrdersCount: ordersRes.count ?? 0,
      revenue,
      recent: recentRes.data ?? [],
      lowStock: lowStockRes.data ?? [],
      error: null as string | null,
    };
  } catch (e) {
    return {
      productsCount: 0,
      paidOrdersCount: 0,
      revenue: 0,
      recent: [],
      lowStock: [],
      error: e instanceof Error ? e.message : "Error desconocido",
    };
  }
}

export default async function AdminDashboard() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const stats = await getStats();

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-5xl text-foreground leading-none">
          Hola Melanie
        </h1>
        <p className="text-foreground-soft mt-2">
          Este es el resumen de tu tienda hoy.
        </p>
      </header>

      {stats.error && (
        <div className="mb-6 p-4 rounded-2xl bg-pastel-rose/40 border border-pastel-rose-deep/30 text-sm">
          No se pudo conectar a Supabase: <strong>{stats.error}</strong>. Revisa
          las variables de entorno y que hayas corrido el schema SQL.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat
          Icon={Package}
          label="Productos"
          value={String(stats.productsCount)}
          accent="rose"
        />
        <Stat
          Icon={ShoppingBag}
          label="Pedidos pagados"
          value={String(stats.paidOrdersCount)}
          accent="sage"
        />
        <Stat
          Icon={TrendingUp}
          label="Ingresos"
          value={formatCLP(stats.revenue)}
          accent="lavender"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Últimos pedidos" link={{ href: "/admin/pedidos", label: "Ver todos" }}>
          {stats.recent.length === 0 ? (
            <Empty>Sin pedidos por ahora.</Empty>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {stats.recent.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between">
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="hover:text-accent transition-colors min-w-0"
                  >
                    <div className="font-medium truncate">
                      #{o.order_number} · {o.customer_name}
                    </div>
                    <div className="text-xs text-secondary">
                      {new Date(o.created_at).toLocaleString("es-CL")}
                    </div>
                  </Link>
                  <div className="text-right shrink-0 ml-4">
                    <div className="font-semibold">{formatCLP(o.total)}</div>
                    <StatusPill status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Stock bajo"
          link={{ href: "/admin/productos", label: "Gestionar" }}
        >
          {stats.lowStock.length === 0 ? (
            <Empty>Todo el stock está sano.</Empty>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {stats.lowStock.map((p) => (
                <li
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-2"
                >
                  <span className="truncate font-medium">{p.name}</span>
                  <span
                    className={
                      p.stock === 0
                        ? "text-destructive text-xs font-semibold uppercase inline-flex items-center gap-1"
                        : "text-accent text-xs font-semibold uppercase inline-flex items-center gap-1"
                    }
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {p.stock} restantes
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Stat({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "rose" | "sage" | "lavender";
}) {
  const bg = {
    rose: "bg-pastel-rose text-pastel-rose-deep",
    sage: "bg-pastel-sage text-pastel-sage-deep",
    lavender: "bg-pastel-lavender text-pastel-lavender-deep",
  }[accent];
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${bg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm text-foreground-soft">{label}</div>
      <div className="font-display text-4xl text-foreground leading-none mt-1">
        {value}
      </div>
    </div>
  );
}

function Card({
  title,
  link,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="bg-bg-card border border-border rounded-2xl p-5">
      <header className="flex items-center justify-between mb-3">
        <h2 className="font-display text-2xl text-foreground leading-none">
          {title}
        </h2>
        {link && (
          <Link
            href={link.href}
            className="text-xs font-semibold text-accent hover:underline"
          >
            {link.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-foreground-soft text-center py-6">
      {children}
    </div>
  );
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-pastel-lavender text-pastel-lavender-deep" },
  paid: { label: "Pagado", color: "bg-pastel-sage text-pastel-sage-deep" },
  preparing: { label: "Preparando", color: "bg-accent-soft text-accent" },
  shipped: { label: "Enviado", color: "bg-pastel-sage text-pastel-sage-deep" },
  delivered: { label: "Entregado", color: "bg-pastel-sage text-pastel-sage-deep" },
  cancelled: { label: "Cancelado", color: "bg-pastel-rose text-pastel-rose-deep" },
  refunded: { label: "Reembolsado", color: "bg-muted text-foreground-soft" },
};

function StatusPill({ status }: { status: string }) {
  const s = statusLabels[status] ?? { label: status, color: "bg-muted text-foreground" };
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${s.color}`}
    >
      {s.label}
    </span>
  );
}
