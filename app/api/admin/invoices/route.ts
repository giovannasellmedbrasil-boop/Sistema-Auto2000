import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { createInvoice, getVehicleById, listInvoices } from "@/lib/server/db";
import { maskDocument, onlyDigits } from "@/lib/utils";

const invoiceSchema = z.object({
  saleId: z.string().optional().nullable(),
  vehicleId: z.string().min(1, "Selecione o veículo"),
  buyerName: z.string().trim().min(2, "Informe o nome do comprador"),
  buyerDocument: z
    .string()
    .transform(onlyDigits)
    .pipe(z.string().refine((v) => v.length === 11 || v.length === 14, "CPF (11 dígitos) ou CNPJ (14 dígitos)")),
  value: z.coerce.number().min(0.01, "Informe o valor da nota"),
  notes: z.string().trim().optional().nullable(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["SALES", "MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const invoices = listInvoices().map((inv) => ({ ...inv, buyerDocument: maskDocument(inv.buyerDocument) }));
  return NextResponse.json({ invoices });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["SALES", "MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!getVehicleById(parsed.data.vehicleId)) {
    return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });
  }

  const invoice = createInvoice({ ...parsed.data, requestedBy: session.name });
  return NextResponse.json({ invoice }, { status: 201 });
}
