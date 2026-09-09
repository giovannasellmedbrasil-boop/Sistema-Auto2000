import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import type { MarketStats } from "@/lib/pricing/types";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "lucide-react";

export interface PricingRow {
  vehicle: Pick<Vehicle, "id" | "brand" | "model" | "version" | "modelYear" | "price">;
  fipeValue: number | null;
  marketStats: MarketStats | null;
}

function diffLabel(current: number, reference: number | null) {
  if (reference == null || reference === 0) return "—";
  const percent = Math.round(((current - reference) / reference) * 100);
  const sign = percent > 0 ? "+" : "";
  const tone = percent > 3 ? "text-danger-500" : percent < -3 ? "text-blue-400" : "text-success-500";
  return <span className={tone}>{sign}{percent}%</span>;
}

export function PricingTable({ rows }: { rows: PricingRow[] }) {
  if (rows.length === 0) {
    return <EmptyState icon={Tag} title="Nenhum veículo no estoque" />;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-600">
            <th className="px-4 py-3">Veículo</th>
            <th className="px-4 py-3">Preço da loja</th>
            <th className="px-4 py-3">FIPE</th>
            <th className="px-4 py-3">vs. FIPE</th>
            <th className="px-4 py-3">Preço médio observado</th>
            <th className="px-4 py-3">vs. mercado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ vehicle, fipeValue, marketStats }) => (
            <tr key={vehicle.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
              <td className="px-4 py-3">
                <Link href={`/admin/precificacao/${vehicle.id}`} className="font-medium text-accent-400 hover:underline">
                  {vehicle.brand} {vehicle.model} {vehicle.version} {vehicle.modelYear}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-800">{formatCurrency(vehicle.price)}</td>
              <td className="px-4 py-3 text-ink-700">{fipeValue != null ? formatCurrency(fipeValue) : "—"}</td>
              <td className="px-4 py-3">{diffLabel(vehicle.price, fipeValue)}</td>
              <td className="px-4 py-3 text-ink-700">{marketStats ? formatCurrency(marketStats.avg) : "—"}</td>
              <td className="px-4 py-3">{diffLabel(vehicle.price, marketStats?.avg ?? null)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
