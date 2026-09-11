import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { getAdminSession } from "@/lib/server/auth";
import { listCreditCustomers, listCreditAnalyses } from "@/lib/server/db";
import { COMMERCIAL_STATUS_LABELS, type CommercialStatus } from "@/lib/types";
import { maskCpf } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";

export const metadata: Metadata = { title: "Consultas realizadas", robots: { index: false } };

const STATUS_TONE: Record<CommercialStatus, "accent" | "warning" | "success" | "neutral"> = {
  NEW: "accent",
  CREDIT_CHECKED: "accent",
  SIMULATING: "warning",
  PROPOSAL_SENT: "warning",
  AWAITING_BANK: "warning",
  APPROVED_BY_FINANCIER: "success",
  REJECTED_BY_FINANCIER: "neutral",
  SALE_COMPLETED: "success",
};

const PERIOD_OPTIONS = [
  { value: "", label: "Qualquer período" },
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
];

const SCORE_OPTIONS = [
  { value: "", label: "Qualquer score" },
  { value: "low", label: "Até 499" },
  { value: "mid", label: "500 a 699" },
  { value: "high", label: "700 ou mais" },
];

export default async function ConsultasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getAdminSession();
  if (!session) return null;
  const sp = await searchParams;

  const isSales = session.role === "SALES";
  const [all, allCustomers] = await Promise.all([
    listCreditAnalyses(isSales ? { sellerId: session.id } : {}),
    listCreditCustomers(),
  ]);
  const customersById = new Map(allCustomers.map((c) => [c.id, c]));

  const sellers = Array.from(new Map(all.map((a) => [a.sellerId, a.sellerName])).entries());

  let items = all;
  if (sp.vendedor) items = items.filter((a) => a.sellerId === sp.vendedor);
  if (sp.status) items = items.filter((a) => a.commercialStatus === sp.status);
  if (sp.score === "low") items = items.filter((a) => (a.report.score ?? 0) < 500);
  if (sp.score === "mid") items = items.filter((a) => (a.report.score ?? 0) >= 500 && (a.report.score ?? 0) < 700);
  if (sp.score === "high") items = items.filter((a) => (a.report.score ?? 0) >= 700);
  if (sp.periodo) {
    const now = Date.now();
    const days = sp.periodo === "today" ? 1 : sp.periodo === "7d" ? 7 : sp.periodo === "30d" ? 30 : null;
    if (days) {
      const cutoff = sp.periodo === "today" ? new Date().setHours(0, 0, 0, 0) : now - days * 86400000;
      items = items.filter((a) => new Date(a.createdAt).getTime() >= cutoff);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Consultas realizadas</h1>
        <p className="text-sm text-ink-500">{items.length} consulta(s) de crédito registrada(s).</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <Select name="periodo" defaultValue={sp.periodo ?? ""} className="w-auto">
          {PERIOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select name="score" defaultValue={sp.score ?? ""} className="w-auto">
          {SCORE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={sp.status ?? ""} className="w-auto">
          <option value="">Qualquer status</option>
          {Object.entries(COMMERCIAL_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        {!isSales && (
          <Select name="vendedor" defaultValue={sp.vendedor ?? ""} className="w-auto">
            <option value="">Qualquer vendedor</option>
            {sellers.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>
        )}
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-medium text-white hover:bg-white/5"
        >
          Filtrar
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhuma consulta ainda"
          description="Assim que uma análise de crédito for realizada em 'Nova Análise', ela aparece aqui."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">CPF</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const customer = customersById.get(a.customerId);
                return (
                  <tr key={a.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                    <td className="px-4 py-3 text-ink-500">
                      {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/credito/${a.id}`} className="font-medium text-white hover:text-accent-400">
                        {customer?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-600">
                      {customer ? maskCpf(customer.cpf) : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{a.report.score ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[a.commercialStatus]}>
                        {COMMERCIAL_STATUS_LABELS[a.commercialStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{a.sellerName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
