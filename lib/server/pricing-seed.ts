import type { Vehicle } from "@/lib/types";
import type { PricingConfig, VehiclePricingMetrics } from "@/lib/pricing/types";

// Dados de demonstração do módulo de Precificação com IA — separados de
// lib/server/seed-data.ts (que já é editado por outra frente de trabalho
// no mesmo projeto) para não colidir com ele. Aqui não fazemos referência a
// `id` de veículo (instável entre reimportações do estoque): as métricas e
// o custo "canônicos" abaixo são casados por marca+modelo+versão; qualquer
// veículo do estoque que não tenha uma entrada aqui (ex: variantes geradas
// aleatoriamente pelo estoque) recebe métricas sintetizadas de forma
// determinística a partir do próprio id, para que o módulo funcione com
// qualquer tamanho/composição de estoque.

type MetricsTemplate = Omit<VehiclePricingMetrics, "vehicleId">;

function vehicleKey(v: { brand: string; model: string; version: string }): string {
  return `${v.brand}|${v.model}|${v.version}`;
}

// --- Casos "canônicos", escritos à mão para demonstrar os cenários da
// seção 17 do briefing (nunca decidir só pelo tempo parado). --------------

const METRICS_BY_KEY: Record<string, MetricsTemplate> = {
  "Toyota|Corolla|XEi 2.0": {
    views30d: 180,
    whatsappClicks30d: 10,
    leads30d: 9,
    leads15d: 5,
    leadsPrev15d: 4,
    leads7d: 3,
    proposals30d: 1,
    testDrives30d: 1,
    modelAvgDaysToSell: 35,
    marketSamples: [124000, 126500, 128000, 129500, 130800, 131500, 133000],
    marketTrendPercent30d: -1,
  },
  "Jeep|Compass|Longitude": {
    views30d: 60,
    whatsappClicks30d: 3,
    leads30d: 1,
    leads15d: 0,
    leadsPrev15d: 1,
    leads7d: 0,
    proposals30d: 0,
    testDrives30d: 0,
    modelAvgDaysToSell: 40,
    marketSamples: [142000, 145000, 147500, 148800, 150200, 151500, 153000],
    marketTrendPercent30d: -2,
  },
  "Hyundai|Creta|Limited": {
    views30d: 90,
    whatsappClicks30d: 5,
    leads30d: 3,
    leads15d: 2,
    leadsPrev15d: 1,
    leads7d: 2,
    proposals30d: 0,
    testDrives30d: 0,
    modelAvgDaysToSell: 30,
    marketSamples: [131000, 133500, 134800, 135500, 136800, 138000, 139500],
    marketTrendPercent30d: 1,
  },
  "Volkswagen|T-Cross|Highline": {
    views30d: 120,
    whatsappClicks30d: 6,
    leads30d: 6,
    leads15d: 3,
    leadsPrev15d: 3,
    leads7d: 2,
    proposals30d: 1,
    testDrives30d: 1,
    modelAvgDaysToSell: 38,
    marketSamples: [101000, 103500, 105000, 106500, 107800, 109200, 110500],
    marketTrendPercent30d: -1,
  },
  "Chevrolet|Onix|Premier": {
    views30d: 70,
    whatsappClicks30d: 4,
    leads30d: 2,
    leads15d: 1,
    leadsPrev15d: 1,
    leads7d: 1,
    proposals30d: 0,
    testDrives30d: 0,
    modelAvgDaysToSell: 22,
    marketSamples: [82000, 83500, 84800, 85500, 86800, 88000, 89000],
    marketTrendPercent30d: 0,
  },
  "Fiat|Toro|Volcano": {
    views30d: 55,
    whatsappClicks30d: 2,
    leads30d: 3,
    leads15d: 0,
    leadsPrev15d: 2,
    leads7d: 0,
    proposals30d: 0,
    testDrives30d: 0,
    modelAvgDaysToSell: 70,
    marketSamples: [102000, 104500, 106500, 107800, 109200, 111000, 113500],
    marketTrendPercent30d: -5,
  },
  "Honda|HR-V|EXL": {
    views30d: 300,
    whatsappClicks30d: 20,
    leads30d: 20,
    leads15d: 15,
    leadsPrev15d: 5,
    leads7d: 13,
    proposals30d: 2,
    testDrives30d: 3,
    modelAvgDaysToSell: 20,
    marketSamples: [153000, 155500, 157500, 158800, 160200, 161500, 163500],
    marketTrendPercent30d: 2,
  },
  "Renault|Kwid|Intense": {
    views30d: 50,
    whatsappClicks30d: 2,
    leads30d: 2,
    leads15d: 0,
    leadsPrev15d: 2,
    leads7d: 0,
    proposals30d: 0,
    testDrives30d: 0,
    modelAvgDaysToSell: 45,
    marketSamples: [53000, 54500, 55500, 56200, 57000, 58000, 58800],
    marketTrendPercent30d: -2,
  },
  "Volkswagen|Polo|GTS": {
    views30d: 95,
    whatsappClicks30d: 5,
    leads30d: 4,
    leads15d: 2,
    leadsPrev15d: 2,
    leads7d: 1,
    proposals30d: 0,
    testDrives30d: 1,
    modelAvgDaysToSell: 25,
    marketSamples: [115000, 117500, 118800, 119500, 120800, 122000, 123500],
    marketTrendPercent30d: 1,
  },
  "Toyota|Hilux|SRX 4x4": {
    views30d: 140,
    whatsappClicks30d: 8,
    leads30d: 8,
    leads15d: 3,
    leadsPrev15d: 5,
    leads7d: 2,
    proposals30d: 1,
    testDrives30d: 2,
    modelAvgDaysToSell: 55,
    marketSamples: [203000, 207500, 209800, 211500, 213200, 215000, 217500],
    marketTrendPercent30d: -2,
  },
  "Jeep|Renegade|Sport": {
    views30d: 100,
    whatsappClicks30d: 6,
    leads30d: 5,
    leads15d: 3,
    leadsPrev15d: 2,
    leads7d: 2,
    proposals30d: 1,
    testDrives30d: 1,
    modelAvgDaysToSell: 32,
    marketSamples: [90000, 92500, 93800, 94500, 95200, 96500, 97800],
    marketTrendPercent30d: 1,
  },
  "Fiat|Pulse|Drive": {
    views30d: 110,
    whatsappClicks30d: 6,
    leads30d: 5,
    leads15d: 3,
    leadsPrev15d: 2,
    leads7d: 2,
    proposals30d: 0,
    testDrives30d: 1,
    modelAvgDaysToSell: 28,
    marketSamples: [86000, 88000, 89500, 90300, 91500, 92500, 93500],
    marketTrendPercent30d: 0,
  },
  "Honda|Civic|Touring": {
    views30d: 220,
    whatsappClicks30d: 14,
    leads30d: 12,
    leads15d: 8,
    leadsPrev15d: 4,
    leads7d: 5,
    proposals30d: 2,
    testDrives30d: 3,
    modelAvgDaysToSell: 18,
    marketSamples: [188000, 192500, 194800, 195700, 197200, 198500, 200500],
    marketTrendPercent30d: 3,
  },
};

const COST_OVERRIDE_BY_KEY: Record<string, number> = {
  "Toyota|Corolla|XEi 2.0": 116500,
  "Jeep|Compass|Longitude": 143500,
  "Hyundai|Creta|Limited": 120500,
  "Volkswagen|T-Cross|Highline": 97000,
  "Chevrolet|Onix|Premier": 75000,
  "Fiat|Toro|Volcano": 107500,
  "Honda|HR-V|EXL": 132500,
  "Renault|Kwid|Intense": 52500,
  "Nissan|Kicks|Advance": 99000,
  "Volkswagen|Polo|GTS": 105500,
  "Toyota|Hilux|SRX 4x4": 196000,
  "Jeep|Renegade|Sport": 83500,
  "Fiat|Pulse|Drive": 78500,
  "Honda|Civic|Touring": 166500,
  "Chevrolet|Tracker|Premier": 102000,
  "Peugeot|208|Griffe": 82500,
  "Citroën|C4 Cactus|Shine": 78500,
  "BYD|Dolphin|Plus": 121500,
  "Volvo|XC60|Momentum": 254000,
  "Mitsubishi|L200|Triton": 159000,
  "RAM|2500|Laramie": 353000,
  "Renault|Duster|Iconic": 88500,
  "Hyundai|HB20|Comfort": 65500,
};

interface HistoryTemplateEntry {
  daysAgo: number;
  price: number;
  changedBy: string;
  reason?: string;
}

const HISTORY_BY_KEY: Record<string, HistoryTemplateEntry[]> = {
  "Jeep|Compass|Longitude": [
    { daysAgo: 40, price: 164900, changedBy: "Cadastro inicial" },
    { daysAgo: 18, price: 162900, changedBy: "Gerente Comercial", reason: "Acompanhamento de mercado" },
  ],
  "Fiat|Toro|Volcano": [
    { daysAgo: 90, price: 129900, changedBy: "Cadastro inicial" },
    { daysAgo: 55, price: 124900, changedBy: "Gerente Comercial", reason: "Redução por tempo em estoque" },
    { daysAgo: 20, price: 119900, changedBy: "Gerente Comercial", reason: "Ajuste de competitividade" },
  ],
  "Toyota|Hilux|SRX 4x4": [
    { daysAgo: 58, price: 224900, changedBy: "Cadastro inicial" },
  ],
  "Honda|HR-V|EXL": [{ daysAgo: 6, price: 147900, changedBy: "Cadastro inicial" }],
};

// --- Fallback determinístico para qualquer veículo sem entrada acima -----

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pickFromHash(hash: number, salt: number, min: number, max: number): number {
  const v = (hash + salt * 104729) % 1000;
  return min + (v / 1000) * (max - min);
}

export function synthesizeMetrics(vehicle: Vehicle): MetricsTemplate {
  const hash = hashString(vehicle.id);
  const views30d = Math.round(pickFromHash(hash, 1, 30, 260));
  const whatsappClicks30d = Math.round(pickFromHash(hash, 2, 1, 18));
  const leads30d = Math.round(pickFromHash(hash, 3, 0, 14));
  const leads15d = Math.min(leads30d, Math.round(pickFromHash(hash, 4, 0, leads30d + 1)));
  const leadsPrev15d = Math.max(0, leads30d - leads15d);
  const leads7d = Math.min(leads15d, Math.round(pickFromHash(hash, 5, 0, leads15d + 1)));
  const proposals30d = Math.round(pickFromHash(hash, 6, 0, 3));
  const testDrives30d = Math.round(pickFromHash(hash, 7, 0, 3));
  const modelAvgDaysToSell = Math.round(pickFromHash(hash, 8, 20, 80));
  const marketTrendPercent30d = Math.round(pickFromHash(hash, 9, -6, 6) * 10) / 10;

  const spreadPercent = pickFromHash(hash, 10, -8, 8) / 100;
  const centerPrice = vehicle.price * (1 + spreadPercent);
  const sampleCount = 5 + Math.round(pickFromHash(hash, 11, 0, 3));
  const marketSamples = Array.from({ length: sampleCount }, (_, i) => {
    const jitter = pickFromHash(hash, 20 + i, -6, 6) / 100;
    return Math.round((centerPrice * (1 + jitter)) / 100) * 100;
  }).sort((a, b) => a - b);

  return {
    views30d,
    whatsappClicks30d,
    leads30d,
    leads15d,
    leadsPrev15d,
    leads7d,
    proposals30d,
    testDrives30d,
    modelAvgDaysToSell,
    marketSamples,
    marketTrendPercent30d,
  };
}

export function synthesizeCost(vehicle: Vehicle): number {
  const hash = hashString(vehicle.id);
  const ratio = pickFromHash(hash, 30, 0.86, 0.95);
  return Math.round((vehicle.price * ratio) / 100) * 100;
}

export function getMetricsForVehicle(vehicle: Vehicle): VehiclePricingMetrics {
  const template = METRICS_BY_KEY[vehicleKey(vehicle)] ?? synthesizeMetrics(vehicle);
  return { ...template, vehicleId: vehicle.id };
}

export function getCostOverrideForVehicle(vehicle: Vehicle): number {
  return COST_OVERRIDE_BY_KEY[vehicleKey(vehicle)] ?? synthesizeCost(vehicle);
}

export function getHistoryTemplateForVehicle(vehicle: Vehicle): HistoryTemplateEntry[] {
  return HISTORY_BY_KEY[vehicleKey(vehicle)] ?? [];
}

export const pricingConfigSeed: PricingConfig = {
  minMarginValue: 7000,
  minMarginPercent: 5,
  maxDesiredDays: 60,
  weightTimeInStock: 1,
  weightMargin: 1,
  weightDemand: 1,
  weightMarketPrice: 1,
  marketTolerancePercent: 4,
  updateFrequencyDays: 7,
};
