import { NextResponse } from "next/server";
import { getNegotiationById, markNegotiationDelivered } from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Apenas gerência pode confirmar a entrega." }, { status: 403 });
  }

  const { id } = await params;
  const negotiation = await getNegotiationById(id);
  if (!negotiation) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });

  const result = await markNegotiationDelivered(id, session.name);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });

  return NextResponse.json({ negotiation: result.negotiation });
}
