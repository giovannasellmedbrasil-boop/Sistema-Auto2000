import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card bg-ink-100 border border-white/8 shadow-[var(--shadow-card)] transition-shadow duration-300",
        className
      )}
      {...props}
    />
  );
}
