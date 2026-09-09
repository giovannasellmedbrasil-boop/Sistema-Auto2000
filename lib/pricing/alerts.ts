// Central de alertas (seção 10) — gerada a partir dos veículos já
// enriquecidos, sem estado próprio (não é persistido; recalculada a cada
// carregamento da central, como o resto do motor de precificação).

import type { EnrichedVehicle, PricingAlert } from "@/lib/pricing/types";
import { formatCurrency } from "@/lib/utils";

export function computeAlerts(items: EnrichedVehicle[]): PricingAlert[] {
  const alerts: PricingAlert[] = [];

  for (const { vehicle, metrics, recommendation } of items) {
    const label = `${vehicle.brand} ${vehicle.model} ${vehicle.version}`;

    if (recommendation.marketPositionPercent > 5) {
      alerts.push({
        id: `above_${vehicle.id}`,
        kind: "ABOVE_MARKET",
        severity: recommendation.marketPositionPercent > 10 ? "danger" : "warning",
        vehicleId: vehicle.id,
        message: `${label} está ${recommendation.marketPositionPercent.toFixed(1).replace(".", ",")}% acima do mercado.`,
      });
    }

    if (recommendation.daysInStock >= 60 && recommendation.daysInStock < 63) {
      alerts.push({
        id: `milestone_${vehicle.id}`,
        kind: "STOCK_MILESTONE",
        severity: "warning",
        vehicleId: vehicle.id,
        message: `${label} completou ${recommendation.daysInStock} dias no estoque.`,
      });
    }

    if (metrics.leads7d >= 12 && recommendation.marketPositionPercent <= 0) {
      alerts.push({
        id: `spike_${vehicle.id}`,
        kind: "LEAD_SPIKE",
        severity: "info",
        vehicleId: vehicle.id,
        message: `${label} recebeu ${metrics.leads7d} leads nos últimos 7 dias. Existe oportunidade para aumentar o preço.`,
      });
    }

    if (metrics.marketTrendPercent30d <= -4 && recommendation.marketStats.avg > 0) {
      const dropValue = Math.abs(
        recommendation.marketStats.avg * (metrics.marketTrendPercent30d / 100)
      );
      alerts.push({
        id: `drop_${vehicle.id}`,
        kind: "MARKET_DROP",
        severity: "warning",
        vehicleId: vehicle.id,
        message: `${label} caiu ${formatCurrency(dropValue)} no mercado nos últimos 30 dias.`,
      });
    }

    const { marketStats } = recommendation;
    if (marketStats.count >= 4) {
      const cheaperThanVehicle = metrics.marketSamples.filter((s) => s > vehicle.price).length;
      const percentBelow = (cheaperThanVehicle / marketStats.count) * 100;
      if (percentBelow >= 90) {
        alerts.push({
          id: `below_${vehicle.id}`,
          kind: "BELOW_COMPETITORS",
          severity: "info",
          vehicleId: vehicle.id,
          message: `Preço do ${label} está abaixo de ${Math.round(percentBelow)}% dos concorrentes analisados.`,
        });
      }
    }
  }

  return alerts;
}
