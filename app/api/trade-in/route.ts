import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead } from "@/lib/server/db";
import { formatCurrency } from "@/lib/utils";

const tradeInSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(8),
  email: z.string().trim().email().optional().or(z.literal("")),
  plate: z.string().trim().min(4),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  version: z.string().trim().optional(),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  mileageKm: z.coerce.number().int().min(0),
  color: z.string().trim().min(1),
  hasFinancing: z.boolean(),
  expectedValue: z.coerce.number().min(0).optional(),
  desiredVehicleSlug: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = tradeInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const message = [
    `Avaliação de usado para troca/venda:`,
    `${d.brand} ${d.model} ${d.version ?? ""} ${d.year} — placa ${d.plate.toUpperCase()}`,
    `${d.mileageKm.toLocaleString("pt-BR")} km, cor ${d.color}`,
    d.hasFinancing ? "Possui financiamento em aberto." : "Sem financiamento.",
    d.expectedValue ? `Valor esperado pelo cliente: ${formatCurrency(d.expectedValue)}.` : null,
    d.desiredVehicleSlug ? `Interesse em troca pelo veículo: ${d.desiredVehicleSlug}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const lead = await createLead({
    name: d.name,
    phone: d.phone,
    email: d.email || null,
    origin: "TRADE_IN",
    message,
    vehicleId: null,
  });

  return NextResponse.json({ lead }, { status: 201 });
}
