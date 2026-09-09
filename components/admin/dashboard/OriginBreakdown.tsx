import type { DashboardData } from "@/lib/server/dashboard";

export function OriginBreakdown({ rows }: { rows: DashboardData["originBreakdown"] }) {
  if (rows.length === 0) {
    return <div className="flex h-24 items-center justify-center text-sm text-ink-500">Sem leads neste período.</div>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.channel} className="flex items-center gap-3">
          <div className="w-32 shrink-0 truncate text-sm text-ink-800">{row.label}</div>
          <div className="relative h-6 flex-1 rounded-full bg-white/5">
            <div className="h-6 rounded-full bg-accent-500/80" style={{ width: `${row.pct ?? 0}%` }} />
          </div>
          <div className="w-14 shrink-0 text-right text-xs text-ink-600">{row.pct ?? 0}%</div>
          <div className="w-24 shrink-0 text-right text-xs text-ink-500">
            {row.count} leads · {row.sales} vendas
          </div>
        </div>
      ))}
    </div>
  );
}
