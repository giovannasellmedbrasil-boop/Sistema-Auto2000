import { AlertTriangle } from "lucide-react";
import type { FunnelStage } from "@/lib/server/dashboard";

export function FunnelChart({
  stages,
  bottleneck,
}: {
  stages: FunnelStage[];
  bottleneck: { fromLabel: string; toLabel: string; conversionPct: number | null } | null;
}) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {stages.map((stage, i) => {
        const widthPct = Math.max((stage.count / max) * 100, 4);
        return (
          <div key={stage.key} className="flex items-center gap-4">
            <div className="w-36 shrink-0 text-right text-xs font-medium text-ink-600">{stage.label}</div>
            <div className="relative h-9 flex-1 rounded-lg bg-white/5">
              <div
                className="flex h-9 items-center justify-end rounded-lg bg-gradient-to-r from-accent-500/70 to-accent-500 px-3 text-sm font-semibold text-black transition-all"
                style={{ width: `${widthPct}%` }}
              >
                {stage.count}
              </div>
            </div>
            <div className="w-20 shrink-0 text-xs text-ink-500">
              {i > 0 && stage.conversionFromPrev != null ? `${stage.conversionFromPrev}% conv.` : ""}
            </div>
          </div>
        );
      })}

      {bottleneck && bottleneck.conversionPct != null && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-sm text-warning-500">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          Maior gargalo: {bottleneck.fromLabel} → {bottleneck.toLabel} ({bottleneck.conversionPct}% de conversão)
        </div>
      )}
    </div>
  );
}
