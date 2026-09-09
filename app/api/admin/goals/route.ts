import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { updateDashboardGoals } from "@/lib/server/db";

const goalsSchema = z.object({
  salesUnitsTarget: z.coerce.number().int().min(0),
  revenueTarget: z.coerce.number().min(0),
});

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = goalsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const goals = updateDashboardGoals(parsed.data);
  return NextResponse.json({ goals });
}
