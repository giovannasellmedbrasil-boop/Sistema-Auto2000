import { NextResponse } from "next/server";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { cancelInvoice, getInvoiceById } from "@/lib/server/db";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["SALES", "MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!getInvoiceById(id)) return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });

  const invoice = cancelInvoice(id);
  return NextResponse.json({ invoice });
}
