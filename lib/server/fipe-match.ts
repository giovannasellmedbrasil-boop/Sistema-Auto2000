// Mesma heurística de correspondência de components/precificacao/FipeLinkForm.tsx
// (marca → modelo → ano, sempre confirmando o ano real do candidato antes de
// decidir), reimplementada aqui para rodar no servidor sem navegador — usada
// pelo cron de atualização diária (app/api/cron/fipe-refresh/route.ts) para
// vincular automaticamente veículos que ainda não têm um vínculo FIPE salvo.
// Nunca inventa correspondência: só escolhe dentro da lista real devolvida
// pela API da FIPE, e retorna null quando nenhum candidato bate o ano.

import { listFipeBrands, listFipeModels, listFipeYears } from "@/lib/server/fipe";
import type { FuelType } from "@/lib/types";

interface Option {
  code: string;
  name?: string;
  label?: string;
}

const FUEL_WORDS: Record<FuelType, string[]> = {
  FLEX: ["flex"],
  GASOLINE: ["gasolina"],
  ETHANOL: ["álcool", "alcool", "etanol"],
  DIESEL: ["diesel"],
  HYBRID: ["híbrido", "hibrido"],
  ELECTRIC: ["elétrico", "eletrico"],
};

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findBestBrandMatch(brands: Option[], vehicleBrand: string): Option | undefined {
  const target = normalize(vehicleBrand);
  if (!target) return undefined;
  return (
    brands.find((b) => normalize(b.name ?? "") === target) ??
    brands.find((b) => normalize(b.name ?? "").split(" ").includes(target)) ??
    brands.find((b) => normalize(b.name ?? "").includes(target))
  );
}

function rankModelCandidates(models: Option[], vehicleModel: string, vehicleVersion: string): Option[] {
  const targetModel = normalize(vehicleModel);
  const versionWords = normalize(vehicleVersion).split(" ").filter(Boolean);
  if (!targetModel) return [];

  const candidates = models.filter((m) => normalize(m.name ?? "").startsWith(targetModel));
  return candidates
    .map((candidate) => {
      const nameWords = new Set(normalize(candidate.name ?? "").split(" "));
      const score = versionWords.reduce((acc, w) => acc + (nameWords.has(w) ? 1 : 0), 0);
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((r) => r.candidate);
}

function findBestYearMatch(years: Option[], modelYear: number, fuel: FuelType): Option | undefined {
  const sameYear = years.filter((y) => (y.label ?? "").match(/\d{4}/)?.[0] === String(modelYear));
  if (sameYear.length === 0) return undefined;
  if (sameYear.length === 1) return sameYear[0];

  const fuelWords = FUEL_WORDS[fuel];
  const byFuel = sameYear.find((y) => fuelWords.some((w) => normalize(y.label ?? "").includes(w)));
  return byFuel ?? sameYear[0];
}

export interface FipeMatchResult {
  brandCode: string;
  brandName: string;
  modelCode: string;
  modelName: string;
  yearCode: string;
  yearLabel: string;
}

export async function matchVehicleToFipe(vehicle: {
  brand: string;
  model: string;
  version: string;
  modelYear: number;
  fuel: FuelType;
}): Promise<FipeMatchResult | null> {
  const brandsResult = await listFipeBrands();
  if (!brandsResult.ok) return null;
  const brand = findBestBrandMatch(brandsResult.data, vehicle.brand);
  if (!brand) return null;

  const modelsResult = await listFipeModels(brand.code);
  if (!modelsResult.ok) return null;
  const ranked = rankModelCandidates(modelsResult.data, vehicle.model, vehicle.version).slice(0, 6);

  for (const candidate of ranked) {
    const yearsResult = await listFipeYears(brand.code, candidate.code);
    if (!yearsResult.ok) continue;
    const year = findBestYearMatch(yearsResult.data, vehicle.modelYear, vehicle.fuel);
    if (year) {
      return {
        brandCode: brand.code,
        brandName: brand.name ?? "",
        modelCode: candidate.code,
        modelName: candidate.name ?? "",
        yearCode: year.code,
        yearLabel: year.label ?? "",
      };
    }
  }

  // Nenhum candidato tinha o ano exato — melhor esforço com o primeiro por
  // texto (mesma regra de último recurso do formulário manual), ainda assim
  // só entre opções reais da FIPE.
  const fallback = ranked[0];
  if (fallback) {
    const yearsResult = await listFipeYears(brand.code, fallback.code);
    if (yearsResult.ok && yearsResult.data[0]) {
      return {
        brandCode: brand.code,
        brandName: brand.name ?? "",
        modelCode: fallback.code,
        modelName: fallback.name ?? "",
        yearCode: yearsResult.data[0].code,
        yearLabel: yearsResult.data[0].label ?? "",
      };
    }
  }

  return null;
}
