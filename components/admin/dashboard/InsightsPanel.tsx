import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function InsightsPanel({ insights }: { insights: string[] }) {
  if (insights.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Sem insights para este período"
        description="Ajuste os filtros ou selecione um período com mais atividade para gerar observações automáticas."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {insights.map((insight, i) => (
        <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-ink-800">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
          {insight}
        </div>
      ))}
      <p className="mt-1 text-[11px] text-ink-600">
        Gerado automaticamente a partir dos dados do período (regras estatísticas) — não usa IA generativa.
      </p>
    </div>
  );
}
