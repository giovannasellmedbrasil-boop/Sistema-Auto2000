"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { buildMarketSearchLinks, formatCurrency } from "@/lib/utils";
import type { MarketPriceSample } from "@/lib/types";

// Não fazemos coleta automática de anúncios (scraping) — decisão deliberada
// do projeto: além do risco de violar os termos de uso dos portais, uma
// busca automática que falhasse silenciosamente acabaria mostrando um
// preço desatualizado ou incorreto como se fosse um dado de mercado real.
// Em vez disso, cada plataforma abaixo tem seu próprio campo de registro
// rápido — o vendedor abre a busca real, confere um anúncio comparável de
// verdade e registra o preço ali mesmo, sem precisar digitar a fonte de
// novo nem trocar de formulário. A média é calculada só sobre o que for
// registrado de fato.

export function MarketPricingPanel({
  vehicleId,
  vehicle,
  samples,
}: {
  vehicleId: string;
  vehicle: { brand: string; model: string; version: string; modelYear: number };
  samples: MarketPriceSample[];
}) {
  const router = useRouter();
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const platforms = buildMarketSearchLinks(vehicle);

  async function handleQuickAdd(e: FormEvent<HTMLFormElement>, source: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const price = data.get("price");
    if (!price) return;

    setSavingPlatform(source);
    setErrors((prev) => ({ ...prev, [source]: "" }));
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/market-samples`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, price, url: data.get("url") || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrors((prev) => ({ ...prev, [source]: body?.error ?? "Não foi possível salvar." }));
        return;
      }
      form.reset();
      router.refresh();
    } finally {
      setSavingPlatform(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/market-samples/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {platforms.map((p) => (
          <div
            key={p.label}
            className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3 sm:flex-row sm:items-center"
          >
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-32 shrink-0 items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white"
            >
              {p.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <form onSubmit={(e) => handleQuickAdd(e, p.label)} className="flex flex-1 flex-wrap items-center gap-2">
              <Input name="price" type="number" min={0} step={100} placeholder="Preço encontrado" className="w-36" />
              <Input name="url" type="url" placeholder="Link do anúncio (opcional)" className="min-w-0 flex-1" />
              <Button type="submit" size="sm" variant="outline" disabled={savingPlatform === p.label}>
                {savingPlatform === p.label ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Registrar"}
              </Button>
            </form>
            {errors[p.label] && <p className="text-xs text-danger-500">{errors[p.label]}</p>}
          </div>
        ))}
      </div>

      <div className="border-t border-white/8 pt-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Preços registrados</h4>
        {samples.length === 0 ? (
          <p className="text-sm text-ink-500">Nenhum preço de mercado registrado ainda.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {samples.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink-50/40 px-3.5 py-2.5 text-sm">
                <span className="font-medium text-ink-900">{formatCurrency(s.price)}</span>
                <span className="text-ink-500">{s.source}</span>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-400 hover:underline">
                    ver anúncio
                  </a>
                )}
                <span className="ml-auto text-xs text-ink-500">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-600 hover:bg-danger-500/10 hover:text-danger-500"
                >
                  {deletingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
