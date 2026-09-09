"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { formatCurrency, formatKm } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { Check } from "lucide-react";
import Link from "next/link";

interface MatchResult {
  vehicle: Vehicle;
  score: number;
  reasons: string[];
}

const EXAMPLES = [
  "Quero um SUV automático, econômico, até R$ 100 mil e tenho R$ 25 mil de entrada.",
  "Sedã automático, flex, até R$ 140 mil.",
  "Picape 4x4 diesel para trabalho, até R$ 200 mil.",
];

export function VehicleMatchFinder() {
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (text.trim().length < 3) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMatches(data.matches);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Quero um SUV automático, econômico, até R$ 100 mil e tenho R$ 25 mil de entrada."
            className="min-h-28"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className="rounded-full border border-ink-200 px-3 py-1.5 text-xs text-ink-500 hover:border-accent-400 hover:text-accent-700"
              >
                {ex}
              </button>
            ))}
          </div>
          <Button type="submit" size="lg" disabled={status === "loading"} className="w-fit">
            {status === "loading" ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Sparkles className="h-4.5 w-4.5" />
            )}
            Buscar recomendações
          </Button>
          {status === "error" && (
            <p className="text-sm text-danger-500">Não foi possível buscar agora. Tente novamente.</p>
          )}
        </form>
      </Card>

      {matches && (
        <div className="flex flex-col gap-5">
          {matches.length === 0 ? (
            <p className="text-sm text-ink-500">
              Não encontramos veículos compatíveis no estoque atual para essa descrição. Tente
              ajustar o orçamento ou fale com um consultor pelo WhatsApp.
            </p>
          ) : (
            matches.map(({ vehicle, score, reasons }, i) => (
              <Card key={vehicle.id} className="flex flex-col gap-4 overflow-hidden p-0 sm:flex-row">
                <VehicleImage
                  seed={vehicle.id}
                  label={i === 0 ? "Melhor opção" : undefined}
                  className="h-48 w-full sm:h-auto sm:w-56 shrink-0"
                />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                      {score}% compatível
                    </span>
                    <span className="text-lg font-semibold text-ink-950">
                      {formatCurrency(vehicle.price)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-accent-400">
                      {vehicle.brand} {vehicle.model} {vehicle.version}
                    </h3>
                    <p className="text-sm text-ink-500">
                      {vehicle.modelYear} · {formatKm(vehicle.mileageKm)}
                    </p>
                  </div>
                  {reasons.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-600">
                        Por que recomendamos este veículo?
                      </p>
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {reasons.map((r) => (
                          <li key={r} className="inline-flex items-center gap-1.5 text-sm text-ink-600">
                            <Check className="h-3.5 w-3.5 text-success-500" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link
                    href={`/veiculos/${vehicle.slug}`}
                    className="mt-auto text-sm font-medium text-accent-700 hover:text-accent-800"
                  >
                    Ver veículo →
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
