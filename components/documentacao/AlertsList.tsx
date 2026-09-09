import { AlertTriangle, CheckCircle2, Clock, Info } from "lucide-react";
import type { AlertTone, NegotiationAlert } from "@/lib/server/documentChecklist";
import { cn } from "@/lib/utils";

const ICONS: Record<AlertTone, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: Clock,
  info: Info,
  success: CheckCircle2,
};

const COLORS: Record<AlertTone, string> = {
  critical: "text-danger-500",
  warning: "text-warning-500",
  info: "text-blue-400",
  success: "text-success-500",
};

export function AlertsList({ alerts }: { alerts: NegotiationAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert, i) => {
        const Icon = ICONS[alert.tone];
        return (
          <div key={i} className="flex items-center gap-2 text-sm">
            <Icon className={cn("h-4 w-4 shrink-0", COLORS[alert.tone])} />
            <span className="text-ink-700">{alert.message}</span>
          </div>
        );
      })}
    </div>
  );
}
