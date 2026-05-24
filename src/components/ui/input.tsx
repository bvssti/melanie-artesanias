import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-12 w-full rounded-full border border-border bg-bg-card px-5 text-[15px] text-foreground placeholder:text-secondary",
      "focus:outline-3 focus:outline-accent focus:outline-offset-2 focus:border-accent",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "transition-colors",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-2xl border border-border bg-bg-card px-5 py-4 text-[15px] text-foreground placeholder:text-secondary",
      "focus:outline-3 focus:outline-accent focus:outline-offset-2 focus:border-accent",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "transition-colors resize-y",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
