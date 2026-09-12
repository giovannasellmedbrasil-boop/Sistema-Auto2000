import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteContract, getContractById, updateContract } from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";

const contractInputSchema = z.object({
  type: z.enum(["CONSIGNACAO", "VENDA_TROCA", "RECIBO_COMPRA"]),
  fields: z.record(z.string(), z.string()),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  return NextResponse.json({ contract });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["SALES", "MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = contractInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const contract = await updateContract(id, parsed.data);
  if (!contract) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  return NextResponse.json({ contract });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteContract(id);
  if (!ok) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
