import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { createSalesperson, listSalespeople } from "@/lib/server/db";

const salespersonSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do vendedor"),
  email: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().min(8, "Informe um telefone válido"),
  role: z.string().trim().min(1).default("Consultor de vendas"),
  goalUnits: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({ salespeople: listSalespeople() });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = salespersonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const salesperson = createSalesperson({ ...parsed.data, photoSeed: parsed.data.email });
  return NextResponse.json({ salesperson }, { status: 201 });
}
