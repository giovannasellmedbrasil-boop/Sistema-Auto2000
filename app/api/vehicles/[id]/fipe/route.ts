import { NextResponse } from "next/server";
import { z } from "zod";
import { addFipeQuote, getFipeLink, getVehicleById, setFipeLink } from "@/lib/server/db";
import { getFipeValue } from "@/lib/server/fipe";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";

const linkSchema = z.object({
  brandCode: z.string().min(1),
  brandName: z.string().min(1),
  modelCode: z.string().min(1),
  modelName: z.string().min(1),
  yearCode: z.string().min(1),
  yearLabel: z.string().min(1),
});

async function queryAndStoreQuote(vehicleId: string, brandCode: string, modelCode: string, yearCode: string) {
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

// Vincula o veículo a um modelo/ano da FIPE e já consulta o valor atual.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  if (!checkRateLimit(`fipe:${session.id}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas consultas à FIPE em pouco tempo." }, { status: 429 });
  }

  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const link = await setFipeLink({
    vehicleId: id,
    fipeBrandCode: parsed.data.brandCode,
    fipeBrandName: parsed.data.brandName,
    fipeModelCode: parsed.data.modelCode,
    fipeModelName: parsed.data.modelName,
    fipeYearCode: parsed.data.yearCode,
    fipeYearLabel: parsed.data.yearLabel,
  });
  const { quote, error } = await queryAndStoreQuote(id, parsed.data.brandCode, parsed.data.modelCode, parsed.data.yearCode);

  return NextResponse.json({ link, quote, error }, { status: 201 });
}

// Refaz a consulta FIPE usando o vínculo já salvo (atualização periódica).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  if (!checkRateLimit(`fipe:${session.id}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas consultas à FIPE em pouco tempo." }, { status: 429 });
  }

  const { id } = await params;
  const link = await getFipeLink(id);
  if (!link) return NextResponse.json({ error: "Este veículo ainda não está vinculado à FIPE." }, { status: 400 });

  const { quote, error } = await queryAndStoreQuote(id, link.fipeBrandCode, link.fipeModelCode, link.fipeYearCode);
  if (!quote) return NextResponse.json({ error }, { status: 502 });
  return NextResponse.json({ quote });
}
