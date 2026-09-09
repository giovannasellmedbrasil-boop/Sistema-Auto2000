import type { BodyType, FuelType, Transmission, Vehicle } from "@/lib/types";

// Motor de correspondência por palavras-chave — versão inicial da seção 8.
// Não é um modelo de IA/LLM: interpreta o texto do usuário com heurísticas
// simples e compara exclusivamente com o estoque real (nunca inventa
// veículos). A recomendação com IA generativa completa é planejada para a
// Fase 3 (ver seção 30 do briefing).

export interface ParsedQuery {
  budget?: number;
  downPayment?: number;
  bodyType?: BodyType;
  transmission?: Transmission;
  fuel?: FuelType;
  raw: string;
}

const BODY_KEYWORDS: [RegExp, BodyType][] = [
  [/suv/i, "SUV"],
  [/sed[aã]/i, "SEDAN"],
  [/hatch/i, "HATCH"],
  [/picape|pick ?up/i, "PICKUP"],
  [/minivan/i, "MINIVAN"],
  [/cup[eê]/i, "COUPE"],
  [/conversí?vel/i, "CONVERTIBLE"],
];

const FUEL_KEYWORDS: [RegExp, FuelType][] = [
  [/diesel/i, "DIESEL"],
  [/híbrido|hibrido/i, "HYBRID"],
  [/el[eé]trico/i, "ELECTRIC"],
  [/etanol|álcool|alcool/i, "ETHANOL"],
  [/gasolina/i, "GASOLINE"],
  [/flex/i, "FLEX"],
];

function parseMoney(match: string): number {
  const isThousand = /mil/i.test(match);
  const digits = match.replace(/[^\d,.]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const value = parseFloat(digits) || 0;
  return isThousand ? value * 1000 : value;
}

export function parseQuery(text: string): ParsedQuery {
  const result: ParsedQuery = { raw: text };

  const budgetMatch = text.match(/at[eé]\s*r?\$?\s*([\d.,]+)\s*(mil)?/i);
  if (budgetMatch) result.budget = parseMoney(budgetMatch[0]);

  const downMatch = text.match(/entrada\s*(?:de)?\s*r?\$?\s*([\d.,]+)\s*(mil)?/i);
  if (downMatch) result.downPayment = parseMoney(downMatch[0]);

  if (/autom[aá]tic/i.test(text)) result.transmission = "AUTOMATIC";
  else if (/manual/i.test(text)) result.transmission = "MANUAL";

  for (const [regex, body] of BODY_KEYWORDS) {
    if (regex.test(text)) {
      result.bodyType = body;
      break;
    }
  }

  for (const [regex, fuel] of FUEL_KEYWORDS) {
    if (regex.test(text)) {
      result.fuel = fuel;
      break;
    }
  }

  return result;
}

export interface MatchResult {
  vehicle: Vehicle;
  score: number; // 0-100
  reasons: string[];
}

export function matchVehicles(vehicles: Vehicle[], query: ParsedQuery): MatchResult[] {
  const criteriaCount =
    [query.budget, query.bodyType, query.transmission, query.fuel].filter(Boolean).length || 1;

  const results: MatchResult[] = vehicles.map((vehicle) => {
    let hits = 0;
    const reasons: string[] = [];

    if (query.budget) {
      if (vehicle.price <= query.budget) {
        hits += 1;
        reasons.push("Dentro do orçamento informado");
      }
    }
    if (query.bodyType) {
      if (vehicle.bodyType === query.bodyType) {
        hits += 1;
        reasons.push(`Carroceria ${bodyLabel(query.bodyType)} como solicitado`);
      }
    }
    if (query.transmission) {
      if (vehicle.transmission === query.transmission) {
        hits += 1;
        reasons.push(vehicle.transmission === "AUTOMATIC" ? "Câmbio automático" : "Câmbio manual");
      }
    }
    if (query.fuel) {
      if (vehicle.fuel === query.fuel) {
        hits += 1;
        reasons.push("Combustível compatível com o perfil informado");
      }
    }

    const score = Math.round((hits / criteriaCount) * 100);
    return { vehicle, score, reasons };
  });

  return results
    .filter((r) => r.score > 0 || r.reasons.length > 0)
    .sort((a, b) => b.score - a.score || a.vehicle.price - b.vehicle.price);
}

function bodyLabel(body: BodyType) {
  const labels: Record<BodyType, string> = {
    HATCH: "hatch",
    SEDAN: "sedã",
    SUV: "SUV",
    PICKUP: "picape",
    MINIVAN: "minivan",
    COUPE: "cupê",
    CONVERTIBLE: "conversível",
  };
  return labels[body];
}
