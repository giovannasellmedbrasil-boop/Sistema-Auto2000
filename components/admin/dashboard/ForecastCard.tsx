import type { DashboardData } from "@/lib/server/dashboard";

export function ForecastCard({ forecast }: { forecast: DashboardData["forecast"] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-ink-500">
        Estimativa baseada no pipeline aberto (propostas em andamento) e na taxa histórica de conversão — não é
        uma previsão de IA generativa, apenas uma projeção estatística sobre dados reais.
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] py-3">
          <div className="text-xl font-semibold text-ink-900">{forecast.conservative}</div>
          <div className="text-xs text-ink-500">Conservador</div>
        </div>
        <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 py-3">
          <div className="text-xl font-semibold text-accent-400">{forecast.likely}</div>
          <div className="text-xs text-ink-500">Provável</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] py-3">
          <div className="text-xl font-semibold text-ink-900">{forecast.optimistic}</div>
          <div className="text-xs text-ink-500">Otimista</div>
        </div>
      </div>
    </div>
  );
}
