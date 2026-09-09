"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";
import type { SalespersonRow } from "@/lib/server/dashboard";

type SortKey = "sales" | "revenue" | "conversionPct" | "avgResponseMinutes" | "proposals";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "sales", label: "Vendas" },
  { key: "revenue", label: "Faturamento" },
  { key: "conversionPct", label: "Conversão" },
  { key: "avgResponseMinutes", label: "Velocidade" },
  { key: "proposals", label: "Propostas" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

export function SalespersonRanking({ rows }: { rows: SalespersonRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("sales");

  const sorted = [...rows].sort((a, b) => {
    if (sortKey === "avgResponseMinutes") {
      return (a.avgResponseMinutes ?? Infinity) - (b.avgResponseMinutes ?? Infinity);
    }
    return (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              sortKey === opt.key ? "bg-accent-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            Ordenar por {opt.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
              <th className="px-4 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Resposta média</th>
              <th className="px-4 py-3 font-medium">Visitas</th>
              <th className="px-4 py-3 font-medium">Test-drives</th>
              <th className="px-4 py-3 font-medium">Propostas</th>
              <th className="px-4 py-3 font-medium">Vendas</th>
              <th className="px-4 py-3 font-medium">Faturamento</th>
              <th className="px-4 py-3 font-medium">Ticket médio</th>
              <th className="px-4 py-3 font-medium">Conversão</th>
              <th className="px-4 py-3 font-medium">Meta</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={row.name} seed={row.photoSeed} size="sm" />
                    <div>
                      <div className="font-medium text-ink-900">
                        {sortKey === "sales" && i < 3 ? `${MEDALS[i]} ` : ""}
                        {row.name}
                      </div>
                      <div className="text-xs text-ink-600">{row.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {row.leadsReceived} <span className="text-xs text-ink-500">({row.leadsContacted} atendidos)</span>
                </td>
                <td className="px-4 py-3 text-ink-700">{row.avgResponseMinutes != null ? `${row.avgResponseMinutes} min` : "—"}</td>
                <td className="px-4 py-3 text-ink-700">{row.visits}</td>
                <td className="px-4 py-3 text-ink-700">{row.testDrives}</td>
                <td className="px-4 py-3 text-ink-700">{row.proposals}</td>
                <td className="px-4 py-3 font-medium text-ink-900">{row.sales}</td>
                <td className="px-4 py-3 text-ink-700">{formatCurrency(row.revenue)}</td>
                <td className="px-4 py-3 text-ink-700">{row.avgTicket != null ? formatCurrency(row.avgTicket) : "—"}</td>
                <td className="px-4 py-3 text-ink-700">{row.conversionPct != null ? `${row.conversionPct}%` : "—"}</td>
                <td className="px-4 py-3 text-ink-700">
                  {row.goalPct != null ? `${row.goalPct}%` : "—"} <span className="text-xs text-ink-500">de {row.goalUnits}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
