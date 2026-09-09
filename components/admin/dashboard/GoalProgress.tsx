import { formatCurrency } from "@/lib/utils";
import type { DashboardData } from "@/lib/server/dashboard";

function Bar({ pct }: { pct: number | null }) {
  const clamped = Math.min(Math.max(pct ?? 0, 0), 100);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-3 rounded-full ${clamped >= 100 ? "bg-success-500" : "bg-accent-500"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function GoalProgress({ goals }: { goals: DashboardData["goals"] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-800">Meta de vendas do mês</span>
          <span className="text-sm text-ink-600">
            {goals.achievedUnits} / {goals.salesUnitsTarget} veículos
          </span>
        </div>
        <Bar pct={goals.salesPct} />
        <span className="text-xs text-ink-500">
          {goals.salesPct != null ? `${goals.salesPct}% atingido` : "—"}
          {goals.remainingUnits > 0 ? ` · Faltam ${goals.remainingUnits} venda(s) para atingir a meta.` : " · Meta atingida!"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-800">Meta de faturamento do mês</span>
          <span className="text-sm text-ink-600">
            {formatCurrency(goals.achievedRevenue)} / {formatCurrency(goals.revenueTarget)}
          </span>
        </div>
        <Bar pct={goals.revenuePct} />
        <span className="text-xs text-ink-500">{goals.revenuePct != null ? `${goals.revenuePct}% atingido` : "—"}</span>
      </div>
    </div>
  );
}
