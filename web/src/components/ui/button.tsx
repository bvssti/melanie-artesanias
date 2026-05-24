import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-[var(--ease-soft)] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-3 focus-visible:outline-accent focus-visible:outline-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white shadow-[var(--shadow-md)] hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] active:translate-y-0",
        secondary:
          "bg-bg-card text-foreground border border-border hover:bg-muted hover:border-secondary",
        ghost: "text-foreground-soft hover:bg-muted hover:text-foreground",
        outline:
          "border border-foreground text-foreground hover:bg-foreground hover:text-bg",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-full",
        md: "h-12 px-6 text-[15px] rounded-full",
        lg: "h-14 px-8 text-base rounded-full",
        icon: "h-11 w-11 rounded-full",
        iconSm: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
