import { cn } from "@/lib/utils";

export function ProgressBar({ percent, className }: { percent: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const color = clamped >= 100 ? "bg-success-500" : clamped >= 50 ? "bg-accent-500" : "bg-danger-500";

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div className={cn("h-full rounded-full transition-all duration-300", color)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
