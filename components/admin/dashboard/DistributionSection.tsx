"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { DistributionRow } from "@/lib/server/dashboard";

type Dimension = "brand" | "model" | "priceRange" | "bodyType" | "salesperson" | "channel";

const DIMENSION_LABELS: Record<Dimension, string> = {
  brand: "Marca",
  model: "Modelo",
  priceRange: "Faixa de preço",
  bodyType: "Tipo de veículo",
  salesperson: "Vendedor",
  channel: "Origem",
};

export function DistributionSection({ distribution }: { distribution: Record<Dimension, DistributionRow[]> }) {
  const [dimension, setDimension] = useState<Dimension>("brand");
  const rows = distribution[dimension].slice(0, 8);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(DIMENSION_LABELS) as Dimension[]).map((d) => (
          <button
            key={d}
            onClick={() => setDimension(d)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              dimension === d ? "bg-accent-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {DIMENSION_LABELS[d]}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-ink-500">Sem vendas neste período.</div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="label" type="category" width={110} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                formatter={(value: number, name: string) => [name === "count" ? `${value} venda(s)` : formatCurrency(value), ""]}
              />
              <Bar dataKey="count" fill="#FFB000" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
