// Motor de checklist do Assistente de Documentação (seções 2-9, 13, 15, 25
// do briefing). Toda a lógica aqui é determinística — gerada a partir dos
// dados reais da negociação (tipo de cliente, forma de pagamento, entrada de
// usado, necessidade de transferência/despachante etc). Não há chamada a
// nenhum modelo de IA/LLM nem serviço de OCR: "análise da documentação"
// significa comparar o checklist com o que já foi marcado/anexado, nunca ler
// o conteúdo do arquivo. Mesmo padrão de honestidade de lib/matching.ts.

import type {
  ChecklistCategory,
  ChecklistItem,
  ChecklistItemStatus,
  NegotiationBucket,
} from "@/lib/types";

interface ItemTemplate {
  key: string;
  label: string;
  category: ChecklistCategory;
  required?: boolean;
}

// Lista fixa de documentos exigidos por venda — cliente e veículo. Igual
// para toda negociação, independente de tipo de cliente, pagamento,
// entrada de usado ou transferência (simplificação pedida em 2026-09-12,
// substituindo o checklist antigo com dezenas de itens condicionais).
export function buildChecklistTemplates(): ItemTemplate[] {
  return [
    { key: "rg_cnh", label: "RG ou CNH", category: "CLIENTE", required: true },
    { key: "comprovante_residencia", label: "Comprovante de residência atualizado", category: "CLIENTE", required: true },
    { key: "procuracao", label: "Procuração", category: "CLIENTE", required: true },
    { key: "vendido_crlv", label: "CRLV", category: "VEICULO_VENDIDO", required: true },
    { key: "vendido_laudo_cautelar", label: "Laudo cautelar", category: "VEICULO_VENDIDO", required: true },
    { key: "vendido_manual", label: "Manual", category: "VEICULO_VENDIDO", required: true },
    { key: "vendido_chave_reserva", label: "Chave reserva", category: "VEICULO_VENDIDO", required: true },
  ];
}

// --- Progresso, classificação e liberação de entrega -----------------------

export function computeProgressPercent(items: ChecklistItem[]): number {
  const required = items.filter((i) => i.required);
  if (required.length === 0) return 100;
  const done = required.filter((i) => i.status === "APPROVED" || i.status === "NOT_APPLICABLE").length;
  return Math.round((done / required.length) * 100);
}

export function getMissingItems(items: ChecklistItem[]): ChecklistItem[] {
  return items.filter((i) => i.required && i.status !== "APPROVED" && i.status !== "NOT_APPLICABLE");
}

export function isDeliveryReady(items: ChecklistItem[]): boolean {
  return getMissingItems(items).length === 0;
}

// Classifica a negociação em um único balde de prioridade (seção 1 —
// cartões do dashboard). Ordem de prioridade: crítica > banco > despachante
// > cliente > pendente genérico > pronta.
export function classifyNegotiation(items: ChecklistItem[]): NegotiationBucket {
  if (isDeliveryReady(items)) return "READY";

  const hasRejected = items.some((i) => i.required && i.status === "REJECTED");
  if (hasRejected) return "CRITICAL";

  const awaitingBank = items.some(
    (i) => i.required && i.category === "FINANCIAMENTO" && i.status === "AWAITING_THIRD_PARTY"
  );
  if (awaitingBank) return "AWAITING_BANK";

  const awaitingCourier = items.some(
    (i) => i.required && i.category === "TRANSFERENCIA" && i.status === "AWAITING_THIRD_PARTY"
  );
  if (awaitingCourier) return "AWAITING_COURIER";

  const awaitingThirdPartyOther = items.some((i) => i.required && i.status === "AWAITING_THIRD_PARTY");
  if (awaitingThirdPartyOther) return "AWAITING_BANK";

  const awaitingClient = items.some((i) => i.required && i.status === "PENDING");
  if (awaitingClient) return "AWAITING_CLIENT";

  return "PENDING";
}

// --- "Análise da documentação" (seção 9) ------------------------------------
//
// Comparação direta entre o checklist exigido e o que já foi marcado/
// anexado — não é leitura de conteúdo de arquivo nem IA. Rotulada como tal
// em toda a UI que consumir esta função.
export interface DocumentationAnalysis {
  percent: number;
  receivedLabels: string[];
  missingLabels: string[];
}

export function analyzeDocumentation(items: ChecklistItem[]): DocumentationAnalysis {
  const required = items.filter((i) => i.required);
  return {
    percent: computeProgressPercent(items),
    receivedLabels: required.filter((i) => i.status === "APPROVED").map((i) => i.label),
    missingLabels: getMissingItems(items).map((i) => i.label),
  };
}

export const CHECKLIST_STATUS_DOT: Record<ChecklistItemStatus, string> = {
  PENDING: "bg-warning-500",
  RECEIVED: "bg-warning-500",
  APPROVED: "bg-success-500",
  REJECTED: "bg-danger-500",
  AWAITING_THIRD_PARTY: "bg-blue-400",
  NOT_APPLICABLE: "bg-white/20",
};
