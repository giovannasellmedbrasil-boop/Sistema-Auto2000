import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { getCompanyFiscalProfile, updateCompanyFiscalProfile } from "@/lib/server/db";
import { onlyDigits } from "@/lib/utils";

const fiscalProfileSchema = z.object({
  cnpj: z.string().transform(onlyDigits).pipe(z.string().length(14, "CNPJ deve ter 14 dígitos")),
  razaoSocial: z.string().trim().min(2),
  nomeFantasia: z.string().trim().optional().nullable(),
  inscricaoEstadual: z.string().trim().min(1),
  regimeTributario: z.enum(["SIMPLES_NACIONAL", "LUCRO_PRESUMIDO", "LUCRO_REAL"]),
  cep: z.string().transform(onlyDigits).pipe(z.string().length(8, "CEP deve ter 8 dígitos")),
  logradouro: z.string().trim().min(1),
  numero: z.string().trim().min(1),
  bairro: z.string().trim().min(1),
  municipio: z.string().trim().min(1),
  ibgeMunicipioCode: z.string().trim().optional().nullable(),
  uf: z.string().trim().length(2),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.json({ profile: getCompanyFiscalProfile() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = fiscalProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const profile = updateCompanyFiscalProfile(parsed.data);
  return NextResponse.json({ profile });
}
