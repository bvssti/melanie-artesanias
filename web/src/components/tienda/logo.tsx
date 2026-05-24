import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 group", className)}
      aria-label="Artesanías Melanie — Inicio"
    >
      <div className="w-10 h-10 rounded-full bg-accent-soft grid place-items-center text-accent transition-transform group-hover:scale-110">
        <Heart className="w-[22px] h-[22px]" strokeWidth={2} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display font-bold text-[30px] text-foreground">
          Artesanías Melanie
        </span>
        <span className="text-[11px] text-secondary uppercase tracking-[1px] mt-0.5">
          Hecho a mano
        </span>
      </div>
    </Link>
  );
}
