// Tipos de domínio do módulo "IA de Precificação de Estoque".
// Espelham prisma/schema.prisma (VehiclePricingMetrics, PriceHistoryEntry,
// PricingConfig, PricingFeedback) da mesma forma que lib/types.ts espelha o
// restante do schema — ver nota em lib/server/db.ts sobre a troca futura do
// mock store por Prisma.

export type DemandLevel = "LOW" | "MEDIUM" | "HIGH";

export type RecommendationAction = "MAINTAIN" | "REDUCE" | "INCREASE";

export type PricingDecision = "APPLIED" | "IGNORED" | "CUSTOM";

export type PricingIgnoreReason =
  | "INSUFFICIENT_MARGIN"
  | "DIFFERENTIATED_VEHICLE"
  | "ONGOING_NEGOTIATION"
  | "FUTURE_PROMOTIONAL_PRICE"
  | "MANAGER_JUDGEMENT"
  | "OTHER";

export const PRICING_IGNORE_REASON_LABELS: Record<PricingIgnoreReason, string> = {
  INSUFFICIENT_MARGIN: "Margem insuficiente",
  DIFFERENTIATED_VEHICLE: "Veículo diferenciado",
  ONGOING_NEGOTIATION: "Negociação em andamento",
  FUTURE_PROMOTIONAL_PRICE: "Preço promocional futuro",
  MANAGER_JUDGEMENT: "Avaliação do gestor",
  OTHER: "Outro",
};

export type PricingDemoRole = "VENDEDOR" | "GERENTE" | "ADMINISTRADOR";

export const PRICING_ROLE_LABELS: Record<PricingDemoRole, string> = {
  VENDEDOR: "Vendedor",
  GERENTE: "Gerente",
  ADMINISTRADOR: "Administrador",
};

/** Métricas comerciais e amostras de mercado de um veículo — hoje mockadas
 * (seção 16: futuras integrações com CRM/leads/WhatsApp/Meta Ads/Google
 * Ads/portais/FIPE alimentariam isto de verdade). */
export interface VehiclePricingMetrics {
  vehicleId: string;
  views30d: number;
  whatsappClicks30d: number;
  leads30d: number;
  leads15d: number;
  leadsPrev15d: number;
  leads7d: number;
  proposals30d: number;
  testDrives30d: number;
  /** Dias médios até a venda para veículos semelhantes a este (liquidez do modelo). */
  modelAvgDaysToSell: number;
  /** Preços de anúncios semelhantes encontrados no mercado (mock). */
  marketSamples: number[];
  /** Variação média (%) dos comparáveis de mercado nos últimos 30 dias — negativo = mercado caiu. */
  marketTrendPercent30d: number;
}

export interface PriceHistoryEntry {
  id: string;
  vehicleId: string;
  price: number;
  changedAt: string; // ISO date
  changedBy: string;
  reason?: string | null;
  aiRecommendedPriceAtTime?: number | null;
  marketAvgAtTime?: number | null;
  daysInStockAtTime: number;
}

export interface PricingConfig {
  minMarginValue: number;
  minMarginPercent: number;
  maxDesiredDays: number;
  weightTimeInStock: number;
  weightMargin: number;
  weightDemand: number;
  weightMarketPrice: number;
  marketTolerancePercent: number;
  updateFrequencyDays: number;
}

export interface PricingFeedbackEntry {
  id: string;
  vehicleId: string;
  action: RecommendationAction;
  recommendedPrice: number;
  decision: PricingDecision;
  customPrice?: number | null;
  reason?: PricingIgnoreReason | null;
  reasonNote?: string | null;
  createdAt: string;
}

export interface MarketStats {
  min: number;
  avg: number;
  median: number;
  max: number;
  count: number;
}

export interface MarginInfo {
  value: number;
  percent: number;
}

export interface DemandInfo {
  level: DemandLevel;
  score: number; // 0-100
  leadsTrendPercent: number; // variação leads15d vs leadsPrev15d
}

export interface PricingScore {
  value: number; // 0-100
  label: "Excelente" | "Competitivo" | "Atenção" | "Ajuste recomendado";
}

export interface PricingRecommendation {
  action: RecommendationAction;
  amount: number; // valor absoluto do ajuste sugerido (0 quando MAINTAIN)
  suggestedPrice: number;
  /** Preenchido quando o preço competitivo ideal violaria a margem mínima. */
  protectedPrice?: number | null;
  marginAlert?: string | null;
  explanation: string;
  marketPositionPercent: number; // (preço - média mercado) / média mercado * 100
  marketStats: MarketStats;
  demand: DemandInfo;
  margin: MarginInfo;
  score: PricingScore;
  daysInStock: number;
}

export interface EnrichedVehicle {
  vehicle: import("@/lib/types").Vehicle;
  metrics: VehiclePricingMetrics;
  recommendation: PricingRecommendation;
}

export type AlertSeverity = "info" | "warning" | "danger";

export type AlertKind =
  | "ABOVE_MARKET"
  | "STOCK_MILESTONE"
  | "LEAD_SPIKE"
  | "MARKET_DROP"
  | "BELOW_COMPETITORS";

export interface PricingAlert {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  vehicleId: string;
  message: string;
}
