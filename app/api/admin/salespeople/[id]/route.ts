import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { deleteSalesperson, updateSalesperson } from "@/lib/server/db";

const salespersonPatchSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(8).optional(),
  role: z.string().trim().min(1).optional(),
  goalUnits: z.coerce.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = salespersonPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const salesperson = await updateSalesperson(id, parsed.data);
  if (!salesperson) return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 });
  return NextResponse.json({ salesperson });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteSalesperson(id);
  if (!ok) return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
