import { formatCurrency } from "@/lib/utils";
import type { CampaignRow } from "@/lib/server/dashboard";

export function CampaignTable({ rows }: { rows: CampaignRow[] }) {
  if (rows.length === 0) {
    return <div className="flex h-24 items-center justify-center text-sm text-ink-500">Nenhuma campanha encontrada.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
      <table className="w-full min-w-[1040px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
            <th className="px-4 py-3 font-medium">Campanha</th>
            <th className="px-4 py-3 font-medium">Plataforma</th>
            <th className="px-4 py-3 font-medium">Investimento</th>
            <th className="px-4 py-3 font-medium">Impressões</th>
            <th className="px-4 py-3 font-medium">Cliques</th>
            <th className="px-4 py-3 font-medium">Leads</th>
            <th className="px-4 py-3 font-medium">CPL</th>
            <th className="px-4 py-3 font-medium">Visitas</th>
            <th className="px-4 py-3 font-medium">Propostas</th>
            <th className="px-4 py-3 font-medium">Vendas</th>
            <th className="px-4 py-3 font-medium">CAC</th>
            <th className="px-4 py-3 font-medium">Receita</th>
            <th className="px-4 py-3 font-medium">ROAS</th>
            <th className="px-4 py-3 font-medium">ROI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
              <td className="px-4 py-3 font-medium text-ink-900">{row.name}</td>
              <td className="px-4 py-3 text-ink-700">{row.platform}</td>
              <td className="px-4 py-3 text-ink-700">{formatCurrency(row.investment)}</td>
              <td className="px-4 py-3 text-ink-700">{row.impressions != null ? row.impressions.toLocaleString("pt-BR") : "—"}</td>
              <td className="px-4 py-3 text-ink-700">{row.clicks != null ? row.clicks.toLocaleString("pt-BR") : "—"}</td>
              <td className="px-4 py-3 text-ink-700">{row.leads}</td>
              <td className="px-4 py-3 text-ink-700">{row.cpl != null ? formatCurrency(row.cpl) : "—"}</td>
              <td className="px-4 py-3 text-ink-700">{row.visits}</td>
              <td className="px-4 py-3 text-ink-700">{row.proposals}</td>
              <td className="px-4 py-3 text-ink-700">{row.sales}</td>
              <td className="px-4 py-3 text-ink-700">{row.cac != null ? formatCurrency(row.cac) : "—"}</td>
              <td className="px-4 py-3 text-ink-700">{formatCurrency(row.revenue)}</td>
              <td className="px-4 py-3 text-ink-700">{row.roas != null ? `${row.roas}x` : "—"}</td>
              <td className={`px-4 py-3 font-medium ${row.roiPct != null && row.roiPct >= 0 ? "text-success-600" : "text-ink-700"}`}>
                {row.roiPct != null ? `${row.roiPct}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
