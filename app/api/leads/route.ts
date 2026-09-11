import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead, getVehicleById } from "@/lib/server/db";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo"),
  phone: z.string().trim().min(8, "Informe um telefone válido"),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().optional(),
  vehicleId: z.string().optional(),
  origin: z
    .enum([
      "SITE",
      "WHATSAPP",
      "IA_RECOMMENDATION",
      "TRADE_IN",
      "FINANCING_SIMULATOR",
      "CREDIT_PREANALYSIS",
      "MARKETPLACE",
      "REFERRAL",
      "OTHER",
    ])
    .default("SITE"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { vehicleId, ...rest } = parsed.data;

  if (vehicleId && !(await getVehicleById(vehicleId))) {
    return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });
  }

  const lead = await createLead({
    ...rest,
    email: rest.email || null,
    message: rest.message || null,
    vehicleId: vehicleId ?? null,
  });

  return NextResponse.json({ lead }, { status: 201 });
}
