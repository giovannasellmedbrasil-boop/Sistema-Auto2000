import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        action ? "sm:flex-row sm:items-end sm:justify-between sm:text-left" : "",
        className
      )}
    >
      <div className={cn("flex flex-col gap-3", align === "center" && !action ? "items-center" : "items-start")}>
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-400">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-accent-400">{title}</h2>
        {subtitle && <p className="max-w-2xl text-base text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
