import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteNegotiation,
  getChecklistItems,
  getNegotiationById,
  getNegotiationDocuments,
  getNegotiationHistory,
  getVehicleById,
  updateNegotiation,
} from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { classifyNegotiation, computeProgressPercent, getMissingItems, isDeliveryReady } from "@/lib/server/documentChecklist";
import type { NegotiationWithChecklist } from "@/lib/types";

async function loadNegotiationDetail(id: string): Promise<NegotiationWithChecklist | null> {
  const negotiation = await getNegotiationById(id);
  if (!negotiation) return null;
  const [items, vehicle, documents, history] = await Promise.all([
    getChecklistItems(id),
    getVehicleById(negotiation.vehicleId),
    getNegotiationDocuments(id),
    getNegotiationHistory(id),
  ]);
  return {
    negotiation,
    vehicle: vehicle
      ? { id: vehicle.id, brand: vehicle.brand, model: vehicle.model, version: vehicle.version, modelYear: vehicle.modelYear, slug: vehicle.slug }
      : null,
    items,
    documents,
    history,
    progressPercent: computeProgressPercent(items),
    bucket: classifyNegotiation(items),
    deliveryReady: isDeliveryReady(items),
    missingItems: getMissingItems(items),
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const detail = await loadNegotiationDetail(id);
  if (!detail) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  if (session.role === "SALES" && detail.negotiation.sellerId !== session.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  return NextResponse.json(detail);
}

const patchSchema = z.object({
  customerKind: z.enum(["INDIVIDUAL", "COMPANY"]).optional(),
  customerName: z.string().min(1).optional(),
  customerDocument: z.string().min(1).optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerAddress: z.string().min(1).optional(),
  customerCep: z.string().min(1).optional(),
  hasRepresentativeProcuration: z.boolean().optional(),
  vehicleId: z.string().min(1).optional(),
  sellerId: z.string().min(1).optional(),
  sellerName: z.string().min(1).optional(),
  saleValue: z.coerce.number().min(0).optional(),
  paymentMethod: z
    .enum(["CASH", "FINANCING", "CASH_FINANCING_TRADE_IN", "CASH_TRADE_IN", "CASH_FINANCING", "FINANCING_TRADE_IN"])
    .optional(),
  financing: z
    .object({
      financierName: z.string().min(1),
      financedAmount: z.coerce.number().min(0),
      downPayment: z.coerce.number().min(0),
      installments: z.coerce.number().int().min(1),
      installmentValue: z.coerce.number().min(0),
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
    })
    .optional()
    .nullable(),
  hasTradeIn: z.boolean().optional(),
  tradeIn: z
    .object({
      plate: z.string(),
      brand: z.string(),
      model: z.string(),
      manufactureYear: z.coerce.number(),
      modelYear: z.coerce.number(),
      mileageKm: z.coerce.number(),
      requestedValue: z.coerce.number(),
      marketValue: z.coerce.number().optional().nullable(),
      storeAppraisalValue: z.coerce.number().optional().nullable(),
      approvedValue: z.coerce.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  vehicleCondition: z.enum(["NEW", "USED"]).optional(),
  needsTransfer: z.boolean().optional(),
  interstate: z.boolean().optional(),
  needsCourier: z.boolean().optional(),
  transferStage: z.enum(["SALE_DONE", "DOCS_REVIEWED", "ATPV", "COURIER", "DETRAN", "COMPLETED"]).optional(),
  documentationResponsible: z.string().optional().nullable(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const negotiation = await getNegotiationById(id);
  if (!negotiation) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  if (session.role === "SALES" && negotiation.sellerId !== session.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const changedFields = Object.keys(parsed.data);
  const historyMessage =
    changedFields.length > 0 ? `Atualização: ${changedFields.join(", ")}` : undefined;

  const updated = await updateNegotiation(id, parsed.data, { actor: session.name, historyMessage });
  return NextResponse.json({ negotiation: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteNegotiation(id);
  if (!ok) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
