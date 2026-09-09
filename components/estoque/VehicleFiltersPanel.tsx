"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select, Input, Label, FormGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { BODY_TYPE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/types";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR + 1 - i);

export function VehicleFiltersPanel({
  brands,
  colors,
}: {
  brands: string[];
  colors: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const get = (key: string) => searchParams.get(key) ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/estoque?${params.toString()}`);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value) params.set(key, value);
    }
    router.push(`/estoque?${params.toString()}`);
    setOpen(false);
  }

  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== "sort");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-800 hover:border-ink-400 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>

        <div className="ml-auto flex items-center gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push("/estoque")}
              className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              <X className="h-3.5 w-3.5" /> Limpar filtros
            </button>
          )}
          <Select
            aria-label="Ordenar por"
            value={get("sort") || "recent"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="w-auto"
          >
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="mileage_asc">Menor quilometragem</option>
            <option value="year_desc">Maior ano</option>
          </Select>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`${open ? "grid" : "hidden"} grid-cols-2 gap-3 rounded-card border border-white/10 bg-ink-100 p-4 shadow-[var(--shadow-card)] sm:grid-cols-3 lg:grid lg:grid-cols-4 xl:grid-cols-8`}
      >
        <FormGroup>
          <Label>Marca</Label>
          <Select name="brand" defaultValue={get("brand")}>
            <option value="">Todas</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Carroceria</Label>
          <Select name="bodyType" defaultValue={get("bodyType")}>
            <option value="">Todas</option>
            {Object.entries(BODY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Preço mín.</Label>
          <Input name="priceMin" type="number" min={0} step={1000} defaultValue={get("priceMin")} placeholder="R$ 0" />
        </FormGroup>

        <FormGroup>
          <Label>Preço máx.</Label>
          <Input name="priceMax" type="number" min={0} step={1000} defaultValue={get("priceMax")} placeholder="Sem limite" />
        </FormGroup>

        <FormGroup>
          <Label>Ano mín.</Label>
          <Select name="yearMin" defaultValue={get("yearMin")}>
            <option value="">Qualquer</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Km máxima</Label>
          <Select name="mileageMax" defaultValue={get("mileageMax")}>
            <option value="">Qualquer</option>
            <option value="10000">Até 10.000 km</option>
            <option value="30000">Até 30.000 km</option>
            <option value="60000">Até 60.000 km</option>
            <option value="100000">Até 100.000 km</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Câmbio</Label>
          <Select name="transmission" defaultValue={get("transmission")}>
            <option value="">Todos</option>
            {Object.entries(TRANSMISSION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Combustível</Label>
          <Select name="fuel" defaultValue={get("fuel")}>
            <option value="">Todos</option>
            {Object.entries(FUEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup className="col-span-2 sm:col-span-1">
          <Label>Cor</Label>
          <Select name="color" defaultValue={get("color")}>
            <option value="">Todas</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormGroup>

        <div className="col-span-2 flex items-end sm:col-span-3 lg:col-span-4 xl:col-span-8">
          <Button type="submit" className="w-full sm:w-auto">
            Aplicar filtros
          </Button>
        </div>
      </form>
    </div>
  );
}
