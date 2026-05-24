import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full max-w-[1200px] mx-auto px-6 md:px-8",
        className
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center mb-14", className)}>
      {eyebrow && (
        <span className="font-display text-[28px] tracking-wider text-accent block mb-2 leading-none">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-5xl md:text-6xl text-foreground leading-none">
        {title}
      </h2>
      {description && (
        <p className="text-foreground-soft text-lg mt-4 max-w-[60ch] mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
