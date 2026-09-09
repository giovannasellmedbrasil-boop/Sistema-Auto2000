import fs from "node:fs";
import path from "node:path";
import type { Vehicle } from "@/lib/types";
import type { PriceHistoryEntry, PricingConfig, PricingFeedbackEntry } from "@/lib/pricing/types";
import { getHistoryTemplateForVehicle, getMetricsForVehicle, pricingConfigSeed } from "@/lib/server/pricing-seed";
import { computeMarketStats } from "@/lib/pricing/engine";
import { daysInStock } from "@/lib/utils";

// ---------------------------------------------------------------------------
// MOCK STORE do módulo de Precificação com IA — arquivo próprio
// (data/pricing-db.json), separado de data/db.json de propósito: o estoque
// de veículos (lib/server/db.ts) está sendo desenvolvido em paralelo por
// outra frente neste mesmo projeto, e este módulo só precisa LER veículos
// de lá (listVehiclesAdmin/getVehicleById/updateVehicle) — nunca grava no
// mesmo arquivo, evitando qualquer conflito de escrita concorrente.
// ---------------------------------------------------------------------------

interface PricingDbShape {
  config: PricingConfig;
  priceHistory: PriceHistoryEntry[];
  feedback: PricingFeedbackEntry[];
  historySeededVehicleIds: string[];
}

const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "auto2000-pricing-db.json")
  : path.join(process.cwd(), "data", "pricing-db.json");

function emptyDb(): PricingDbShape {
  return { config: pricingConfigSeed, priceHistory: [], feedback: [], historySeededVehicleIds: [] };
}

function normalize(parsed: Partial<PricingDbShape>): PricingDbShape {
  return {
    config: { ...pricingConfigSeed, ...(parsed.config ?? {}) },
    priceHistory: parsed.priceHistory ?? [],
    feedback: parsed.feedback ?? [],
    historySeededVehicleIds: parsed.historySeededVehicleIds ?? [],
  };
}

function readDb(): PricingDbShape {
  if (!fs.existsSync(DB_PATH)) {
    const initial = emptyDb();
    writeDb(initial);
    return initial;
  }
  try {
    return normalize(JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as Partial<PricingDbShape>);
  } catch {
    const initial = emptyDb();
    writeDb(initial);
    return initial;
  }
}

function writeDb(db: PricingDbShape) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function getPricingConfig(): PricingConfig {
  return readDb().config;
}

export function updatePricingConfig(partial: Partial<PricingConfig>): PricingConfig {
  const db = readDb();
  db.config = { ...db.config, ...partial };
  writeDb(db);
  return db.config;
}

export function getPriceHistory(vehicleId: string): PriceHistoryEntry[] {
  return readDb()
    .priceHistory.filter((h) => h.vehicleId === vehicleId)
    .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
}

export function appendPriceHistory(entry: Omit<PriceHistoryEntry, "id">): PriceHistoryEntry {
  const db = readDb();
  const full: PriceHistoryEntry = { ...entry, id: genId("pricehist") };
  db.priceHistory.push(full);
  writeDb(db);
  return full;
}

export function recordPricingFeedback(
  entry: Omit<PricingFeedbackEntry, "id" | "createdAt">
): PricingFeedbackEntry {
  const db = readDb();
  const full: PricingFeedbackEntry = { ...entry, id: genId("fdbk"), createdAt: new Date().toISOString() };
  db.feedback.unshift(full);
  writeDb(db);
  return full;
}

export function listPricingFeedback(): PricingFeedbackEntry[] {
  return readDb().feedback;
}

/** Garante que os veículos com um "roteiro" de histórico
 * (lib/server/pricing-seed.ts) tenham suas entradas iniciais gravadas —
 * roda uma vez por veículo, na primeira vez que ele é visto pelo módulo
 * (idempotente via historySeededVehicleIds). */
export function ensureHistorySeeded(vehicles: Vehicle[]): void {
  const db = readDb();
  const seededSet = new Set(db.historySeededVehicleIds);
  let changed = false;

  for (const vehicle of vehicles) {
    if (seededSet.has(vehicle.id)) continue;
    seededSet.add(vehicle.id);
    changed = true;

    const template = getHistoryTemplateForVehicle(vehicle);
    if (template.length === 0) continue;

    const metrics = getMetricsForVehicle(vehicle);
    const marketStats = computeMarketStats(metrics);

    for (const entry of template) {
      const changedAt = new Date(Date.now() - entry.daysAgo * 86400000).toISOString();
      db.priceHistory.push({
        id: genId("pricehist"),
        vehicleId: vehicle.id,
        price: entry.price,
        changedAt,
        changedBy: entry.changedBy,
        reason: entry.reason ?? null,
        aiRecommendedPriceAtTime: null,
        marketAvgAtTime: marketStats.avg || null,
        daysInStockAtTime: Math.max(0, daysInStock(vehicle.enteredStockAt) - entry.daysAgo),
      });
    }
  }

  if (changed) {
    db.historySeededVehicleIds = Array.from(seededSet);
    writeDb(db);
  }
}
