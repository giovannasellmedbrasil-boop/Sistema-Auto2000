// Fonte única de dados do módulo de Precificação com IA — junta o estoque
// real (lib/server/db.ts), as métricas/custo mockados
// (lib/server/pricing-seed.ts) e a configuração (lib/server/pricing-store.ts),
// roda o motor de regras (lib/pricing/engine.ts) uma vez, e é isso que todas
// as páginas e rotas de API do módulo consomem. Só roda no servidor (usa
// node:fs via lib/server/pricing-store.ts) — nunca importar de um Client
// Component.

import type { Vehicle } from "@/lib/types";
import { listVehiclesAdmin } from "@/lib/server/db";
import { getCostOverrideForVehicle, getMetricsForVehicle } from "@/lib/server/pricing-seed";
import { ensureHistorySeeded, getPricingConfig } from "@/lib/server/pricing-store";
import { computeRecommendation } from "@/lib/pricing/engine";
import type { EnrichedVehicle, PricingConfig } from "@/lib/pricing/types";

const PRICEABLE_STATUSES: Vehicle["status"][] = ["AVAILABLE", "PREPARING"];

function withCost(vehicle: Vehicle): Vehicle {
  if (vehicle.costPrice) return vehicle;
  return { ...vehicle, costPrice: getCostOverrideForVehicle(vehicle) };
}

export async function getEnrichedVehicles(): Promise<{ items: EnrichedVehicle[]; config: PricingConfig }> {
  const allVehicles = await listVehiclesAdmin();
  ensureHistorySeeded(allVehicles);

  const config = getPricingConfig();
  const items = allVehicles
    .filter((v) => PRICEABLE_STATUSES.includes(v.status))
    .map((raw) => {
      const vehicle = withCost(raw);
      const metrics = getMetricsForVehicle(vehicle);
      const recommendation = computeRecommendation(vehicle, metrics, config);
      return { vehicle, metrics, recommendation };
    });

  return { items, config };
}

export async function getEnrichedVehicleById(id: string): Promise<{ item: EnrichedVehicle; config: PricingConfig } | null> {
  const raw = (await listVehiclesAdmin()).find((v) => v.id === id);
  if (!raw) return null;
  ensureHistorySeeded([raw]);

  const config = getPricingConfig();
  const vehicle = withCost(raw);
  const metrics = getMetricsForVehicle(vehicle);
  const recommendation = computeRecommendation(vehicle, metrics, config);
  return { item: { vehicle, metrics, recommendation }, config };
}
