"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";

const PRICE_OPTIONS = [
  { label: "Qualquer preço", value: "" },
  { label: "Até R$ 60 mil", value: "0-60000" },
  { label: "Até R$ 100 mil", value: "0-100000" },
  { label: "Até R$ 150 mil", value: "0-150000" },
  { label: "Acima de R$ 150 mil", value: "150000-" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = ["", ...Array.from({ length: 10 }, (_, i) => String(currentYear - i))];

export function HeroSearch({ brands }: { brands: string[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (brand) params.set("brand", brand);
    if (year) params.set("yearMin", year);
    if (price) {
      const [min, max] = price.split("-");
      if (min) params.set("priceMin", min);
      if (max) params.set("priceMax", max);
    }
    router.push(`/estoque?${params.toString()}`);
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-ink-100 p-3 shadow-[0_20px_60px_-20px_rgba(255,176,0,0.25)] sm:p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/15 px-3.5 py-3 focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-500/15">
          <Search className="h-4.5 w-4.5 shrink-0 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Qual carro você está procurando? Ex: Corolla, Compass, SUV automático..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Marca">
            <option value="">Marca</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Ano">
            <option value="">Ano</option>
            {YEAR_OPTIONS.filter(Boolean).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-label="Preço"
            className="col-span-2 sm:col-span-1"
          >
            {PRICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button type="submit" size="lg" className="flex-1">
            <Search className="h-4.5 w-4.5" />
            Buscar veículos
          </Button>
          <Button href="/encontre-seu-carro" variant="outline" size="lg" className="flex-1">
            <Sparkles className="h-4.5 w-4.5 text-accent-500" />
            Encontrar meu carro com IA
          </Button>
        </div>
      </form>
    </div>
  );
}
