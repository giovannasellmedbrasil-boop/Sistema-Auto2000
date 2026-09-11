import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getAdminSession } from "@/lib/server/auth";
import { getCreditCustomerById, listCreditAnalysesByCustomer } from "@/lib/server/db";
import { COMMERCIAL_STATUS_LABELS, CREDIT_SCENARIO_LABELS } from "@/lib/types";
import { formatCurrency, maskCpf } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Ficha do cliente", robots: { index: false } };

export default async function ClienteFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return null;

  const { id } = await params;
  const customer = await getCreditCustomerById(id);
  if (!customer) notFound();

  const analyses = (await listCreditAnalysesByCustomer(id)).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (session.role === "SALES" && !analyses.some((a) => a.sellerId === session.id)) {
    redirect("/admin/clientes");
  }

  const latest = analyses[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">{customer.name}</h1>
        <p className="text-sm text-ink-500">Cliente desde {new Date(customer.createdAt).toLocaleDateString("pt-BR")}</p>
      </div>

      <Card className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 text-sm sm:grid-cols-4">
        <Field label="CPF" value={maskCpf(customer.cpf)} />
        <Field label="Telefone" value={customer.phone} />
        <Field label="E-mail" value={customer.email ?? "—"} />
        <Field label="Data de nascimento" value={new Date(customer.birthDate).toLocaleDateString("pt-BR")} />
        {latest && (
          <>
            <Field label="Veículo de interesse" value={latest.vehicleInterest} />
            <Field label="Valor do veículo" value={formatCurrency(latest.vehiclePrice)} />
            <Field label="Entrada informada" value={formatCurrency(latest.downPayment)} />
            <Field label="Renda declarada" value={formatCurrency(latest.monthlyIncome)} />
          </>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-base font-semibold text-accent-400">Histórico de análises</h2>
        <div className="flex flex-col gap-3">
          {analyses.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-white">
                  {new Date(a.createdAt).toLocaleString("pt-BR")} — {a.vehicleInterest}
                </p>
                <p className="text-xs text-ink-500">
                  Score {a.report.score ?? "—"} · {CREDIT_SCENARIO_LABELS[a.aiAnalysis.scenario]} · Vendedor{" "}
                  {a.sellerName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="accent">{COMMERCIAL_STATUS_LABELS[a.commercialStatus]}</Badge>
                <Button href={`/admin/credito/${a.id}`} variant="outline" size="sm">
                  Ver análise
                </Button>
                <Button href={`/admin/relatorio/${a.id}`} target="_blank" variant="ghost" size="sm">
                  <FileText className="h-4 w-4" />
                  Relatório
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-600">
        Status comercial mostra a etapa mais recente registrada para cada análise:{" "}
        {Object.values(COMMERCIAL_STATUS_LABELS).join(" → ")}.
      </p>

      <Link href="/admin/clientes" className="text-sm text-accent-400 hover:underline">
        ← Voltar para clientes
      </Link>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-white">{value}</dd>
    </div>
  );
}
