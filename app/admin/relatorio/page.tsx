import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getAdminSession } from "@/lib/server/auth";
import { getDashboardData, parseDashboardFilters } from "@/lib/server/dashboard";
import { LEAD_CHANNEL_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "@/components/credito/PrintButton";

export const metadata: Metadata = { title: "Relatório Executivo", robots: { index: false } };

export default async function RelatorioExecutivoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const filters = parseDashboardFilters(new URLSearchParams(sp as Record<string, string>));
  const data = await getDashboardData(filters);

  return (
    <div className="min-h-dvh bg-ink-50 px-4 py-10 print:bg-white print:py-0">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-card border border-white/10 bg-ink-100 p-8 print:border-0 print:bg-white print:text-black print:shadow-none">
        <div className="flex items-center justify-between">
          <Image src="/logo.png" alt="Auto2000 Veículos" width={896} height={444} className="h-9 w-auto rounded-md" />
          <PrintButton />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-accent-400 print:text-black">Relatório Executivo</h1>
          <p className="text-sm text-ink-500 print:text-black/60">{data.period.label}</p>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600 print:text-black/70">Indicadores principais</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Leads", data.kpis.leads.value],
              ["Contatos", data.kpis.contacted.value],
              ["Visitas", data.kpis.visits.value],
              ["Test-drives", data.kpis.testDrives.value],
              ["Propostas", data.kpis.proposals.value],
              ["Vendas", data.kpis.sales.value],
              ["Faturamento", formatCurrency(data.kpis.revenue.value)],
              ["Ticket médio", data.kpis.avgTicket != null ? formatCurrency(data.kpis.avgTicket) : "—"],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-xl border border-white/10 p-3 print:border-black/10">
                <div className="text-lg font-semibold text-ink-950 print:text-black">{value}</div>
                <div className="text-xs text-ink-500 print:text-black/60">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600 print:text-black/70">Funil comercial</h2>
          <table className="w-full text-sm">
            <tbody>
              {data.funnel.map((stage) => (
                <tr key={stage.key} className="border-b border-white/10 print:border-black/10">
                  <td className="py-2 text-ink-800 print:text-black">{stage.label}</td>
                  <td className="py-2 text-right font-medium text-ink-950 print:text-black">{stage.count}</td>
                  <td className="py-2 text-right text-xs text-ink-500 print:text-black/60">
                    {stage.conversionFromPrev != null ? `${stage.conversionFromPrev}% conv.` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600 print:text-black/70">Marketing</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Investimento", formatCurrency(data.marketing.investment)],
              ["Receita atribuída", formatCurrency(data.marketing.revenue)],
              ["ROAS", data.marketing.roas != null ? `${data.marketing.roas}x` : "—"],
              ["ROI", data.marketing.roiPct != null ? `${data.marketing.roiPct}%` : "—"],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-xl border border-white/10 p-3 print:border-black/10">
                <div className="text-lg font-semibold text-ink-950 print:text-black">{value}</div>
                <div className="text-xs text-ink-500 print:text-black/60">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600 print:text-black/70">Vendedores</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase text-ink-600 print:border-black/10 print:text-black/60">
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium text-right">Vendas</th>
                <th className="py-2 font-medium text-right">Faturamento</th>
                <th className="py-2 font-medium text-right">Conversão</th>
              </tr>
            </thead>
            <tbody>
              {data.salespeople.map((s) => (
                <tr key={s.id} className="border-b border-white/10 print:border-black/10">
                  <td className="py-2 text-ink-800 print:text-black">{s.name}</td>
                  <td className="py-2 text-right text-ink-800 print:text-black">{s.sales}</td>
                  <td className="py-2 text-right text-ink-800 print:text-black">{formatCurrency(s.revenue)}</td>
                  <td className="py-2 text-right text-ink-800 print:text-black">{s.conversionPct != null ? `${s.conversionPct}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600 print:text-black/70">Origem dos leads</h2>
          <table className="w-full text-sm">
            <tbody>
              {data.originBreakdown.map((row) => (
                <tr key={row.channel} className="border-b border-white/10 print:border-black/10">
                  <td className="py-2 text-ink-800 print:text-black">{LEAD_CHANNEL_LABELS[row.channel]}</td>
                  <td className="py-2 text-right text-ink-800 print:text-black">{row.count} leads</td>
                  <td className="py-2 text-right text-ink-800 print:text-black">{row.sales} vendas</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600 print:text-black/70">Principais insights</h2>
          <ul className="flex flex-col gap-1.5 text-sm text-ink-800 print:text-black">
            {data.insights.map((insight, i) => (
              <li key={i}>• {insight}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
