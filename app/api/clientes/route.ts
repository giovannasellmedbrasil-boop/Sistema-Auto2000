import { NextResponse } from "next/server";
import { z } from "zod";
import { createSalesCustomer, listSalesCustomers } from "@/lib/server/db";
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

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const customers = await listSalesCustomers();
  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["SALES", "MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = salesCustomerInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await createSalesCustomer(parsed.data);
  return NextResponse.json({ customer }, { status: 201 });
}
