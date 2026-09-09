import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeTone = "accent" | "success" | "warning" | "neutral" | "ink" | "danger" | "info";

const toneClasses: Record<BadgeTone, string> = {
  accent: "bg-accent-500 text-black",
  success: "bg-success-500 text-white",
  warning: "bg-warning-500 text-white",
  neutral: "bg-white/10 text-white/80",
  ink: "border border-white/25 text-white",
  danger: "bg-danger-500 text-white",
  info: "bg-blue-500 text-white",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
