import type { ChecklistItem, ChecklistItemStatus, Negotiation, NegotiationHistoryEvent } from "@/lib/types";
import { buildChecklistTemplates } from "@/lib/server/documentChecklist";

// Dados de demonstração do Assistente de Documentação — nenhum cliente, CPF,
// CNPJ ou placa real. Vendedores reaproveitam o mesmo elenco de
// seed-executive-data.ts (sp_001..sp_005) para manter consistência entre os
// módulos de CRM e documentação.

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

interface ItemOverride {
  status: ChecklistItemStatus;
  responsible?: string;
  dueDate?: string;
  note?: string;
}

function buildItems(
  negotiationId: string,
  templates: ReturnType<typeof buildChecklistTemplates>,
  overrides: Record<string, ItemOverride>,
  defaultStatus: ChecklistItemStatus,
  updatedAt: string
): ChecklistItem[] {
  return templates.map((t) => {
    const override = overrides[t.key];
    return {
      id: `${negotiationId}_${t.key}`,
      negotiationId,
      category: t.category,
      key: t.key,
      label: t.label,
      required: t.required ?? true,
      status: override?.status ?? defaultStatus,
      responsible: override?.responsible ?? null,
      dueDate: override?.dueDate ?? null,
      note: override?.note ?? null,
      documentIds: [],
      updatedAt,
    };
  });
}

interface SeedResult {
  negotiation: Negotiation;
  items: ChecklistItem[];
  history: NegotiationHistoryEvent[];
}

function history(negotiationId: string, entries: { message: string; actor: string; daysAgoValue: number }[]): NegotiationHistoryEvent[] {
  return entries.map((e, i) => ({
    id: `${negotiationId}_hist_${i}`,
    negotiationId,
    message: e.message,
    actor: e.actor,
    createdAt: daysAgo(e.daysAgoValue),
  }));
}

const seeds: SeedResult[] = [];

// #1024 — João da Silva · Corolla · financiado · aguardando assinatura +
// comprovante de residência (mesmo exemplo das seções 14/16/25 do briefing).
{
  const id = "neg_001";
  const templates = buildChecklistTemplates({
    customerKind: "INDIVIDUAL",
    customerMarried: false,
    hasRepresentativeProcuration: false,
    paymentMethod: "FINANCING",
    hasTradeIn: false,
    vehicleCondition: "USED",
    needsTransfer: true,
    interstate: false,
    needsCourier: true,
  });
  const items = buildItems(
    id,
    templates,
    {
      comprovante_residencia: { status: "PENDING" },
      fin_contrato_assinado: { status: "PENDING", responsible: "Juliana", dueDate: daysFromNow(2) },
      fin_comprovante_entrada: { status: "PENDING" },
      transf_atpv: { status: "PENDING", responsible: "Juliana", dueDate: daysFromNow(3) },
    },
    "APPROVED",
    daysAgo(1)
  );
  seeds.push({
    negotiation: {
      id,
      code: "#1024",
      customerKind: "INDIVIDUAL",
      customerName: "João da Silva",
      customerDocument: "11122233344",
      customerPhone: "5511988887777",
      customerEmail: "joao.silva@example.com",
      customerMarried: false,
      hasRepresentativeProcuration: false,
      vehicleId: "veh_001",
      sellerId: "sp_002",
      sellerName: "Carlos Menezes",
      saleValue: 139900,
      paymentMethod: "FINANCING",
      financing: {
        financierName: "Banco XYZ",
        financedAmount: 99900,
        downPayment: 40000,
        installments: 48,
        status: "CONTRACT_PENDING_SIGNATURE",
      },
      hasTradeIn: false,
      tradeIn: null,
      vehicleCondition: "USED",
      needsTransfer: true,
      interstate: false,
      needsCourier: true,
      transferStage: "DOCS_REVIEWED",
      status: "IN_PROGRESS",
      documentationResponsible: "Juliana",
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
    items,
    history: history(id, [
      { message: "Venda cadastrada", actor: "Carlos Menezes", daysAgoValue: 4 },
      { message: "RG ou CNH anexado", actor: "João da Silva", daysAgoValue: 4 },
      { message: "Financiamento enviado ao Banco XYZ", actor: "Carlos Menezes", daysAgoValue: 3 },
      { message: "Crédito aprovado", actor: "Banco XYZ", daysAgoValue: 2 },
      { message: "Comprovante de residência marcado como pendente", actor: "Juliana", daysAgoValue: 1 },
    ]),
  });
}

// #1025 — Maria Souza · T-Cross · aguardando despachante (ATPV-e).
{
  const id = "neg_002";
  const templates = buildChecklistTemplates({
    customerKind: "INDIVIDUAL",
    customerMarried: true,
    hasRepresentativeProcuration: false,
    paymentMethod: "FINANCING",
    hasTradeIn: false,
    vehicleCondition: "USED",
    needsTransfer: true,
    interstate: false,
    needsCourier: true,
  });
  const items = buildItems(
    id,
    templates,
    {
      transf_atpv: { status: "AWAITING_THIRD_PARTY", responsible: "Juliana", dueDate: daysFromNow(1) },
      transf_docs_despachante: { status: "AWAITING_THIRD_PARTY", responsible: "Juliana" },
      transf_processo_detran: { status: "PENDING" },
    },
    "APPROVED",
    daysAgo(1)
  );
  seeds.push({
    negotiation: {
      id,
      code: "#1025",
      customerKind: "INDIVIDUAL",
      customerName: "Maria Souza",
      customerDocument: "22233344455",
      customerPhone: "5511977776666",
      customerEmail: "maria.souza@example.com",
      customerMarried: true,
      hasRepresentativeProcuration: false,
      vehicleId: "veh_004",
      sellerId: "sp_003",
      sellerName: "Mariana Duarte",
      saleValue: 118900,
      paymentMethod: "FINANCING",
      financing: {
        financierName: "Financeira Automotiva Sul",
        financedAmount: 88900,
        downPayment: 30000,
        installments: 36,
        status: "CONTRACT_SIGNED",
      },
      hasTradeIn: false,
      tradeIn: null,
      vehicleCondition: "USED",
      needsTransfer: true,
      interstate: false,
      needsCourier: true,
      transferStage: "COURIER",
      status: "IN_PROGRESS",
      documentationResponsible: "Juliana",
      createdAt: daysAgo(6),
      updatedAt: daysAgo(1),
    },
    items,
    history: history(id, [
      { message: "Venda cadastrada", actor: "Mariana Duarte", daysAgoValue: 6 },
      { message: "Contrato de financiamento assinado", actor: "Maria Souza", daysAgoValue: 3 },
      { message: "Documentos enviados ao despachante", actor: "Juliana", daysAgoValue: 1 },
    ]),
  });
}

// #1026 — Pedro Lima · HR-V · aguardando análise/contrato do banco.
{
  const id = "neg_003";
  const templates = buildChecklistTemplates({
    customerKind: "INDIVIDUAL",
    customerMarried: false,
    hasRepresentativeProcuration: false,
    paymentMethod: "FINANCING",
    hasTradeIn: false,
    vehicleCondition: "NEW",
    needsTransfer: true,
    interstate: false,
    needsCourier: false,
  });
  const items = buildItems(
    id,
    templates,
    {
      fin_contrato_assinado: { status: "AWAITING_THIRD_PARTY", responsible: "Financeira Automotiva Sul" },
      fin_aprovacao_credito: { status: "AWAITING_THIRD_PARTY", responsible: "Financeira Automotiva Sul" },
    },
    "APPROVED",
    daysAgo(2)
  );
  seeds.push({
    negotiation: {
      id,
      code: "#1026",
      customerKind: "INDIVIDUAL",
      customerName: "Pedro Lima",
      customerDocument: "33344455566",
      customerPhone: "5511966665555",
      customerEmail: "pedro.lima@example.com",
      customerMarried: false,
      hasRepresentativeProcuration: false,
      vehicleId: "veh_007",
      sellerId: "sp_002",
      sellerName: "Carlos Menezes",
      saleValue: 149900,
      paymentMethod: "FINANCING",
      financing: {
        financierName: "Financeira Automotiva Sul",
        financedAmount: 109900,
        downPayment: 40000,
        installments: 60,
        status: "CREDIT_ANALYSIS",
      },
      hasTradeIn: false,
      tradeIn: null,
      vehicleCondition: "NEW",
      needsTransfer: true,
      interstate: false,
      needsCourier: false,
      transferStage: "SALE_DONE",
      status: "IN_PROGRESS",
      documentationResponsible: "Carlos Menezes",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
    },
    items,
    history: history(id, [
      { message: "Venda cadastrada", actor: "Carlos Menezes", daysAgoValue: 3 },
      { message: "Documentação enviada para análise", actor: "Carlos Menezes", daysAgoValue: 2 },
    ]),
  });
}

// #1027 — Comercial Lima Ltda · Compass · pendência crítica (contrato social recusado).
{
  const id = "neg_004";
  const templates = buildChecklistTemplates({
    customerKind: "COMPANY",
    customerMarried: false,
    hasRepresentativeProcuration: true,
    paymentMethod: "CASH",
    hasTradeIn: false,
    vehicleCondition: "USED",
    needsTransfer: true,
    interstate: false,
    needsCourier: false,
  });
  const items = buildItems(
    id,
    templates,
    {
      contrato_social: { status: "REJECTED", note: "Documento ilegível — solicitar novo envio." },
      procuracao: { status: "PENDING" },
    },
    "APPROVED",
    daysAgo(1)
  );
  seeds.push({
    negotiation: {
      id,
      code: "#1027",
      customerKind: "COMPANY",
      customerName: "Comercial Lima Ltda",
      customerDocument: "12345678000199",
      customerPhone: "5511955554444",
      customerEmail: "financeiro@comerciallima.example.com",
      customerMarried: false,
      hasRepresentativeProcuration: true,
      vehicleId: "veh_002",
      sellerId: "sp_004",
      sellerName: "Fernanda Ribeiro",
      saleValue: 139900,
      paymentMethod: "CASH",
      financing: null,
      hasTradeIn: false,
      tradeIn: null,
      vehicleCondition: "USED",
      needsTransfer: true,
      interstate: false,
      needsCourier: false,
      transferStage: "DOCS_REVIEWED",
      status: "IN_PROGRESS",
      documentationResponsible: "Fernanda Ribeiro",
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
    items,
    history: history(id, [
      { message: "Venda cadastrada", actor: "Fernanda Ribeiro", daysAgoValue: 5 },
      { message: "Contrato social anexado", actor: "Comercial Lima Ltda", daysAgoValue: 2 },
      { message: "Contrato social recusado — documento ilegível", actor: "Fernanda Ribeiro", daysAgoValue: 1 },
    ]),
  });
}

// #1028 — Ana Pereira · Onix · à vista, tudo completo, pronto para entrega.
{
  const id = "neg_005";
  const templates = buildChecklistTemplates({
    customerKind: "INDIVIDUAL",
    customerMarried: false,
    hasRepresentativeProcuration: false,
    paymentMethod: "CASH",
    hasTradeIn: false,
    vehicleCondition: "USED",
    needsTransfer: true,
    interstate: false,
    needsCourier: false,
  });
  const items = buildItems(id, templates, {}, "APPROVED", daysAgo(1));
  seeds.push({
    negotiation: {
      id,
      code: "#1028",
      customerKind: "INDIVIDUAL",
      customerName: "Ana Pereira",
      customerDocument: "44455566677",
      customerPhone: "5511944443333",
      customerEmail: "ana.pereira@example.com",
      customerMarried: false,
      hasRepresentativeProcuration: false,
      vehicleId: "veh_005",
      sellerId: "sp_005",
      sellerName: "Bruno Castilho",
      saleValue: 74900,
      paymentMethod: "CASH",
      financing: null,
      hasTradeIn: false,
      tradeIn: null,
      vehicleCondition: "USED",
      needsTransfer: true,
      interstate: false,
      needsCourier: false,
      transferStage: "COMPLETED",
      status: "READY_FOR_DELIVERY",
      documentationResponsible: "Bruno Castilho",
      createdAt: daysAgo(7),
      updatedAt: daysAgo(1),
    },
    items,
    history: history(id, [
      { message: "Venda cadastrada", actor: "Bruno Castilho", daysAgoValue: 7 },
      { message: "Documentação completa", actor: "Bruno Castilho", daysAgoValue: 1 },
      { message: "Veículo liberado para entrega", actor: "Bruno Castilho", daysAgoValue: 1 },
    ]),
  });
}

// #1029 — Rafael Nogueira · Kicks · financiado, já entregue.
{
  const id = "neg_006";
  const templates = buildChecklistTemplates({
    customerKind: "INDIVIDUAL",
    customerMarried: true,
    hasRepresentativeProcuration: false,
    paymentMethod: "FINANCING",
    hasTradeIn: false,
    vehicleCondition: "USED",
    needsTransfer: true,
    interstate: false,
    needsCourier: true,
  });
  const items = buildItems(id, templates, {}, "APPROVED", daysAgo(10));
  seeds.push({
    negotiation: {
      id,
      code: "#1029",
      customerKind: "INDIVIDUAL",
      customerName: "Rafael Nogueira",
      customerDocument: "55566677788",
      customerPhone: "5511933332222",
      customerEmail: "rafael.nogueira@example.com",
      customerMarried: true,
      hasRepresentativeProcuration: false,
      vehicleId: "veh_009",
      sellerId: "sp_001",
      sellerName: "João Ferreira",
      saleValue: 104900,
      paymentMethod: "FINANCING",
      financing: {
        financierName: "Banco XYZ",
        financedAmount: 74900,
        downPayment: 30000,
        installments: 48,
        status: "FUNDS_RELEASED",
      },
      hasTradeIn: false,
      tradeIn: null,
      vehicleCondition: "USED",
      needsTransfer: true,
      interstate: false,
      needsCourier: true,
      transferStage: "COMPLETED",
      status: "DELIVERED",
      documentationResponsible: "João Ferreira",
      createdAt: daysAgo(18),
      updatedAt: daysAgo(10),
    },
    items,
    history: history(id, [
      { message: "Venda cadastrada", actor: "João Ferreira", daysAgoValue: 18 },
      { message: "Crédito aprovado", actor: "Banco XYZ", daysAgoValue: 15 },
      { message: "Contrato assinado", actor: "Rafael Nogueira", daysAgoValue: 13 },
      { message: "ATPV-e enviada", actor: "João Ferreira", daysAgoValue: 12 },
      { message: "Veículo liberado para entrega", actor: "João Ferreira", daysAgoValue: 10 },
      { message: "Veículo entregue ao cliente", actor: "João Ferreira", daysAgoValue: 10 },
    ]),
  });
}

// #1030 — Camila Torres · Toro · financiado com troca (usado na entrada), interestadual.
{
  const id = "neg_007";
  const templates = buildChecklistTemplates({
    customerKind: "INDIVIDUAL",
    customerMarried: false,
    hasRepresentativeProcuration: false,
    paymentMethod: "FINANCING",
    hasTradeIn: true,
    vehicleCondition: "NEW",
    needsTransfer: true,
    interstate: true,
    needsCourier: false,
  });
  const items = buildItems(
    id,
    templates,
    {
      entrada_laudo_cautelar: { status: "PENDING" },
      entrada_avaliacao_mecanica: { status: "RECEIVED" },
      fin_aprovacao_credito: { status: "RECEIVED" },
    },
    "APPROVED",
    daysAgo(1)
  );
  seeds.push({
    negotiation: {
      id,
      code: "#1030",
      customerKind: "INDIVIDUAL",
      customerName: "Camila Torres",
      customerDocument: "66677788899",
      customerPhone: "5511922221111",
      customerEmail: "camila.torres@example.com",
      customerMarried: false,
      hasRepresentativeProcuration: false,
      vehicleId: "veh_006",
      sellerId: "sp_003",
      sellerName: "Mariana Duarte",
      saleValue: 189900,
      paymentMethod: "FINANCING",
      financing: {
        financierName: "Banco XYZ",
        financedAmount: 139900,
        downPayment: 50000,
        installments: 48,
        status: "SUBMITTED",
      },
      hasTradeIn: true,
      tradeIn: {
        plate: "ABC1D23",
        brand: "Volkswagen",
        model: "Gol",
        year: 2018,
        mileageKm: 68000,
        requestedValue: 45000,
        marketValue: 42000,
        storeAppraisalValue: 40000,
        approvedValue: null,
      },
      vehicleCondition: "NEW",
      needsTransfer: true,
      interstate: true,
      needsCourier: false,
      transferStage: "SALE_DONE",
      status: "IN_PROGRESS",
      documentationResponsible: "Mariana Duarte",
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
    },
    items,
    history: history(id, [
      { message: "Venda cadastrada", actor: "Mariana Duarte", daysAgoValue: 2 },
      { message: "Avaliação mecânica do usado recebida", actor: "Mariana Duarte", daysAgoValue: 1 },
    ]),
  });
}

export const seedNegotiations: Negotiation[] = seeds.map((s) => s.negotiation);
export const seedChecklistItems: ChecklistItem[] = seeds.flatMap((s) => s.items);
export const seedNegotiationHistory: NegotiationHistoryEvent[] = seeds.flatMap((s) => s.history);
