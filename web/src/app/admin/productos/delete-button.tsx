"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "../actions";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`))
      return;
    start(async () => {
      const result = await deleteProduct(id);
      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Eliminar ${name}`}
      className="w-8 h-8 grid place-items-center rounded-full text-foreground-soft hover:bg-pastel-rose/40 hover:text-destructive transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
