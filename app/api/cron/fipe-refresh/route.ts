import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getFipeLink, listVehiclesAdmin, setFipeLink } from "@/lib/server/db";
import { matchVehicleToFipe } from "@/lib/server/fipe-match";
import { queryAndStoreQuote } from "@/lib/server/fipe-quote";

export const maxDuration = 60;

interface VehicleResult {
  vehicleId: string;
  ok: boolean;
  reason?: string;
}

// Agendado em vercel.json (crons) — roda uma vez por dia e atualiza a
// cotação FIPE de todo o estoque, vinculando automaticamente os veículos
// que ainda não têm um vínculo salvo (mesma heurística de
// FipeLinkForm.tsx, ver lib/server/fipe-match.ts).
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // vercel.json é compartilhado pelos projetos "site" e "sistema" — o cron
  // dispara nos dois deploys, mas só um deve de fato processar (os dois
  // usam o mesmo banco desde a unificação de 2026-09-11); SYSTEM_ONLY_HOME
  // só existe no projeto do sistema.
  if (process.env.SYSTEM_ONLY_HOME !== "true") {
    return NextResponse.json({ skipped: true });
  }

  const vehicles = (await listVehiclesAdmin()).filter((v) => v.status !== "SOLD");
  const results: VehicleResult[] = [];

  for (const vehicle of vehicles) {
    try {
      let link = await getFipeLink(vehicle.id);
      if (!link) {
        const matched = await matchVehicleToFipe(vehicle);
        if (!matched) {
          results.push({ vehicleId: vehicle.id, ok: false, reason: "Sem correspondência na tabela FIPE" });
          continue;
        }
        link = await setFipeLink({
          vehicleId: vehicle.id,
          fipeBrandCode: matched.brandCode,
          fipeBrandName: matched.brandName,
          fipeModelCode: matched.modelCode,
          fipeModelName: matched.modelName,
          fipeYearCode: matched.yearCode,
          fipeYearLabel: matched.yearLabel,
        });
      }

      const { quote, error } = await queryAndStoreQuote(
        vehicle.id,
        link.fipeBrandCode,
        link.fipeModelCode,
        link.fipeYearCode
      );
      results.push({ vehicleId: vehicle.id, ok: Boolean(quote), reason: error ?? undefined });
    } catch (err) {
      results.push({
        vehicleId: vehicle.id,
        ok: false,
        reason: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  return NextResponse.json({
    processedAt: new Date().toISOString(),
    total: vehicles.length,
    succeeded: results.filter((r) => r.ok).length,
    results,
  });
}
