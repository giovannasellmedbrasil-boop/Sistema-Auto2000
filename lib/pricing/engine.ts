// Motor de precificação — funções puras, sem "server-only", para poderem
// rodar tanto em Server Components quanto no simulador client-side (seção
// 8) recalculando em tempo real a partir dos mesmos dados já carregados.
//
// É um motor de REGRAS PONDERADAS explicável, não um modelo de ML nem uma
// chamada a um LLM — mesma filosofia de lib/matching.ts (heurística
// transparente, nunca inventa dado). Os pesos e limiares foram calibrados
// manualmente contra os exemplos do briefing (seção 3, 6 e 17), não
// treinados.

import type { Vehicle } from "@/lib/types";
import { daysInStock as daysInStockOf, formatCurrency } from "@/lib/utils";
import type {
  DemandInfo,
  DemandLevel,
  MarginInfo,
  MarketStats,
  PricingConfig,
  PricingRecommendation,
  PricingScore,
  RecommendationAction,
  VehiclePricingMetrics,
} from "@/lib/pricing/types";

export function round100(value: number): number {
  return Math.round(value / 100) * 100;
}

export function computeMarketStats(metrics: VehiclePricingMetrics): MarketStats {
  const sorted = [...metrics.marketSamples].sort((a, b) => a - b);
  const count = sorted.length;
  if (count === 0) {
    return { min: 0, avg: 0, median: 0, max: 0, count: 0 };
  }
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mid = Math.floor(count / 2);
  const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return {
    min: sorted[0],
    max: sorted[count - 1],
    avg: sum / count,
    median,
    count,
  };
}

/** Margem = (preço - custo) / preço. Se não houver custo cadastrado, retorna 0. */
export function computeMargin(vehicle: Vehicle, price: number = vehicle.price): MarginInfo {
  const cost = vehicle.costPrice ?? 0;
  if (!cost) return { value: 0, percent: 0 };
  const value = price - cost;
  const percent = (value / price) * 100;
  return { value, percent };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeDemand(metrics: VehiclePricingMetrics): DemandInfo {
  const viewsScore = clamp((metrics.views30d / 300) * 100, 0, 100);
  const whatsappScore = clamp((metrics.whatsappClicks30d / 20) * 100, 0, 100);
  const leadsScore = clamp((metrics.leads30d / 15) * 100, 0, 100);
  const proposalsScore = clamp((metrics.proposals30d / 5) * 100, 0, 100);
  const testDriveScore = clamp((metrics.testDrives30d / 5) * 100, 0, 100);
  const liquidityScore = clamp(100 - (metrics.modelAvgDaysToSell / 90) * 100, 0, 100);

  const leadsTrendPercent =
    metrics.leadsPrev15d > 0
      ? ((metrics.leads15d - metrics.leadsPrev15d) / metrics.leadsPrev15d) * 100
      : metrics.leads15d > 0
        ? 100
        : 0;
  const trendBonus = clamp(leadsTrendPercent / 2, -20, 20);

  const composite = clamp(
    viewsScore * 0.15 +
      whatsappScore * 0.1 +
      leadsScore * 0.3 +
      proposalsScore * 0.2 +
      testDriveScore * 0.1 +
      liquidityScore * 0.15 +
      trendBonus,
    0,
    100
  );

  const level: DemandLevel = composite >= 65 ? "HIGH" : composite >= 35 ? "MEDIUM" : "LOW";

  return { level, score: Math.round(composite), leadsTrendPercent: Math.round(leadsTrendPercent) };
}

export const DEMAND_LABELS: Record<DemandLevel, string> = {
  HIGH: "Alta procura",
  MEDIUM: "Média procura",
  LOW: "Baixa procura",
};

/** Estágio de tempo em estoque (seção 5) — usado como um fator entre vários, nunca isoladamente. */
function stageFactor(days: number): number {
  if (days <= 15) return 0.2; // preservar margem
  if (days <= 30) return 0.4; // acompanhar mercado
  if (days <= 60) return 0.7; // priorizar competitividade
  if (days <= 90) return 1.0; // priorizar giro
  return 1.3; // considerar redução agressiva (respeitando margem mínima)
}

export function computePricingScore(
  vehicle: Vehicle,
  metrics: VehiclePricingMetrics,
  marketStats: MarketStats,
  config: PricingConfig,
  price: number = vehicle.price
): PricingScore {
  const days = daysInStockOf(vehicle.enteredStockAt);
  const demand = computeDemand(metrics);
  const margin = computeMargin(vehicle, price);
  const gapPct = marketStats.avg > 0 ? ((price - marketStats.avg) / marketStats.avg) * 100 : 0;

  const marketScore = clamp(100 - Math.abs(gapPct) * 6, 0, 100);
  const marginScore = clamp(
    ((margin.percent - config.minMarginPercent) / Math.max(config.minMarginPercent, 1)) * 50 + 50,
    0,
    100
  );
  const daysScore = clamp(
    100 -
      (days / config.maxDesiredDays) * 40 +
      (demand.level === "HIGH" ? 15 : demand.level === "LOW" ? -10 : 0),
    0,
    100
  );
  const demandScore = demand.score;

  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - vehicle.modelYear);
  const expectedKm = Math.max(ageYears, 0.5) * 15000;
  const kmRatio = vehicle.mileageKm / expectedKm;
  const vehicleCharScore = clamp(100 - Math.max(0, kmRatio - 1) * 60, 0, 100);

  const configuredWeightSum =
    config.weightMarketPrice + config.weightMargin + config.weightTimeInStock + config.weightDemand;
  const w = configuredWeightSum > 0 ? 0.9 / configuredWeightSum : 0;

  const composite =
    marketScore * config.weightMarketPrice * w +
    marginScore * config.weightMargin * w +
    daysScore * config.weightTimeInStock * w +
    demandScore * config.weightDemand * w +
    vehicleCharScore * 0.1;

  const value = Math.round(clamp(composite, 0, 100));
  const label =
    value >= 80 ? "Excelente" : value >= 60 ? "Competitivo" : value >= 40 ? "Atenção" : "Ajuste recomendado";

  return { value, label };
}

function minAllowedPrice(vehicle: Vehicle, config: PricingConfig): number {
  const cost = vehicle.costPrice ?? 0;
  const byValue = cost + config.minMarginValue;
  const byPercent = config.minMarginPercent < 100 ? cost / (1 - config.minMarginPercent / 100) : Infinity;
  return Math.max(byValue, byPercent);
}

export function computeRecommendation(
  vehicle: Vehicle,
  metrics: VehiclePricingMetrics,
  config: PricingConfig,
  priceOverride?: number
): PricingRecommendation {
  const price = priceOverride ?? vehicle.price;
  const days = daysInStockOf(vehicle.enteredStockAt);
  const marketStats = computeMarketStats(metrics);
  const demand = computeDemand(metrics);
  const margin = computeMargin(vehicle, price);
  const gapPct = marketStats.avg > 0 ? ((price - marketStats.avg) / marketStats.avg) * 100 : 0;
  const tolerance = config.marketTolerancePercent;
  const stage = stageFactor(days);

  let pressureReduce = 0;
  if (gapPct > tolerance) pressureReduce += (gapPct - tolerance) * 4;
  pressureReduce += stage * (demand.level === "LOW" ? 25 : demand.level === "MEDIUM" ? 12 : 0);
  if (demand.leadsTrendPercent < -20) pressureReduce += 10;
  if (metrics.leads15d === 0 && days > 15) pressureReduce += 10;

  let roomIncrease = 0;
  if (gapPct < -tolerance) roomIncrease += (Math.abs(gapPct) - tolerance) * 4;
  if (demand.level === "HIGH") roomIncrease += 20;
  if (demand.leadsTrendPercent > 20) roomIncrease += 10;
  if (metrics.proposals30d >= 2 && gapPct < 0) roomIncrease += 10;
  if (days <= 15 && demand.level !== "HIGH") roomIncrease *= 0.5;

  const threshold = 15;
  let action: RecommendationAction = "MAINTAIN";
  if (pressureReduce > roomIncrease && pressureReduce >= threshold) action = "REDUCE";
  else if (roomIncrease > pressureReduce && roomIncrease >= threshold) action = "INCREASE";

  let suggestedPrice = price;
  let protectedPrice: number | null = null;
  let marginAlert: string | null = null;

  if (action === "REDUCE") {
    const reduceTargetPercent =
      gapPct > 0 ? clamp(gapPct, 2, 15) : clamp((100 - demand.score) / 10, 3, 8);
    const idealPrice = round100(price - price * (reduceTargetPercent / 100));
    const floor = minAllowedPrice(vehicle, config);

    if (idealPrice < floor) {
      const protectedRounded = round100(floor);
      if (protectedRounded >= price) {
        action = "MAINTAIN";
        suggestedPrice = price;
        marginAlert = `O preço ideal de mercado seria ${formatCurrency(idealPrice)}, porém esse valor reduziria a margem abaixo do limite definido pela empresa (mínimo de ${formatCurrency(config.minMarginValue)} ou ${config.minMarginPercent}%). Mantendo o preço atual, que já está no limite de proteção de margem.`;
      } else {
        suggestedPrice = protectedRounded;
        protectedPrice = protectedRounded;
        marginAlert = `O preço ideal de mercado seria ${formatCurrency(idealPrice)}, porém esse valor reduziria a margem abaixo do limite definido pela empresa (mínimo de ${formatCurrency(config.minMarginValue)} ou ${config.minMarginPercent}%). Preço competitivo: ${formatCurrency(idealPrice)}. Preço protegido pela margem: ${formatCurrency(protectedRounded)}.`;
      }
    } else {
      suggestedPrice = idealPrice;
    }
  } else if (action === "INCREASE") {
    const increaseTargetPercent = gapPct < 0 ? clamp(Math.abs(gapPct) * 0.6, 2, 10) : 3;
    suggestedPrice = round100(price + price * (increaseTargetPercent / 100));
  }

  const amount = Math.abs(suggestedPrice - price);
  if (amount === 0) action = "MAINTAIN";

  const score = computePricingScore(vehicle, metrics, marketStats, config, price);

  const explanation = buildExplanation({
    vehicle,
    days,
    gapPct,
    demand,
    action,
    amount,
    suggestedPrice,
    marketStats,
  });

  return {
    action,
    amount,
    suggestedPrice,
    protectedPrice,
    marginAlert,
    explanation,
    marketPositionPercent: Math.round(gapPct * 10) / 10,
    marketStats,
    demand,
    margin,
    score,
    daysInStock: days,
  };
}

function buildExplanation(args: {
  vehicle: Vehicle;
  days: number;
  gapPct: number;
  demand: DemandInfo;
  action: RecommendationAction;
  amount: number;
  suggestedPrice: number;
  marketStats: MarketStats;
}): string {
  const { days, gapPct, demand, action, amount, suggestedPrice, marketStats } = args;
  const gapAbs = Math.abs(gapPct).toFixed(1).replace(".", ",");
  const position =
    gapPct > 0.5
      ? `aproximadamente ${gapAbs}% acima de veículos semelhantes disponíveis no mercado`
      : gapPct < -0.5
        ? `aproximadamente ${gapAbs}% abaixo de veículos semelhantes disponíveis no mercado`
        : `alinhado à média de veículos semelhantes no mercado`;
  const demandText =
    demand.level === "HIGH"
      ? "A procura pelo modelo está acima da média"
      : demand.level === "MEDIUM"
        ? "A procura pelo modelo está moderada"
        : "A procura pelo modelo está abaixo da média";
  const trendText =
    demand.leadsTrendPercent <= -20
      ? ", com queda relevante no número de leads nos últimos 15 dias"
      : demand.leadsTrendPercent >= 20
        ? ", com aumento relevante no número de leads nos últimos 15 dias"
        : "";

  const base = `Este veículo está há ${days} dias em estoque e seu preço está ${position}. ${demandText}${trendText} (base: ${marketStats.count} anúncios comparáveis).`;

  if (action === "REDUCE") {
    return `${base} Recomendamos reduzir o preço para ${formatCurrency(suggestedPrice)} (−${formatCurrency(amount)}) para aumentar a competitividade sem comprometer excessivamente a margem.`;
  }
  if (action === "INCREASE") {
    return `${base} Existe margem para aumentar o preço para ${formatCurrency(suggestedPrice)} (+${formatCurrency(amount)}) sem perda significativa de competitividade.`;
  }
  return `${base} O preço atual está equilibrado considerando tempo em estoque, margem e procura — recomendamos manter.`;
}

export interface SimulationResult {
  price: number;
  margin: MarginInfo;
  marketPositionPercent: number;
  marketStats: MarketStats;
  score: PricingScore;
  competitivenessLabel: "Alta competitividade" | "Média competitividade" | "Baixa competitividade";
}

/** Recalcula o cenário para um preço candidato arbitrário — usado pelo
 * simulador (seção 8) tanto na renderização inicial (server) quanto a cada
 * alteração do campo no client. */
export function simulatePrice(
  vehicle: Vehicle,
  metrics: VehiclePricingMetrics,
  config: PricingConfig,
  candidatePrice: number
): SimulationResult {
  const marketStats = computeMarketStats(metrics);
  const margin = computeMargin(vehicle, candidatePrice);
  const gapPct = marketStats.avg > 0 ? ((candidatePrice - marketStats.avg) / marketStats.avg) * 100 : 0;
  const score = computePricingScore(vehicle, metrics, marketStats, config, candidatePrice);

  const competitivenessLabel: SimulationResult["competitivenessLabel"] =
    score.value >= 75 ? "Alta competitividade" : score.value >= 50 ? "Média competitividade" : "Baixa competitividade";

  return {
    price: candidatePrice,
    margin,
    marketPositionPercent: Math.round(gapPct * 10) / 10,
    marketStats,
    score,
    competitivenessLabel,
  };
}

export interface StockSummary {
  totalVehicles: number;
  totalStockValue: number;
  avgMarginPercent: number;
  avgDaysInStock: number;
  competitivePriceCount: number;
  aboveMarketCount: number;
  belowMarketCount: number;
  reduceCount: number;
  increaseCount: number;
  maintainCount: number;
  days30to60: number;
  days60to90: number;
  days90plus: number;
  over30Days: number;
  over60Days: number;
  over90Days: number;
  increasePotentialTotal: number;
  reduceCapitalParked: number;
  reduceAvgDays: number;
  farAboveMarketCount: number;
  farAboveMarketAvgGapPercent: number;
}

export function computeStockSummary(
  items: { vehicle: Vehicle; recommendation: PricingRecommendation }[]
): StockSummary {
  const n = items.length || 1;
  const totalStockValue = items.reduce((acc, i) => acc + i.vehicle.price, 0);
  const avgMarginPercent = items.reduce((acc, i) => acc + i.recommendation.margin.percent, 0) / n;
  const avgDaysInStock = items.reduce((acc, i) => acc + i.recommendation.daysInStock, 0) / n;

  const tolerance = 4; // aproximação visual — cada item já traz seu próprio gap calculado com a tolerância configurada
  const aboveMarket = items.filter((i) => i.recommendation.marketPositionPercent > tolerance);
  const belowMarket = items.filter((i) => i.recommendation.marketPositionPercent < -tolerance);
  const competitive = items.filter(
    (i) => Math.abs(i.recommendation.marketPositionPercent) <= tolerance
  );
  const reduce = items.filter((i) => i.recommendation.action === "REDUCE");
  const increase = items.filter((i) => i.recommendation.action === "INCREASE");
  const maintain = items.filter((i) => i.recommendation.action === "MAINTAIN");
  const farAboveMarket = items.filter((i) => i.recommendation.marketPositionPercent > tolerance * 2.5);

  return {
    totalVehicles: items.length,
    totalStockValue,
    avgMarginPercent,
    avgDaysInStock,
    competitivePriceCount: competitive.length,
    aboveMarketCount: aboveMarket.length,
    belowMarketCount: belowMarket.length,
    reduceCount: reduce.length,
    increaseCount: increase.length,
    maintainCount: maintain.length,
    days30to60: items.filter((i) => i.recommendation.daysInStock >= 30 && i.recommendation.daysInStock < 60)
      .length,
    days60to90: items.filter((i) => i.recommendation.daysInStock >= 60 && i.recommendation.daysInStock < 90)
      .length,
    days90plus: items.filter((i) => i.recommendation.daysInStock >= 90).length,
    over30Days: items.filter((i) => i.recommendation.daysInStock >= 30).length,
    over60Days: items.filter((i) => i.recommendation.daysInStock >= 60).length,
    over90Days: items.filter((i) => i.recommendation.daysInStock >= 90).length,
    increasePotentialTotal: increase.reduce((acc, i) => acc + i.recommendation.amount, 0),
    reduceCapitalParked: reduce.reduce((acc, i) => acc + i.vehicle.price, 0),
    reduceAvgDays:
      reduce.length > 0
        ? reduce.reduce((acc, i) => acc + i.recommendation.daysInStock, 0) / reduce.length
        : 0,
    farAboveMarketCount: farAboveMarket.length,
    farAboveMarketAvgGapPercent:
      farAboveMarket.length > 0
        ? farAboveMarket.reduce((acc, i) => acc + i.recommendation.marketPositionPercent, 0) /
          farAboveMarket.length
        : 0,
  };
}
