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
  Negotiation,
  NegotiationBucket,
} from "@/lib/types";

interface ItemTemplate {
  key: string;
  label: string;
  category: ChecklistCategory;
  required?: boolean;
}

function clienteTemplates(n: Pick<Negotiation, "customerKind" | "customerMarried" | "hasRepresentativeProcuration">): ItemTemplate[] {
  const items: ItemTemplate[] = [];
  if (n.customerKind === "INDIVIDUAL") {
    items.push(
      { key: "rg_cnh", label: "RG ou CNH", category: "CLIENTE" },
      { key: "cpf", label: "CPF", category: "CLIENTE" },
      { key: "comprovante_residencia", label: "Comprovante de residência", category: "CLIENTE" },
      { key: "comprovante_renda", label: "Comprovante de renda", category: "CLIENTE" },
      { key: "estado_civil", label: "Estado civil", category: "CLIENTE" },
      { key: "telefone", label: "Telefone", category: "CLIENTE" },
      { key: "email", label: "E-mail", category: "CLIENTE" }
    );
    if (n.customerMarried) {
      items.push(
        { key: "certidao_casamento", label: "Certidão de casamento", category: "CLIENTE" },
        { key: "dados_conjuge", label: "Dados do cônjuge", category: "CLIENTE" }
      );
    }
  } else {
    items.push(
      { key: "cartao_cnpj", label: "Cartão CNPJ", category: "CLIENTE" },
      { key: "contrato_social", label: "Contrato social", category: "CLIENTE" },
      { key: "ultima_alteracao_contratual", label: "Última alteração contratual", category: "CLIENTE" },
      { key: "documentos_socios", label: "Documentos dos sócios", category: "CLIENTE" },
      { key: "comprovante_endereco_empresa", label: "Comprovante de endereço da empresa", category: "CLIENTE" },
      { key: "dados_bancarios", label: "Dados bancários", category: "CLIENTE" }
    );
  }
  if (n.hasRepresentativeProcuration) {
    items.push({ key: "procuracao", label: "Procuração", category: "CLIENTE" });
  }
  return items;
}

function financiamentoTemplates(): ItemTemplate[] {
  return [
    { key: "fin_documento_identificacao", label: "Documento de identificação", category: "FINANCIAMENTO" },
    { key: "fin_cpf", label: "CPF", category: "FINANCIAMENTO" },
    { key: "fin_comprovante_residencia", label: "Comprovante de residência", category: "FINANCIAMENTO" },
    { key: "fin_comprovante_renda", label: "Comprovante de renda", category: "FINANCIAMENTO" },
    { key: "fin_dados_profissionais", label: "Dados profissionais", category: "FINANCIAMENTO" },
    { key: "fin_dados_bancarios", label: "Dados bancários", category: "FINANCIAMENTO" },
    { key: "fin_proposta", label: "Proposta de financiamento", category: "FINANCIAMENTO" },
    { key: "fin_aprovacao_credito", label: "Aprovação de crédito", category: "FINANCIAMENTO" },
    { key: "fin_contrato_assinado", label: "Contrato assinado", category: "FINANCIAMENTO" },
    { key: "fin_comprovante_entrada", label: "Comprovante da entrada", category: "FINANCIAMENTO" },
  ];
}

function veiculoEntradaTemplates(): ItemTemplate[] {
  return [
    { key: "entrada_crlv", label: "CRLV-e", category: "VEICULO_ENTRADA" },
    { key: "entrada_doc_proprietario", label: "Documento do proprietário", category: "VEICULO_ENTRADA" },
    { key: "entrada_consulta_debitos", label: "Consulta de débitos", category: "VEICULO_ENTRADA" },
    { key: "entrada_multas", label: "Multas", category: "VEICULO_ENTRADA" },
    { key: "entrada_ipva", label: "IPVA", category: "VEICULO_ENTRADA" },
    { key: "entrada_licenciamento", label: "Licenciamento", category: "VEICULO_ENTRADA" },
    { key: "entrada_restricoes", label: "Restrições", category: "VEICULO_ENTRADA" },
    { key: "entrada_gravame", label: "Gravame", category: "VEICULO_ENTRADA" },
    { key: "entrada_alienacao", label: "Alienação", category: "VEICULO_ENTRADA" },
    { key: "entrada_historico", label: "Histórico do veículo", category: "VEICULO_ENTRADA" },
    { key: "entrada_laudo_cautelar", label: "Laudo cautelar", category: "VEICULO_ENTRADA" },
    { key: "entrada_avaliacao_mecanica", label: "Avaliação mecânica", category: "VEICULO_ENTRADA" },
    { key: "entrada_avaliacao_estetica", label: "Avaliação estética", category: "VEICULO_ENTRADA" },
    { key: "entrada_fotos", label: "Fotos do veículo", category: "VEICULO_ENTRADA" },
  ];
}

function veiculoVendidoTemplates(condition: Negotiation["vehicleCondition"]): ItemTemplate[] {
  return [
    { key: "vendido_crlv", label: "CRLV-e", category: "VEICULO_VENDIDO" },
    { key: "vendido_renavam", label: "RENAVAM", category: "VEICULO_VENDIDO" },
    { key: "vendido_placa", label: "Placa", category: "VEICULO_VENDIDO" },
    { key: "vendido_chassi", label: "Chassi", category: "VEICULO_VENDIDO" },
    { key: "vendido_comprovante_propriedade", label: "Comprovante de propriedade", category: "VEICULO_VENDIDO" },
    { key: "vendido_consulta_debitos", label: "Consulta de débitos", category: "VEICULO_VENDIDO" },
    { key: "vendido_consulta_restricoes", label: "Consulta de restrições", category: "VEICULO_VENDIDO" },
    { key: "vendido_ipva", label: "IPVA", category: "VEICULO_VENDIDO" },
    { key: "vendido_licenciamento", label: "Licenciamento", category: "VEICULO_VENDIDO" },
    { key: "vendido_multas", label: "Multas", category: "VEICULO_VENDIDO" },
    { key: "vendido_gravame", label: "Gravame", category: "VEICULO_VENDIDO" },
    {
      key: "vendido_laudo_cautelar",
      label: "Laudo cautelar",
      category: "VEICULO_VENDIDO",
      required: condition === "USED",
    },
    { key: "vendido_historico", label: "Histórico do veículo", category: "VEICULO_VENDIDO" },
    { key: "vendido_manual", label: "Manual", category: "VEICULO_VENDIDO" },
    { key: "vendido_chave_reserva", label: "Chave reserva", category: "VEICULO_VENDIDO" },
  ];
}

function transferenciaTemplates(n: Pick<Negotiation, "interstate" | "needsCourier">): ItemTemplate[] {
  const items: ItemTemplate[] = [
    { key: "transf_atpv", label: "ATPV-e", category: "TRANSFERENCIA" },
    { key: "transf_assinatura_vendedor", label: "Assinatura do vendedor", category: "TRANSFERENCIA" },
    { key: "transf_assinatura_comprador", label: "Assinatura do comprador", category: "TRANSFERENCIA" },
    { key: "transf_comunicacao_venda", label: "Comunicação de venda", category: "TRANSFERENCIA" },
    { key: "transf_vistoria", label: "Vistoria", category: "TRANSFERENCIA" },
    { key: "transf_taxa", label: "Taxa de transferência", category: "TRANSFERENCIA" },
  ];
  if (n.interstate) {
    items.push({ key: "transf_interestadual", label: "Documentação de transferência interestadual", category: "TRANSFERENCIA" });
  }
  if (n.needsCourier) {
    items.push({ key: "transf_docs_despachante", label: "Documentos enviados ao despachante", category: "TRANSFERENCIA" });
  }
  items.push({ key: "transf_processo_detran", label: "Processo enviado ao DETRAN", category: "TRANSFERENCIA" });
  return items;
}

function entregaTemplates(n: Pick<Negotiation, "paymentMethod" | "needsTransfer">): ItemTemplate[] {
  const items: ItemTemplate[] = [];
  items.push({ key: "entrega_pagamento_confirmado", label: "Pagamento confirmado", category: "ENTREGA" });
  if (n.paymentMethod === "FINANCING") {
    items.push(
      { key: "entrega_financiamento_liberado", label: "Financiamento liberado", category: "ENTREGA" },
      { key: "entrega_contrato_assinado", label: "Contrato assinado", category: "ENTREGA" }
    );
  }
  if (n.needsTransfer) {
    items.push({ key: "entrega_transferencia_encaminhada", label: "Transferência encaminhada", category: "ENTREGA" });
  }
  items.push(
    { key: "entrega_veiculo_higienizado", label: "Veículo higienizado", category: "ENTREGA" },
    { key: "entrega_revisao", label: "Revisão realizada", category: "ENTREGA" },
    { key: "entrega_combustivel", label: "Combustível", category: "ENTREGA" },
    { key: "entrega_documentos_veiculo", label: "Documentos do veículo", category: "ENTREGA" },
    { key: "entrega_manual", label: "Manual", category: "ENTREGA" },
    { key: "entrega_chave_reserva", label: "Chave reserva", category: "ENTREGA" },
    { key: "entrega_acessorios", label: "Acessórios", category: "ENTREGA" },
    { key: "entrega_termo_entrega", label: "Termo de entrega", category: "ENTREGA" },
    { key: "entrega_fotos_entrega", label: "Fotos da entrega", category: "ENTREGA" }
  );
  return items;
}

// Gera o checklist completo para uma negociação, de acordo com as seções
// 2-8 do briefing (tipo de cliente, novo/usado, pagamento, entrada,
// transferência, despachante). Chamado uma única vez na criação da venda.
export function buildChecklistTemplates(input: {
  customerKind: Negotiation["customerKind"];
  customerMarried: boolean;
  hasRepresentativeProcuration: boolean;
  paymentMethod: Negotiation["paymentMethod"];
  hasTradeIn: boolean;
  vehicleCondition: Negotiation["vehicleCondition"];
  needsTransfer: boolean;
  interstate: boolean;
  needsCourier: boolean;
}): ItemTemplate[] {
  const templates: ItemTemplate[] = [...clienteTemplates(input)];

  if (input.paymentMethod === "FINANCING") templates.push(...financiamentoTemplates());
  if (input.hasTradeIn) templates.push(...veiculoEntradaTemplates());
  templates.push(...veiculoVendidoTemplates(input.vehicleCondition));
  if (input.needsTransfer) templates.push(...transferenciaTemplates(input));
  templates.push(...entregaTemplates(input));

  return templates.map((t) => ({ ...t, required: t.required ?? true }));
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

// --- Alertas (seção 15) ------------------------------------------------------

export type AlertTone = "critical" | "warning" | "info" | "success";

export interface NegotiationAlert {
  tone: AlertTone;
  message: string;
}

export function buildAlerts(negotiation: Negotiation, items: ChecklistItem[]): NegotiationAlert[] {
  const alerts: NegotiationAlert[] = [];

  for (const item of items) {
    if (!item.required) continue;
    if (item.status === "REJECTED") {
      alerts.push({ tone: "critical", message: `${item.label} recusado${item.note ? ` — ${item.note}` : ""}` });
    } else if (item.status === "AWAITING_THIRD_PARTY") {
      alerts.push({ tone: "info", message: `${item.label}: aguardando terceiro` });
    } else if (item.status === "PENDING") {
      alerts.push({ tone: "warning", message: `${item.label} pendente` });
    }
  }

  if (isDeliveryReady(items)) {
    alerts.push({ tone: "success", message: "Documentação completa" });
    alerts.push({ tone: "success", message: "Veículo liberado para entrega" });
  }

  return alerts;
}

export const CHECKLIST_STATUS_DOT: Record<ChecklistItemStatus, string> = {
  PENDING: "bg-warning-500",
  RECEIVED: "bg-warning-500",
  APPROVED: "bg-success-500",
  REJECTED: "bg-danger-500",
  AWAITING_THIRD_PARTY: "bg-blue-400",
  NOT_APPLICABLE: "bg-white/20",
};
