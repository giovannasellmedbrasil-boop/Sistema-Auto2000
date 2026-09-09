import type { MarketStats } from "@/lib/pricing/types";

// Estatísticas reais sobre amostras de preço registradas manualmente pela
// loja — nunca inventa uma amostra, retorna `null` quando não há dados
// suficientes (mesma disciplina de getCreditDashboardMetrics em db.ts).
export function computeMarketStats(prices: number[]): MarketStats | null {
  if (prices.length === 0) return null;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: prices.reduce((sum, p) => sum + p, 0) / prices.length,
    median,
    count: prices.length,
  };
}
