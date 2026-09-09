import { Flame, TriangleAlert } from "lucide-react";
import type { StockDemandRow } from "@/lib/server/dashboard";

export function StockDemandTable({ rows }: { rows: StockDemandRow[] }) {
  if (rows.length === 0) {
    return <div className="flex h-24 items-center justify-center text-sm text-ink-500">Sem consultas de veículo neste período.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
            <th className="px-4 py-3 font-medium">Veículo</th>
            <th className="px-4 py-3 font-medium">Leads</th>
            <th className="px-4 py-3 font-medium">Visitas</th>
            <th className="px-4 py-3 font-medium">Propostas</th>
            <th className="px-4 py-3 font-medium">Vendas</th>
            <th className="px-4 py-3 font-medium">Estoque disponível</th>
            <th className="px-4 py-3 font-medium">Alerta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
              <td className="px-4 py-3">
                <div className="font-medium text-ink-900">
                  {row.brand} {row.model}
                </div>
                <div className="text-xs text-ink-600">{row.version}</div>
              </td>
              <td className="px-4 py-3 text-ink-700">{row.leads}</td>
              <td className="px-4 py-3 text-ink-700">{row.visits}</td>
              <td className="px-4 py-3 text-ink-700">{row.proposals}</td>
              <td className="px-4 py-3 text-ink-700">{row.sales}</td>
              <td className="px-4 py-3 text-ink-700">{row.stockAvailable} unidade(s)</td>
              <td className="px-4 py-3">
                {row.tag === "hot" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-500">
                    <Flame className="h-3.5 w-3.5" /> Alta procura
                  </span>
                )}
                {row.tag === "low_stock" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger-500">
                    <TriangleAlert className="h-3.5 w-3.5" /> Estoque baixo
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
