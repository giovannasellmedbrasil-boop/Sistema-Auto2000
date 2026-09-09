import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/server/auth";
import { advanceLeadStage, getLeadById, markLeadLost, markLeadSold, updateLead } from "@/lib/server/db";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("contacted") }),
  z.object({ action: z.literal("visit") }),
  z.object({ action: z.literal("testDrive") }),
  z.object({ action: z.literal("proposal"), proposalValue: z.coerce.number().min(0).optional() }),
  z.object({
    action: z.literal("sold"),
    finalPrice: z.coerce.number().min(0),
    paymentMethod: z.string().trim().min(1),
  }),
  z.object({
    action: z.literal("lost"),
    reason: z.enum([
      "PRICE",
      "FINANCING_DENIED",
      "BOUGHT_COMPETITOR",
      "GAVE_UP",
      "NO_RESPONSE",
      "VEHICLE_SOLD",
      "VEHICLE_UNAVAILABLE",
      "TRADE_IN_REJECTED",
      "OTHER",
    ]),
  }),
  z.object({ action: z.literal("assign"), ownerId: z.string() }),
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  if (!getLeadById(id)) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  switch (data.action) {
    case "contacted":
    case "visit":
    case "testDrive": {
      const stageMap = { contacted: "contacted", visit: "visit", testDrive: "testDrive" } as const;
      const lead = advanceLeadStage(id, stageMap[data.action]);
      return NextResponse.json({ lead });
    }
    case "proposal": {
      const lead = advanceLeadStage(id, "proposal", { proposalValue: data.proposalValue });
      return NextResponse.json({ lead });
    }
    case "sold": {
      const result = markLeadSold(id, { finalPrice: data.finalPrice, paymentMethod: data.paymentMethod });
      if (!result) {
        return NextResponse.json(
          { error: "Lead sem veículo, vendedor ou canal definidos — não é possível registrar a venda." },
          { status: 400 }
        );
      }
      return NextResponse.json(result);
    }
    case "lost": {
      const lead = markLeadLost(id, data.reason);
      return NextResponse.json({ lead });
    }
    case "assign": {
      const lead = updateLead(id, { ownerId: data.ownerId });
      return NextResponse.json({ lead });
    }
  }
}
