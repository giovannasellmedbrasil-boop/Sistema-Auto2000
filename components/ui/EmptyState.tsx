import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-accent-400">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h3 className="text-base font-semibold text-accent-400">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}
