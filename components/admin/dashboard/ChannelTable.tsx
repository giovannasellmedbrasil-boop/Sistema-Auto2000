import { formatCurrency } from "@/lib/utils";
import type { ChannelRow } from "@/lib/server/dashboard";

export function ChannelTable({ rows }: { rows: ChannelRow[] }) {
  if (rows.length === 0) {
    return <div className="flex h-24 items-center justify-center text-sm text-ink-500">Sem leads neste período.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
            <th className="px-4 py-3 font-medium">Canal</th>
            <th className="px-4 py-3 font-medium">Leads</th>
            <th className="px-4 py-3 font-medium">Propostas</th>
            <th className="px-4 py-3 font-medium">Vendas</th>
            <th className="px-4 py-3 font-medium">Conversão</th>
            <th className="px-4 py-3 font-medium">Investimento</th>
            <th className="px-4 py-3 font-medium">CPL</th>
            <th className="px-4 py-3 font-medium">CAC</th>
            <th className="px-4 py-3 font-medium">Receita</th>
            <th className="px-4 py-3 font-medium">ROI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.channel} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
              <td className="px-4 py-3 font-medium text-ink-900">{row.label}</td>
              <td className="px-4 py-3 text-ink-700">{row.leads}</td>
              <td className="px-4 py-3 text-ink-700">{row.proposals}</td>
              <td className="px-4 py-3 text-ink-700">{row.sales}</td>
              <td className="px-4 py-3 text-ink-700">{row.conversionPct != null ? `${row.conversionPct}%` : "—"}</td>
              <td className="px-4 py-3 text-ink-700">{row.investment > 0 ? formatCurrency(row.investment) : "—"}</td>
              <td className="px-4 py-3 text-ink-700">{row.cpl != null ? formatCurrency(row.cpl) : "—"}</td>
              <td className="px-4 py-3 text-ink-700">{row.cac != null ? formatCurrency(row.cac) : "—"}</td>
              <td className="px-4 py-3 text-ink-700">{formatCurrency(row.revenue)}</td>
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
