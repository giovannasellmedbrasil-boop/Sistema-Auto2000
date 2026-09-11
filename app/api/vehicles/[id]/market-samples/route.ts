import { NextResponse } from "next/server";
import { z } from "zod";
import { addMarketPriceSample, getVehicleById } from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";

const sampleSchema = z.object({
  source: z.string().min(1),
  price: z.coerce.number().min(0),
  url: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = sampleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const sample = await addMarketPriceSample({ vehicleId: id, ...parsed.data, createdBy: session.name });
  return NextResponse.json({ sample }, { status: 201 });
}
