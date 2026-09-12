import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteSalesCustomer, getSalesCustomerById, updateSalesCustomer } from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";

const salesCustomerInputSchema = z.object({
  name: z.string().min(1),
  document: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().optional().nullable(),
  address: z.string().min(1),
  cep: z.string().min(1),
  cnhNumber: z.string().min(1),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const customer = await getSalesCustomerById(id);
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["SALES", "MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = salesCustomerInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await updateSalesCustomer(id, parsed.data);
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteSalesCustomer(id);
  if (!ok) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
