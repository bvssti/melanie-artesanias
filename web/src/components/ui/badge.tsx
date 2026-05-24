import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide rounded-full",
  {
    variants: {
      variant: {
        default: "bg-bg-card text-foreground shadow-[var(--shadow-sm)]",
        accent: "bg-accent-soft text-accent",
        rose: "bg-pastel-rose text-pastel-rose-deep",
        sage: "bg-pastel-sage text-pastel-sage-deep",
        lavender: "bg-pastel-lavender text-pastel-lavender-deep",
        outline: "border border-border bg-bg-card text-foreground-soft",
        success: "bg-pastel-sage text-pastel-sage-deep",
        warning: "bg-accent-soft text-accent",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-[11px]",
        lg: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
