import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCLP } from "@/lib/utils";
import { OrderStatusSelect } from "./status-select";

export const metadata = {
  title: "Pedido — Admin",
  robots: { index: false, follow: false },
};

export default async function PedidoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = createServiceClient();
  const [orderRes, itemsRes] = await Promise.all([
    service.from("orders").select("*").eq("id", id).maybeSingle(),
    service
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!orderRes.data) notFound();
  const order = orderRes.data;
  const items = itemsRes.data ?? [];

  return (
    <>
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-soft hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Pedidos
      </Link>

      <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-5xl text-foreground leading-none">
            Pedido #{order.order_number}
          </h1>
          <p className="text-foreground-soft mt-2">
            {new Date(order.created_at).toLocaleString("es-CL")}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
          <header className="p-5 border-b border-border">
            <h2 className="font-display text-3xl leading-none">Productos</h2>
          </header>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="p-5 flex justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{item.product_name}</div>
                  <div className="text-xs text-secondary">
                    {item.product_type === "digital" ? "PDF · " : ""}
                    {formatCLP(item.unit_price)} × {item.quantity}
                  </div>
                </div>
                <div className="font-semibold tabular-nums whitespace-nowrap">
                  {formatCLP(item.total)}
                </div>
              </li>
            ))}
          </ul>
          <div className="p-5 border-t border-border bg-muted/40 space-y-2">
            <div className="flex justify-between text-sm text-foreground-soft">
              <span>Subtotal</span>
              <span>{formatCLP(order.subtotal)}</span>
            </div>
            {order.shipping_cost > 0 && (
              <div className="flex justify-between text-sm text-foreground-soft">
                <span>Envío</span>
                <span>{formatCLP(order.shipping_cost)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-display text-3xl text-foreground leading-none">
                {formatCLP(order.total)}
              </span>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h2 className="font-display text-2xl leading-none mb-3">Cliente</h2>
            <dl className="text-sm space-y-2">
              <Item label="Nombre" value={order.customer_name} />
              <Item label="Email" value={order.customer_email} />
              <Item label="Teléfono" value={order.customer_phone} />
              {order.customer_rut && <Item label="RUT" value={order.customer_rut} />}
            </dl>
          </div>

          {(order.shipping_address || order.shipping_city) && (
            <div className="bg-bg-card border border-border rounded-2xl p-5">
              <h2 className="font-display text-2xl leading-none mb-3">Envío</h2>
              <dl className="text-sm space-y-2">
                {order.shipping_address && (
                  <Item label="Dirección" value={order.shipping_address} />
                )}
                {order.shipping_city && (
                  <Item label="Ciudad" value={order.shipping_city} />
                )}
                {order.shipping_region && (
                  <Item label="Región" value={order.shipping_region} />
                )}
              </dl>
            </div>
          )}

          {order.notes && (
            <div className="bg-bg-card border border-border rounded-2xl p-5">
              <h2 className="font-display text-2xl leading-none mb-3">
                Notas del cliente
              </h2>
              <p className="text-sm text-foreground-soft whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}

          {order.mp_payment_id && (
            <div className="bg-bg-card border border-border rounded-2xl p-5">
              <h2 className="font-display text-2xl leading-none mb-3">
                Mercado Pago
              </h2>
              <dl className="text-sm space-y-2">
                <Item label="Payment ID" value={order.mp_payment_id} />
                {order.mp_status && <Item label="Estado MP" value={order.mp_status} />}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-secondary">{label}</dt>
      <dd className="text-right text-foreground break-all">{value}</dd>
    </div>
  );
}
