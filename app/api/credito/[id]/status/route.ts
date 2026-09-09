import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/server/auth";
import { updateCreditAnalysisCommercialStatus } from "@/lib/server/db";

const schema = z.object({
  status: z.enum([
    "NEW",
    "CREDIT_CHECKED",
    "SIMULATING",
    "PROPOSAL_SENT",
    "AWAITING_BANK",
    "APPROVED_BY_FINANCIER",
    "REJECTED_BY_FINANCIER",
    "SALE_COMPLETED",
  ]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Status inválido." }, { status: 400 });

  const updated = updateCreditAnalysisCommercialStatus(id, parsed.data.status);
  if (!updated) return NextResponse.json({ error: "Consulta não encontrada." }, { status: 404 });

  return NextResponse.json({ analysis: updated });
}
