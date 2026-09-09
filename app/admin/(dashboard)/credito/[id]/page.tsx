import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText, AlertTriangle, Sparkles, Landmark } from "lucide-react";
import { getAdminSession } from "@/lib/server/auth";
import { getCreditAnalysisById, getCreditCustomerById, listVehiclesAdmin } from "@/lib/server/db";
import { COMMERCIAL_STATUS_LABELS } from "@/lib/types";
import { formatCurrency, maskCpf } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreGauge } from "@/components/credito/ScoreGauge";
import { IndicatorCard } from "@/components/credito/IndicatorCard";
import { RecommendationCard } from "@/components/credito/RecommendationCard";
import { FinancingWorkspace } from "@/components/credito/FinancingWorkspace";
import { StatusSelect } from "@/components/credito/StatusSelect";

export const metadata: Metadata = { title: "Resultado da consulta", robots: { index: false } };

export default async function CreditAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return null;

  const { id } = await params;
  const analysis = getCreditAnalysisById(id);
  if (!analysis) notFound();
  if (session.role === "SALES" && analysis.sellerId !== session.id) redirect("/admin/credito");

  const customer = getCreditCustomerById(analysis.customerId);
  if (!customer) notFound();

  const { report, aiAnalysis } = analysis;
  const alternativeDownPayment = Math.round(
    Math.min(analysis.vehiclePrice * 0.5, analysis.downPayment + analysis.vehiclePrice * 0.15)
  );

  const compatibleVehicles = listVehiclesAdmin({ sort: "recent" })
    .filter((v) => v.status === "AVAILABLE")
    .filter((v) => v.price >= analysis.vehiclePrice * 0.85 && v.price <= analysis.vehiclePrice * 1.15)
    .sort((a, b) => Math.abs(a.price - analysis.vehiclePrice) - Math.abs(b.price - analysis.vehiclePrice))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-accent-400">{customer.name}</h1>
          <p className="text-sm text-ink-500">
            {maskCpf(customer.cpf)} · Consulta em {new Date(report.consultedAt).toLocaleString("pt-BR")} · Vendedor{" "}
            {analysis.sellerName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusSelect analysisId={analysis.id} status={analysis.commercialStatus} />
          <Button href={`/admin/relatorio/${analysis.id}`} target="_blank" variant="outline" size="sm">
            <FileText className="h-4 w-4" />
            Gerar relatório
          </Button>
        </div>
      </div>

      {report.demo && (
        <div className="flex items-center gap-2 rounded-xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-sm font-medium text-warning-500">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          DADOS SIMULADOS — NÃO REPRESENTAM CONSULTA REAL. Configure as credenciais da API Serasa em
          Configurações para conectar a integração oficial.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center gap-3 p-8">
          <ScoreGauge score={report.score} max={report.scoreRangeMax} />
          <Badge tone={report.score != null && report.score >= 700 ? "success" : "warning"}>
            {report.scoreClassification ?? "Classificação não disponível"}
          </Badge>
          {report.riskIndicator && <p className="text-sm text-ink-500">{report.riskIndicator}</p>}
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <IndicatorCard label="Restrições" value={report.indicators.restrictions} />
          <IndicatorCard
            label="Pendências financeiras"
            value={
              report.indicators.pendingDebtsAmount != null
                ? formatCurrency(report.indicators.pendingDebtsAmount)
                : null
            }
            tone={report.indicators.pendingDebtsAmount ? "danger" : "success"}
          />
          <IndicatorCard
            label="Protestos"
            value={report.indicators.protests}
            tone={report.indicators.protests ? "danger" : "success"}
          />
          <IndicatorCard
            label="Cheques sem fundos"
            value={report.indicators.bouncedChecks}
            tone={report.indicators.bouncedChecks ? "danger" : "success"}
          />
          <IndicatorCard
            label="Dívidas negativadas"
            value={report.indicators.negativeDebts}
            tone={report.indicators.negativeDebts ? "danger" : "success"}
          />
          <IndicatorCard
            label="Consultas recentes"
            value={report.indicators.recentInquiries != null ? `${report.indicators.recentInquiries} consulta(s)` : null}
          />
          <IndicatorCard label="Cadastro positivo" value={report.indicators.positiveRegistry} />
        </div>
      </div>

      {report.factors.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-3 text-base font-semibold text-accent-400">Fatores que impactam o score</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {report.factors.map((f) => (
              <li key={f.label} className="flex items-center gap-2 text-ink-700">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    f.impact === "POSITIVE"
                      ? "bg-success-500"
                      : f.impact === "NEGATIVE"
                        ? "bg-danger-500"
                        : "bg-ink-400"
                  }`}
                />
                {f.label}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-accent-400" />
          <h3 className="text-base font-semibold text-accent-400">Análise inteligente</h3>
        </div>
        <p className="text-sm leading-relaxed text-ink-700">{aiAnalysis.summary}</p>
      </Card>

      <RecommendationCard
        aiAnalysis={aiAnalysis}
        downPayment={analysis.downPayment}
        alternativeDownPayment={alternativeDownPayment}
      />

      <FinancingWorkspace
        monthlyIncome={analysis.monthlyIncome}
        vehiclePrice={analysis.vehiclePrice}
        initialDownPayment={analysis.downPayment}
        compatibleVehicles={compatibleVehicles}
      />

      <Card className="flex items-start gap-3 p-6 text-sm text-ink-600">
        <Landmark className="h-4.5 w-4.5 shrink-0 text-ink-500" />
        <div>
          <p className="font-medium text-ink-700">Propostas para bancos e financeiras</p>
          <p>
            Integração com bancos, financeiras automotivas e fintechs parceiras — Fase 2. Quando ativa,
            as propostas enviadas a partir desta análise aparecerão aqui com status por instituição.
          </p>
        </div>
      </Card>

      <p className="text-xs text-ink-600">
        Estimativa interna de encaminhamento (Alta/Média/Baixa): ainda não disponível — requer
        histórico real de propostas aprovadas e recusadas da loja. Quando disponível, será
        identificada como estimativa interna, nunca como probabilidade da Serasa, banco ou
        financeira.
      </p>

      <p className="text-xs text-ink-600">
        Status comercial atual:{" "}
        <Link href={`/admin/clientes/${customer.id}`} className="text-accent-400 hover:underline">
          {COMMERCIAL_STATUS_LABELS[analysis.commercialStatus]} — ver ficha completa do cliente
        </Link>
      </p>
    </div>
  );
}
