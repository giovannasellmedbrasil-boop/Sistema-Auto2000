import { NextResponse } from "next/server";
import { z } from "zod";
import { createNegotiation, listNegotiations } from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";

const financingSchema = z.object({
  financierName: z.string().min(1),
  financedAmount: z.coerce.number().min(0),
  downPayment: z.coerce.number().min(0),
  installments: z.coerce.number().int().min(1),
  status: z.enum([
    "PREPARING_DOCS",
    "SUBMITTED",
    "CREDIT_ANALYSIS",
    "APPROVED",
    "REJECTED",
    "CONTRACT_PENDING_SIGNATURE",
    "CONTRACT_SIGNED",
    "FUNDS_RELEASED",
  ]),
});

const tradeInSchema = z.object({
  plate: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int(),
  mileageKm: z.coerce.number().int().min(0),
  requestedValue: z.coerce.number().min(0),
  marketValue: z.coerce.number().min(0).optional().nullable(),
  storeAppraisalValue: z.coerce.number().min(0).optional().nullable(),
  approvedValue: z.coerce.number().min(0).optional().nullable(),
});

const negotiationInputSchema = z.object({
  customerKind: z.enum(["INDIVIDUAL", "COMPANY"]),
  customerName: z.string().min(1),
  customerDocument: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().optional().nullable(),
  customerMarried: z.boolean().default(false),
  hasRepresentativeProcuration: z.boolean().default(false),
  vehicleId: z.string().min(1),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
  saleValue: z.coerce.number().min(0),
  paymentMethod: z.enum(["CASH", "FINANCING"]),
  financing: financingSchema.optional().nullable(),
  hasTradeIn: z.boolean().default(false),
  tradeIn: tradeInSchema.optional().nullable(),
  vehicleCondition: z.enum(["NEW", "USED"]),
  needsTransfer: z.boolean().default(true),
  interstate: z.boolean().default(false),
  needsCourier: z.boolean().default(false),
  documentationResponsible: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const allNegotiations = await listNegotiations({
    q: searchParams.get("q") ?? undefined,
    sellerId: searchParams.get("sellerId") ?? undefined,
    vehicleId: searchParams.get("vehicleId") ?? undefined,
    status: (searchParams.get("status") as never) ?? undefined,
    bucket: (searchParams.get("bucket") as never) ?? undefined,
    paymentMethod: (searchParams.get("paymentMethod") as never) ?? undefined,
    financierName: searchParams.get("financierName") ?? undefined,
    documentationResponsible: searchParams.get("documentationResponsible") ?? undefined,
  });
  const negotiations = allNegotiations.filter((n) => (session.role === "SALES" ? n.sellerId === session.id : true));

  return NextResponse.json({ negotiations });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["SALES", "MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = negotiationInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const negotiation = await createNegotiation(parsed.data);
  return NextResponse.json({ negotiation }, { status: 201 });
}
