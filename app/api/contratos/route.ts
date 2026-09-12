import { NextResponse } from "next/server";
import { z } from "zod";
import { createContract, listContracts } from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";

const contractInputSchema = z.object({
  type: z.enum(["CONSIGNACAO", "VENDA_TROCA", "RECIBO_COMPRA"]),
  fields: z.record(z.string(), z.string()),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const contracts = await listContracts();
  return NextResponse.json({ contracts });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["SALES", "MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contractInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const contract = await createContract(parsed.data);
  return NextResponse.json({ contract }, { status: 201 });
}
