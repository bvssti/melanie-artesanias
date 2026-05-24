import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCLP } from "@/lib/utils";

export const metadata = {
  title: "Pedidos — Admin",
  robots: { index: false, follow: false },
};

async function getOrders() {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_email, total, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { orders: [], error: error.message };
    return { orders: data ?? [], error: null as string | null };
  } catch (e) {
    return {
      orders: [],
      error: e instanceof Error ? e.message : "Error desconocido",
    };
  }
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

export default async function AdminPedidos() {
  const { orders, error } = await getOrders();

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-5xl text-foreground leading-none">
          Pedidos
        </h1>
        <p className="text-foreground-soft mt-2">
          Aquí ves los últimos 100 pedidos de tu tienda.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-pastel-rose/40 border border-pastel-rose-deep/30 text-sm">
          Error al cargar pedidos: <strong>{error}</strong>
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-foreground-soft">
              <tr>
                <th className="text-left font-semibold px-4 py-3"># Orden</th>
                <th className="text-left font-semibold px-4 py-3">Cliente</th>
                <th className="text-left font-semibold px-4 py-3">Fecha</th>
                <th className="text-right font-semibold px-4 py-3">Total</th>
                <th className="text-center font-semibold px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-foreground-soft"
                  >
                    {error
                      ? "Conecta Supabase para ver tus pedidos."
                      : "Aún no hay pedidos."}
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const s = statusLabels[o.status] ?? {
                    label: o.status,
                    color: "bg-muted text-foreground",
                  };
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link
                          href={`/admin/pedidos/${o.id}`}
                          className="hover:text-accent font-semibold"
                        >
                          #{o.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name}</div>
                        <div className="text-xs text-secondary">
                          {o.customer_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground-soft text-xs">
                        {new Date(o.created_at).toLocaleString("es-CL")}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {formatCLP(o.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${s.color}`}
                        >
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
