"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { SeriesPoint } from "@/lib/server/dashboard";
import { formatCurrency } from "@/lib/utils";

type ValueKind = "count" | "currency";

function formatValue(kind: ValueKind, value: number): string {
  return kind === "currency" ? formatCurrency(value) : `${value} venda(s)`;
}

export function TimeSeriesChart({ data, kind }: { data: SeriesPoint[]; kind: ValueKind }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-ink-500">Sem dados neste período.</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={0} />
          <Tooltip
            contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            formatter={(value: number, name: string) => [formatValue(kind, value), name === "current" ? "Período atual" : "Período anterior"]}
          />
          <Line type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.25)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="current" stroke="#FFB000" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
