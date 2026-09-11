import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { getLatestFipeQuote, listMarketPriceSamples, listVehiclesAdmin } from "@/lib/server/db";
import { computeMarketStats } from "@/lib/pricing/stats";
import { PricingTable, type PricingRow } from "@/components/precificacao/PricingTable";

export const metadata: Metadata = { title: "Precificação", robots: { index: false } };

export default async function PrecificacaoPage() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) redirect("/admin");

  const vehicles = (await listVehiclesAdmin()).filter((v) => v.status !== "SOLD");

  const rows: PricingRow[] = await Promise.all(
    vehicles.map(async (vehicle) => {
      const [quote, samples] = await Promise.all([getLatestFipeQuote(vehicle.id), listMarketPriceSamples(vehicle.id)]);
      return {
        vehicle,
        fipeValue: quote?.value ?? null,
        marketStats: computeMarketStats(samples.map((s) => s.price)),
      };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Precificação</h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Compare o preço de cada veículo com a tabela FIPE (consulta real, API oficial FIPE) e com
          preços de mercado registrados pela equipe. Abra um veículo para vincular a FIPE e
          registrar comparáveis.
        </p>
      </div>
      <PricingTable rows={rows} />
    </div>
  );
}
