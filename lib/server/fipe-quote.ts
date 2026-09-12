// Consulta o valor FIPE de um vínculo já salvo e grava no histórico de
// cotações do veículo. Compartilhado entre a rota manual
// (app/api/vehicles/[id]/fipe/route.ts) e o cron de atualização diária
// (app/api/cron/fipe-refresh/route.ts) para as duas nunca divergirem.

import { addFipeQuote } from "@/lib/server/db";
import { getFipeValue } from "@/lib/server/fipe";
import type { FipeQuote } from "@/lib/types";

export async function queryAndStoreQuote(
  vehicleId: string,
  brandCode: string,
  modelCode: string,
  yearCode: string
): Promise<{ quote: FipeQuote | null; error: string | null }> {
  const result = await getFipeValue(brandCode, modelCode, yearCode);
  if (!result.ok) return { quote: null, error: result.error };
  const quote = await addFipeQuote({
    vehicleId,
    fipeCode: result.data.fipeCode,
    value: result.data.value,
    referenceMonth: result.data.referenceMonth,
    fuel: result.data.fuel,
  });
  return { quote, error: null };
}
