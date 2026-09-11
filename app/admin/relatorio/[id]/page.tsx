import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getAdminSession } from "@/lib/server/auth";
import { appendAuditLog, getCreditAnalysisById, getCreditCustomerById } from "@/lib/server/db";
import { COMMERCIAL_STATUS_LABELS, CREDIT_SCENARIO_LABELS } from "@/lib/types";
import { formatCurrency, maskCpf } from "@/lib/utils";
import { PrintButton } from "@/components/credito/PrintButton";

export const metadata: Metadata = { title: "Relatório de análise de crédito", robots: { index: false } };

export default async function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const analysis = await getCreditAnalysisById(id);
  if (!analysis) notFound();
  if (session.role === "SALES" && analysis.sellerId !== session.id) redirect("/admin/credito");

  const customer = await getCreditCustomerById(analysis.customerId);
  if (!customer) notFound();

  await appendAuditLog({
    type: "REPORT_GENERATED",
    userEmail: session.email,
    detail: `Relatório gerado para CPF ${maskCpf(customer.cpf)}.`,
  });

  const { report, aiAnalysis } = analysis;

  return (
    <div className="min-h-dvh bg-ink-50 px-4 py-10 print:bg-white print:py-0">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-card border border-white/10 bg-ink-100 p-8 print:border-0 print:bg-white print:text-black print:shadow-none">
        <div className="flex items-center justify-between">
          <Image src="/logo.png" alt="Auto2000 Veículos" width={896} height={444} className="h-9 w-auto rounded-md" />
          <PrintButton />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-accent-400 print:text-black">
            Relatório de Análise Inteligente de Crédito
          </h1>
          <p className="text-sm text-ink-500 print:text-black/60">
            Documento de apoio comercial interno — não é uma proposta de crédito.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-white/10 py-5 text-sm print:border-black/15">
          <Row label="Cliente" value={customer.name} />
          <Row label="CPF" value={maskCpf(customer.cpf)} />
          <Row label="Data/hora da consulta" value={new Date(report.consultedAt).toLocaleString("pt-BR")} />
          <Row label="Vendedor" value={analysis.sellerName} />
          <Row label="Veículo de interesse" value={analysis.vehicleInterest} />
          <Row label="Valor do veículo" value={formatCurrency(analysis.vehiclePrice)} />
          <Row label="Entrada informada" value={formatCurrency(analysis.downPayment)} />
          <Row label="Renda mensal declarada" value={formatCurrency(analysis.monthlyIncome)} />
          <Row label="Status comercial" value={COMMERCIAL_STATUS_LABELS[analysis.commercialStatus]} />
        </dl>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500 print:text-black/60">
            Indicadores retornados na consulta
          </h2>
          {report.demo && (
            <p className="text-xs font-semibold text-warning-500">
              DADOS SIMULADOS — NÃO REPRESENTAM CONSULTA REAL
            </p>
          )}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Row label="Score" value={report.score != null ? `${report.score} / ${report.scoreRangeMax}` : "—"} />
            <Row label="Classificação" value={report.scoreClassification ?? "—"} />
            <Row label="Restrições" value={report.indicators.restrictions ?? "—"} />
            <Row
              label="Pendências financeiras"
              value={report.indicators.pendingDebtsAmount != null ? formatCurrency(report.indicators.pendingDebtsAmount) : "—"}
            />
            <Row label="Protestos" value={report.indicators.protests ?? "—"} />
            <Row label="Cheques sem fundos" value={report.indicators.bouncedChecks ?? "—"} />
            <Row label="Dívidas negativadas" value={report.indicators.negativeDebts ?? "—"} />
            <Row label="Consultas recentes" value={report.indicators.recentInquiries ?? "—"} />
            <Row label="Cadastro positivo" value={report.indicators.positiveRegistry ?? "—"} />
          </dl>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500 print:text-black/60">
            Análise inteligente ({CREDIT_SCENARIO_LABELS[aiAnalysis.scenario]})
          </h2>
          <p className="text-sm leading-relaxed text-ink-700 print:text-black">{aiAnalysis.summary}</p>
        </section>

        <div className="rounded-lg border border-white/15 bg-white/[0.03] p-4 text-xs leading-relaxed text-ink-600 print:border-black/20 print:bg-transparent print:text-black">
          Este relatório possui caráter exclusivamente informativo e de apoio comercial. A análise
          apresentada não representa aprovação ou garantia de concessão de crédito. A decisão cabe
          exclusivamente às instituições financeiras responsáveis.
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <>
      <dt className="text-ink-500 print:text-black/60">{label}</dt>
      <dd className="text-right font-medium text-white print:text-black">{value}</dd>
    </>
  );
}
