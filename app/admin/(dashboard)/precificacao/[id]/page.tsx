import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import {
  getFipeLink,
  getVehicleById,
  listFipeQuoteHistory,
  listMarketPriceSamples,
} from "@/lib/server/db";
import { computeMarketStats } from "@/lib/pricing/stats";
import { formatCurrency, formatKm } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { FipeLinkForm } from "@/components/precificacao/FipeLinkForm";
import { RefreshFipeButton } from "@/components/precificacao/RefreshFipeButton";
import { FipeHistoryList } from "@/components/precificacao/FipeHistoryList";
import { MarketPricingPanel } from "@/components/precificacao/MarketPricingPanel";
import { PricingComparisonCard } from "@/components/precificacao/PricingComparisonCard";

export const metadata: Metadata = { title: "Precificação do veículo", robots: { index: false } };

export default async function VehiclePricingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) redirect("/admin");

  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) notFound();

  const [fipeLinkRaw, fipeHistory, samples] = await Promise.all([
    getFipeLink(id),
    listFipeQuoteHistory(id),
    listMarketPriceSamples(id),
  ]);
  const fipeLink = fipeLinkRaw ?? null;
  const latestQuote = fipeHistory[0] ?? null;
  const marketStats = computeMarketStats(samples.map((s) => s.price));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">
          {vehicle.brand} {vehicle.model} {vehicle.version} {vehicle.modelYear}
        </h1>
        <p className="text-sm text-ink-500">{formatKm(vehicle.mileageKm)} · {formatCurrency(vehicle.price)}</p>
      </div>

      <PricingComparisonCard currentPrice={vehicle.price} fipeQuote={latestQuote} marketStats={marketStats} />

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-accent-400">Tabela FIPE</h3>
          {fipeLink && <RefreshFipeButton vehicleId={id} />}
        </div>
        {fipeLink && (
          <p className="text-sm text-ink-500">
            Vinculado a: {fipeLink.fipeBrandName} — {fipeLink.fipeModelName} ({fipeLink.fipeYearLabel})
          </p>
        )}
        <FipeLinkForm
          vehicleId={id}
          existingLink={fipeLink}
          vehicle={{ brand: vehicle.brand, model: vehicle.model, version: vehicle.version, modelYear: vehicle.modelYear, fuel: vehicle.fuel }}
        />
        {fipeHistory.length > 0 && (
          <div className="border-t border-white/8 pt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Histórico de consultas</h4>
            <FipeHistoryList quotes={fipeHistory} />
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h3 className="text-base font-semibold text-accent-400">Preço praticado no mercado</h3>
        <p className="text-sm text-ink-500">
          Não fazemos coleta automática de anúncios (scraping) — abra a busca real de cada portal,
          confira um comparável de verdade e registre o preço ali mesmo. A média é calculada de
          verdade sobre o que for registrado.
        </p>
        <MarketPricingPanel
          vehicleId={id}
          vehicle={{ brand: vehicle.brand, model: vehicle.model, version: vehicle.version, modelYear: vehicle.modelYear }}
          samples={samples}
        />
      </Card>
    </div>
  );
}
