import { NextResponse } from "next/server";
import { deleteMarketPriceSample } from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; sampleId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { sampleId } = await params;
  const ok = deleteMarketPriceSample(sampleId);
  if (!ok) return NextResponse.json({ error: "Amostra não encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
