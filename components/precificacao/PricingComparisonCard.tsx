import { Card } from "@/components/ui/Card";
import type { FipeQuote } from "@/lib/types";
import type { MarketStats } from "@/lib/pricing/types";
import { formatCurrency } from "@/lib/utils";

function DiffBadge({ percent }: { percent: number }) {
  const rounded = Math.round(percent);
  const tone = rounded > 3 ? "text-danger-500" : rounded < -3 ? "text-blue-400" : "text-success-500";
  const sign = rounded > 0 ? "+" : "";
  return <span className={tone}>{sign}{rounded}%</span>;
}

export function PricingComparisonCard({
  currentPrice,
  fipeQuote,
  marketStats,
}: {
  currentPrice: number;
  fipeQuote: FipeQuote | null;
  marketStats: MarketStats | null;
}) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <h3 className="text-base font-semibold text-accent-400">Comparativo de preço</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <span className="block text-xs text-ink-500">Preço da loja</span>
          <span className="text-lg font-semibold text-ink-900">{formatCurrency(currentPrice)}</span>
        </div>
        <div>
          <span className="block text-xs text-ink-500">Tabela FIPE</span>
          {fipeQuote ? (
            <>
              <span className="text-lg font-semibold text-ink-900">{formatCurrency(fipeQuote.value)}</span>
              <span className="ml-2 text-sm">
                <DiffBadge percent={((currentPrice - fipeQuote.value) / fipeQuote.value) * 100} />
              </span>
              <span className="block text-xs text-ink-500">ref. {fipeQuote.referenceMonth}</span>
            </>
          ) : (
            <span className="text-sm text-ink-500">Não vinculado ainda</span>
          )}
        </div>
        <div>
          <span className="block text-xs text-ink-500">Preço médio observado</span>
          {marketStats ? (
            <>
              <span className="text-lg font-semibold text-ink-900">{formatCurrency(marketStats.avg)}</span>
              <span className="ml-2 text-sm">
                <DiffBadge percent={((currentPrice - marketStats.avg) / marketStats.avg) * 100} />
              </span>
              <span className="block text-xs text-ink-500">
                {marketStats.count} amostra(s) · {formatCurrency(marketStats.min)}–{formatCurrency(marketStats.max)}
              </span>
            </>
          ) : (
            <span className="text-sm text-ink-500">Sem amostras registradas</span>
          )}
        </div>
      </div>
    </Card>
  );
}
