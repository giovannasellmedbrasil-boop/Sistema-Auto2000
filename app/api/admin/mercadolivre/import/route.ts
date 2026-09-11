import { NextResponse } from "next/server";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { importMercadoLivreVehicles } from "@/lib/server/db";

export async function POST() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await importMercadoLivreVehicles();
  return NextResponse.json(result);
}
