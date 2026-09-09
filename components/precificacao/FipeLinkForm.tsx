"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import type { FipeVehicleLink, FuelType } from "@/lib/types";

interface Option {
  code: string;
  name?: string;
  label?: string;
}

interface VehicleHint {
  brand: string;
  model: string;
  version: string;
  modelYear: number;
  fuel: FuelType;
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

// Pré-seleciona a marca/modelo/ano da FIPE que melhor combina com o
// cadastro do veículo — nunca inventa um vínculo: apenas escolhe a opção
// mais provável dentro da lista real retornada pela API, e o usuário ainda
// confere e confirma antes de vincular (a nomenclatura da FIPE às vezes
// difere da nossa, ex.: "GM - Chevrolet" vs. "Chevrolet").
function findBestBrandMatch(brands: Option[], vehicleBrand: string): Option | undefined {
  const target = normalize(vehicleBrand);
  if (!target) return undefined;
  return (
    brands.find((b) => normalize(b.name ?? "") === target) ??
    brands.find((b) => normalize(b.name ?? "").split(" ").includes(target)) ??
    brands.find((b) => normalize(b.name ?? "").includes(target))
  );
}

// Retorna os candidatos de modelo (mesmo prefixo do nome) ordenados do mais
// provável para o menos provável, pela quantidade de palavras que
// compartilham com a versão cadastrada (ex.: "XEI", "2.0", "Flex"). Vários
// trims do FIPE começam com o mesmo nome de modelo, então essa pontuação
// sozinha pode empatar — por isso o chamador ainda confirma o ano
// (findFirstWithYear) antes de decidir, em vez de confiar cegamente no
// primeiro colocado.
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

export function FipeLinkForm({
  vehicleId,
  existingLink,
  vehicle,
}: {
  vehicleId: string;
  existingLink: FipeVehicleLink | null;
  vehicle: VehicleHint;
}) {
  const router = useRouter();
  const [brands, setBrands] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [modelsBrand, setModelsBrand] = useState("");
  const [years, setYears] = useState<Option[]>([]);
  const [yearsFor, setYearsFor] = useState("");

  const [brandCode, setBrandCode] = useState(existingLink?.fipeBrandCode ?? "");
  const [modelCode, setModelCode] = useState(existingLink?.fipeModelCode ?? "");
  const [yearCode, setYearCode] = useState(existingLink?.fipeYearCode ?? "");
  const [autoFilled, setAutoFilled] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingBrands = brands.length === 0;
  const loadingModels = Boolean(brandCode) && modelsBrand !== brandCode;
  const loadingYears = Boolean(modelCode) && yearsFor !== `${brandCode}:${modelCode}`;

  useEffect(() => {
    let active = true;
    fetch("/api/fipe/marcas")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.brands) {
          setBrands(data.brands);
          if (!existingLink && !brandCode) {
            const match = findBestBrandMatch(data.brands, vehicle.brand);
            if (match) {
              setBrandCode(match.code);
              setAutoFilled(true);
            }
          }
        } else setError(data.error ?? "Não foi possível carregar as marcas da FIPE.");
      })
      .catch(() => active && setError("Não foi possível carregar as marcas da FIPE."));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!brandCode) return;
    let active = true;

    async function loadModels() {
      const res = await fetch(`/api/fipe/marcas/${brandCode}/modelos`);
      const data = await res.json();
      if (!active) return;
      if (!data.models) {
        setError(data.error ?? "Não foi possível carregar os modelos.");
        return;
      }
      setModels(data.models);
      setModelsBrand(brandCode);
      if (existingLink || modelCode) return;

      // Vários trims do FIPE começam com o mesmo nome (ex.: 43 variações de
      // "Corolla*"). O ranking por palavras da versão pode empatar entre
      // trims que nem sequer cobrem o ano do veículo — então confirmamos
      // contra os anos reais de cada candidato antes de escolher, em vez de
      // confiar apenas na pontuação de texto.
      const ranked = rankModelCandidates(data.models, vehicle.model, vehicle.version).slice(0, 6);
      for (const candidate of ranked) {
        const yearsRes = await fetch(`/api/fipe/marcas/${brandCode}/modelos/${candidate.code}/anos`);
        const yearsData = await yearsRes.json();
        if (!active) return;
        if (yearsData.years && findBestYearMatch(yearsData.years, vehicle.modelYear, vehicle.fuel)) {
          setModelCode(candidate.code);
          setAutoFilled(true);
          return;
        }
      }
      // Nenhum candidato tinha o ano exato — melhor esforço com o mais
      // próximo por texto, ainda sujeito à confirmação do usuário.
      if (ranked[0]) {
        setModelCode(ranked[0].code);
        setAutoFilled(true);
      }
    }

    loadModels().catch(() => active && setError("Não foi possível carregar os modelos."));
    return () => {
      active = false;
    };
  }, [brandCode]);

  useEffect(() => {
    if (!brandCode || !modelCode) return;
    let active = true;
    fetch(`/api/fipe/marcas/${brandCode}/modelos/${modelCode}/anos`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.years) {
          setYears(data.years);
          setYearsFor(`${brandCode}:${modelCode}`);
          if (!existingLink && !yearCode) {
            const match = findBestYearMatch(data.years, vehicle.modelYear, vehicle.fuel);
            if (match) {
              setYearCode(match.code);
              setAutoFilled(true);
            }
          }
        } else {
          setError(data.error ?? "Não foi possível carregar os anos.");
        }
      })
      .catch(() => active && setError("Não foi possível carregar os anos."));
    return () => {
      active = false;
    };
  }, [brandCode, modelCode]);

  async function handleSubmit() {
    const brand = brands.find((b) => b.code === brandCode);
    const model = models.find((m) => m.code === modelCode);
    const year = years.find((y) => y.code === yearCode);
    if (!brand || !model || !year) {
      setError("Selecione marca, modelo e ano.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/fipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandCode: brand.code,
          brandName: brand.name,
          modelCode: model.code,
          modelName: model.name,
          yearCode: year.code,
          yearLabel: year.label,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Não foi possível vincular à FIPE.");
        return;
      }
      if (data.error) setError(data.error);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {autoFilled && !existingLink && (
        <p className="flex items-center gap-1.5 text-xs text-accent-400">
          <Wand2 className="h-3.5 w-3.5" />
          Marca, modelo e ano pré-preenchidos a partir do cadastro do veículo — confira antes de vincular.
        </p>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select
          value={brandCode}
          disabled={loadingBrands}
          onChange={(e) => {
            setBrandCode(e.target.value);
            setModelCode("");
            setYearCode("");
            setAutoFilled(false);
          }}
        >
          <option value="">{loadingBrands ? "Carregando marcas…" : "Marca"}</option>
          {brands.map((b) => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </Select>
        <Select
          value={modelCode}
          disabled={!brandCode || loadingModels}
          onChange={(e) => {
            setModelCode(e.target.value);
            setYearCode("");
            setAutoFilled(false);
          }}
        >
          <option value="">{loadingModels ? "Carregando modelos…" : "Modelo"}</option>
          {modelsBrand === brandCode && models.map((m) => (
            <option key={m.code} value={m.code}>{m.name}</option>
          ))}
        </Select>
        <Select
          value={yearCode}
          disabled={!modelCode || loadingYears}
          onChange={(e) => {
            setYearCode(e.target.value);
            setAutoFilled(false);
          }}
        >
          <option value="">{loadingYears ? "Carregando anos…" : "Ano/combustível"}</option>
          {yearsFor === `${brandCode}:${modelCode}` && years.map((y) => (
            <option key={y.code} value={y.code}>{y.label}</option>
          ))}
        </Select>
      </div>
      <div>
        <Button type="button" size="sm" onClick={handleSubmit} disabled={saving || !yearCode}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {existingLink ? "Atualizar vínculo e consultar" : "Vincular e consultar FIPE"}
        </Button>
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
