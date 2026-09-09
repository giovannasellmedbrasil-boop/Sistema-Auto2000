import { NextResponse } from "next/server";
import { z } from "zod";
import { getNegotiationById, updateChecklistItem } from "@/lib/server/db";
import { getAdminSession } from "@/lib/server/auth";

const patchSchema = z.object({
  status: z.enum(["PENDING", "RECEIVED", "APPROVED", "REJECTED", "AWAITING_THIRD_PARTY", "NOT_APPLICABLE"]).optional(),
  responsible: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, itemId } = await params;
  const negotiation = getNegotiationById(id);
  if (!negotiation) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  if (session.role === "SALES" && negotiation.sellerId !== session.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const item = updateChecklistItem(id, itemId, parsed.data, session.name);
  if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

  return NextResponse.json({ item });
}
