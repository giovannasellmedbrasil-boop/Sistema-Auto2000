// Cliente real da API pública da Tabela FIPE (Parallelum —
// https://parallelum.com.br/fipe/api/v1). Serviço gratuito, sem chave
// obrigatória, mantido pela comunidade a partir dos dados oficiais da FIPE.
// Não é scraping: é uma API REST documentada.
//
// A API tem cota (por volta de 500 requisições/dia sem token — ver
// discussão pública do projeto). Por isso: cache em memória por processo
// para marcas/modelos/anos (mudam raramente) e timeout curto com falha
// honesta — nunca inventamos um valor quando a consulta falha.

const BASE_URL = "https://parallelum.com.br/fipe/api/v1/carros";
const REQUEST_TIMEOUT_MS = 8000;

export interface FipeBrand {
  code: string;
  name: string;
}

export interface FipeModel {
  code: string;
  name: string;
}

export interface FipeYear {
  code: string;
  label: string;
}

export interface FipeValueResult {
  fipeCode: string;
  brandName: string;
  modelName: string;
  modelYear: number;
  fuel: string;
  value: number;
  referenceMonth: string;
}

export type FipeResult<T> = { ok: true; data: T } | { ok: false; error: string };

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

async function fetchJson<T>(path: string): Promise<FipeResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
    if (!res.ok) {
      return { ok: false, error: `Tabela FIPE respondeu ${res.status}. Tente novamente mais tarde.` };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Consulta à tabela FIPE demorou demais e foi cancelada." };
    }
    return { ok: false, error: "Não foi possível consultar a tabela FIPE agora." };
  } finally {
    clearTimeout(timeout);
  }
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export async function listFipeBrands(): Promise<FipeResult<FipeBrand[]>> {
  const cacheKey = "brands";
  const cached = getCached<FipeBrand[]>(cacheKey);
  if (cached) return { ok: true, data: cached };

  const result = await fetchJson<{ codigo: string; nome: string }[]>("/marcas");
  if (!result.ok) return result;

  const brands = result.data.map((b) => ({ code: b.codigo, name: b.nome }));
  setCached(cacheKey, brands, ONE_DAY_MS);
  return { ok: true, data: brands };
}

export async function listFipeModels(brandCode: string): Promise<FipeResult<FipeModel[]>> {
  const cacheKey = `models:${brandCode}`;
  const cached = getCached<FipeModel[]>(cacheKey);
  if (cached) return { ok: true, data: cached };

  const result = await fetchJson<{ modelos: { codigo: number; nome: string }[] }>(
    `/marcas/${brandCode}/modelos`
  );
  if (!result.ok) return result;

  const models = result.data.modelos.map((m) => ({ code: String(m.codigo), name: m.nome }));
  setCached(cacheKey, models, ONE_DAY_MS);
  return { ok: true, data: models };
}

export async function listFipeYears(brandCode: string, modelCode: string): Promise<FipeResult<FipeYear[]>> {
  const cacheKey = `years:${brandCode}:${modelCode}`;
  const cached = getCached<FipeYear[]>(cacheKey);
  if (cached) return { ok: true, data: cached };

  const result = await fetchJson<{ codigo: string; nome: string }[]>(
    `/marcas/${brandCode}/modelos/${modelCode}/anos`
  );
  if (!result.ok) return result;

  const years = result.data.map((y) => ({ code: y.codigo, label: y.nome }));
  setCached(cacheKey, years, ONE_DAY_MS);
  return { ok: true, data: years };
}

function parseCurrencyBRL(value: string): number {
  const digits = value.replace(/[^\d,]/g, "").replace(",", ".");
  return Number(digits);
}

export async function getFipeValue(
  brandCode: string,
  modelCode: string,
  yearCode: string
): Promise<FipeResult<FipeValueResult>> {
  const cacheKey = `value:${brandCode}:${modelCode}:${yearCode}`;
  const cached = getCached<FipeValueResult>(cacheKey);
  if (cached) return { ok: true, data: cached };

  const result = await fetchJson<{
    Valor: string;
    Marca: string;
    Modelo: string;
    AnoModelo: number;
    Combustivel: string;
    CodigoFipe: string;
    MesReferencia: string;
  }>(`/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`);
  if (!result.ok) return result;

  const value: FipeValueResult = {
    fipeCode: result.data.CodigoFipe,
    brandName: result.data.Marca,
    modelName: result.data.Modelo,
    modelYear: result.data.AnoModelo,
    fuel: result.data.Combustivel,
    value: parseCurrencyBRL(result.data.Valor),
    referenceMonth: result.data.MesReferencia,
  };
  setCached(cacheKey, value, TWELVE_HOURS_MS);
  return { ok: true, data: value };
}
