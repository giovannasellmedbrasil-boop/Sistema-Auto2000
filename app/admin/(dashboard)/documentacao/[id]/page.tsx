import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { getAdminSession } from "@/lib/server/auth";
import {
  getChecklistItems,
  getNegotiationById,
  getNegotiationDocuments,
  getNegotiationHistory,
  getVehicleById,
} from "@/lib/server/db";
import {
  analyzeDocumentation,
  buildAlerts,
  classifyNegotiation,
  computeProgressPercent,
  getMissingItems,
  isDeliveryReady,
} from "@/lib/server/documentChecklist";
import {
  CUSTOMER_KIND_LABELS,
  FINANCING_STATUS_LABELS,
  NEGOTIATION_PAYMENT_METHOD_LABELS,
  VEHICLE_CONDITION_LABELS,
  type ChecklistCategory,
} from "@/lib/types";
import { documentRequestWhatsAppMessage, formatCurrency, formatKm, maskCpf } from "@/lib/utils";
import { BucketBadge } from "@/components/documentacao/BucketBadge";
import { ChecklistSection } from "@/components/documentacao/ChecklistSection";
import { DeliveryGateBanner } from "@/components/documentacao/DeliveryGateBanner";
import { DocumentationAnalysisCard } from "@/components/documentacao/DocumentationAnalysisCard";
import { AlertsList } from "@/components/documentacao/AlertsList";
import { DocumentUploadForm } from "@/components/documentacao/DocumentUploadForm";
import { DocumentsList } from "@/components/documentacao/DocumentsList";
import { WhatsAppRequestButton } from "@/components/documentacao/WhatsAppRequestButton";
import { TransferTimeline } from "@/components/documentacao/TransferTimeline";
import { HistoryTimeline } from "@/components/documentacao/HistoryTimeline";
import { FinancingStatusSelect } from "@/components/documentacao/FinancingStatusSelect";

export const metadata: Metadata = { title: "Venda — Documentação", robots: { index: false } };

function itemsIn(items: ReturnType<typeof getChecklistItems>, category: ChecklistCategory) {
  return items.filter((i) => i.category === category);
}

export default async function NegotiationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return null;

  const { id } = await params;
  const negotiation = getNegotiationById(id);
  if (!negotiation) notFound();
  if (session.role === "SALES" && negotiation.sellerId !== session.id) redirect("/admin/documentacao");

  const items = getChecklistItems(id);
  const documents = getNegotiationDocuments(id);
  const history = getNegotiationHistory(id);
  const vehicle = getVehicleById(negotiation.vehicleId);

  const progressPercent = computeProgressPercent(items);
  const bucket = classifyNegotiation(items);
  const deliveryReady = isDeliveryReady(items);
  const missingItems = getMissingItems(items);
  const alerts = buildAlerts(negotiation, items);
  const analysis = analyzeDocumentation(items);
  const canManage = session.role === "MANAGER" || session.role === "ADMIN";

  const vehicleLabel = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.modelYear}` : "Veículo";
  const whatsappMessage = documentRequestWhatsAppMessage({
    customerFirstName: negotiation.customerName.split(" ")[0],
    vehicleLabel,
    missingLabels: missingItems.map((i) => i.label),
  });

  const resumoTab = (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-1.5 p-5">
          <span className="text-xs text-ink-500">Cliente</span>
          <span className="text-sm font-medium text-ink-900">{negotiation.customerName}</span>
          <span className="text-xs text-ink-500">{CUSTOMER_KIND_LABELS[negotiation.customerKind]}</span>
        </Card>
        <Card className="flex flex-col gap-1.5 p-5">
          <span className="text-xs text-ink-500">Veículo</span>
          <span className="text-sm font-medium text-ink-900">{vehicleLabel}</span>
        </Card>
        <Card className="flex flex-col gap-1.5 p-5">
          <span className="text-xs text-ink-500">Vendedor</span>
          <span className="text-sm font-medium text-ink-900">{negotiation.sellerName}</span>
        </Card>
        <Card className="flex flex-col gap-1.5 p-5">
          <span className="text-xs text-ink-500">Valor da venda</span>
          <span className="text-sm font-medium text-ink-900">{formatCurrency(negotiation.saleValue)}</span>
        </Card>
        <Card className="flex flex-col gap-1.5 p-5">
          <span className="text-xs text-ink-500">Forma de pagamento</span>
          <span className="text-sm font-medium text-ink-900">{NEGOTIATION_PAYMENT_METHOD_LABELS[negotiation.paymentMethod]}</span>
        </Card>
        {negotiation.financing && (
          <>
            <Card className="flex flex-col gap-1.5 p-5">
              <span className="text-xs text-ink-500">Entrada</span>
              <span className="text-sm font-medium text-ink-900">{formatCurrency(negotiation.financing.downPayment)}</span>
            </Card>
            <Card className="flex flex-col gap-1.5 p-5">
              <span className="text-xs text-ink-500">Financeira</span>
              <span className="text-sm font-medium text-ink-900">{negotiation.financing.financierName}</span>
            </Card>
          </>
        )}
      </div>

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-accent-400">Status geral</h3>
          <BucketBadge bucket={bucket} />
        </div>
        <ProgressBar percent={progressPercent} />
        <span className="text-sm text-ink-500">{progressPercent}% concluído</span>
      </Card>

      <DeliveryGateBanner
        negotiationId={id}
        ready={deliveryReady}
        missingItems={missingItems}
        alreadyDelivered={negotiation.status === "DELIVERED"}
        canConfirmDelivery={canManage}
      />

      {alerts.length > 0 && (
        <Card className="flex flex-col gap-3 p-6">
          <h3 className="text-base font-semibold text-accent-400">Alertas</h3>
          <AlertsList alerts={alerts} />
        </Card>
      )}

      {missingItems.length > 0 && (
        <Card className="flex flex-col gap-3 p-6">
          <h3 className="text-base font-semibold text-accent-400">Solicitar documentos ao cliente</h3>
          <p className="whitespace-pre-line text-sm text-ink-600">{whatsappMessage}</p>
          <WhatsAppRequestButton message={whatsappMessage} />
        </Card>
      )}

      <DocumentationAnalysisCard analysis={analysis} />
    </div>
  );

  const clienteTab = (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-2 p-6 text-sm text-ink-700">
        <p><span className="text-ink-500">Documento:</span> {negotiation.customerKind === "INDIVIDUAL" ? maskCpf(negotiation.customerDocument) : negotiation.customerDocument}</p>
        <p><span className="text-ink-500">Telefone:</span> {negotiation.customerPhone}</p>
        {negotiation.customerEmail && <p><span className="text-ink-500">E-mail:</span> {negotiation.customerEmail}</p>}
      </Card>
      <ChecklistSection negotiationId={id} category="CLIENTE" items={itemsIn(items, "CLIENTE")} />
    </div>
  );

  const veiculoTab = (
    <div className="flex flex-col gap-6">
      {vehicle && (
        <Card className="flex flex-col gap-2 p-6 text-sm text-ink-700">
          <p className="text-base font-medium text-ink-900">{vehicleLabel}</p>
          <p><span className="text-ink-500">Condição:</span> {VEHICLE_CONDITION_LABELS[negotiation.vehicleCondition]}</p>
        </Card>
      )}
      <ChecklistSection negotiationId={id} category="VEICULO_VENDIDO" items={itemsIn(items, "VEICULO_VENDIDO")} />
      {negotiation.hasTradeIn && negotiation.tradeIn && (
        <>
          <Card className="flex flex-col gap-2 p-6">
            <h3 className="text-base font-semibold text-accent-400">Avaliação do veículo de entrada</h3>
            <p className="text-sm text-ink-700">
              {negotiation.tradeIn.brand} {negotiation.tradeIn.model} {negotiation.tradeIn.year} · {formatKm(negotiation.tradeIn.mileageKm)} · placa {negotiation.tradeIn.plate}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <div>
                <span className="block text-xs text-ink-500">Solicitado pelo cliente</span>
                <span className="text-sm font-medium text-ink-900">{formatCurrency(negotiation.tradeIn.requestedValue)}</span>
              </div>
              <div>
                <span className="block text-xs text-ink-500">Valor de mercado</span>
                <span className="text-sm font-medium text-ink-900">{negotiation.tradeIn.marketValue != null ? formatCurrency(negotiation.tradeIn.marketValue) : "—"}</span>
              </div>
              <div>
                <span className="block text-xs text-ink-500">Avaliação da loja</span>
                <span className="text-sm font-medium text-ink-900">{negotiation.tradeIn.storeAppraisalValue != null ? formatCurrency(negotiation.tradeIn.storeAppraisalValue) : "—"}</span>
              </div>
              <div>
                <span className="block text-xs text-ink-500">Aprovado para entrada</span>
                <span className="text-sm font-medium text-ink-900">{negotiation.tradeIn.approvedValue != null ? formatCurrency(negotiation.tradeIn.approvedValue) : "—"}</span>
              </div>
            </div>
          </Card>
          <ChecklistSection negotiationId={id} category="VEICULO_ENTRADA" items={itemsIn(items, "VEICULO_ENTRADA")} />
        </>
      )}
    </div>
  );

  const financiamentoTab = negotiation.financing ? (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-accent-400">{negotiation.financing.financierName}</h3>
            <p className="text-sm text-ink-500">
              {formatCurrency(negotiation.financing.financedAmount)} financiado em {negotiation.financing.installments}x · entrada {formatCurrency(negotiation.financing.downPayment)}
            </p>
          </div>
          <FinancingStatusSelect negotiationId={id} financing={negotiation.financing} />
        </div>
        <Badge tone="ink">{FINANCING_STATUS_LABELS[negotiation.financing.status]}</Badge>
      </Card>
      <ChecklistSection negotiationId={id} category="FINANCIAMENTO" items={itemsIn(items, "FINANCIAMENTO")} />
    </div>
  ) : (
    <Card className="p-6 text-sm text-ink-500">Esta venda é à vista — não há financiamento.</Card>
  );

  const transferenciaTab = negotiation.needsTransfer ? (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h3 className="mb-4 text-base font-semibold text-accent-400">Linha do tempo</h3>
        <TransferTimeline negotiationId={id} currentStage={negotiation.transferStage} />
      </Card>
      <ChecklistSection negotiationId={id} category="TRANSFERENCIA" items={itemsIn(items, "TRANSFERENCIA")} />
    </div>
  ) : (
    <Card className="p-6 text-sm text-ink-500">Esta venda não requer transferência de propriedade.</Card>
  );

  const entregaTab = (
    <div className="flex flex-col gap-6">
      <DeliveryGateBanner
        negotiationId={id}
        ready={deliveryReady}
        missingItems={missingItems}
        alreadyDelivered={negotiation.status === "DELIVERED"}
        canConfirmDelivery={canManage}
      />
      <ChecklistSection negotiationId={id} category="ENTREGA" items={itemsIn(items, "ENTREGA")} />
    </div>
  );

  const arquivosTab = (
    <div className="flex flex-col gap-6">
      <DocumentUploadForm negotiationId={id} items={items} />
      <DocumentsList negotiationId={id} documents={documents} canDelete={canManage} />
    </div>
  );

  const historicoTab = (
    <Card className="p-6">
      <HistoryTimeline events={history} />
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-accent-400">
            {negotiation.code} — {negotiation.customerName}
          </h1>
          <p className="text-sm text-ink-500">{vehicleLabel}</p>
        </div>
        <BucketBadge bucket={bucket} />
      </div>

      <Tabs
        tabs={[
          { key: "resumo", label: "Resumo", content: resumoTab },
          { key: "cliente", label: "Cliente", content: clienteTab },
          { key: "veiculo", label: "Veículo", content: veiculoTab },
          { key: "financiamento", label: "Financiamento", content: financiamentoTab },
          { key: "transferencia", label: "Transferência", content: transferenciaTab },
          { key: "entrega", label: "Entrega", content: entregaTab },
          { key: "arquivos", label: "Arquivos", content: arquivosTab },
          { key: "historico", label: "Histórico", content: historicoTab },
        ]}
      />
    </div>
  );
}
