"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "../../actions";
import type { OrderStatus } from "@/lib/supabase/types";

const options: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "preparing", label: "Preparando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "refunded", label: "Reembolsado" },
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as OrderStatus;
    start(async () => {
      const result = await updateOrderStatus(orderId, value);
      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <select
      defaultValue={status}
      onChange={onChange}
      disabled={pending}
      aria-label="Cambiar estado del pedido"
      className="h-12 rounded-full border border-border bg-bg-card px-5 text-sm font-medium focus:outline-3 focus:outline-accent focus:outline-offset-2 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
