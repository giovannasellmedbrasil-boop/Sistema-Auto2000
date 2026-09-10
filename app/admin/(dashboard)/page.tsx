import type { Metadata } from "next";
import { getDashboardMetrics } from "@/lib/server/db";
import { getDashboardData, parseDashboardFilters, filtersToQueryString } from "@/lib/server/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Clock, AlertTriangle } from "lucide-react";
import { FilterBar } from "@/components/admin/dashboard/FilterBar";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { FunnelChart } from "@/components/admin/dashboard/FunnelChart";
import { OriginBreakdown } from "@/components/admin/dashboard/OriginBreakdown";
import { ChannelTable } from "@/components/admin/dashboard/ChannelTable";
import { CampaignTable } from "@/components/admin/dashboard/CampaignTable";
import { SalespersonRanking } from "@/components/admin/dashboard/SalespersonRanking";
import { ResponsePendingCard } from "@/components/admin/dashboard/ResponsePendingCard";
import { GoalProgress } from "@/components/admin/dashboard/GoalProgress";
import { EditGoalsModal } from "@/components/admin/dashboard/EditGoalsModal";
import { ForecastCard } from "@/components/admin/dashboard/ForecastCard";
import { StockDemandTable } from "@/components/admin/dashboard/StockDemandTable";
import { TimeSeriesChart } from "@/components/admin/dashboard/TimeSeriesChart";
import { DistributionSection } from "@/components/admin/dashboard/DistributionSection";
import { InsightsPanel } from "@/components/admin/dashboard/InsightsPanel";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Visão Executiva", robots: { index: false } };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const urlParams = new URLSearchParams(Object.entries(sp).filter(([, v]) => v != null) as [string, string][]);
  const filters = parseDashboardFilters(urlParams);
  const data = getDashboardData(filters);
  const filtersQuery = filtersToQueryString(filters);

  const m = getDashboardMetrics();

  const stockHealth = [
    { label: "0–30 dias", value: m.stock0to30, tone: "text-success-600" },
    { label: "31–60 dias", value: m.stock31to60, tone: "text-ink-700" },
    { label: "61–90 dias", value: m.stock61to90, tone: "text-warning-500" },
    { label: "+90 dias", value: m.stock90plus, tone: "text-danger-500" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Visão Executiva</h1>
          <p className="text-sm text-ink-500">
            Funil comercial, marketing e vendas · {data.period.label}
          </p>
        </div>
        <Button variant="outline" size="sm" href={`/admin/relatorio?${filtersQuery}`}>
          Exportar relatório
        </Button>
      </div>

      <FilterBar options={data.filterOptions} />

      {/* Cards de indicadores principais (seção 2) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Leads recebidos"
          value={String(data.kpis.leads.value)}
          icon="users"
          deltaPct={data.kpis.leads.deltaPct}
          direction={data.kpis.leads.direction}
          drill={{ metric: "leads", kind: "leads", title: "Leads recebidos" }}
          filtersQuery={filtersQuery}
        />
        <StatCard
          label="Contatos realizados"
          value={String(data.kpis.contacted.value)}
          sublabel={data.kpis.contactedRatePct != null ? `${data.kpis.contactedRatePct}% dos leads` : undefined}
          icon="phone-call"
          deltaPct={data.kpis.contacted.deltaPct}
          direction={data.kpis.contacted.direction}
          drill={{ metric: "contacted", kind: "leads", title: "Contatos realizados" }}
          filtersQuery={filtersQuery}
        />
        <StatCard
          label="Visitas"
          value={String(data.kpis.visits.value)}
          sublabel={data.kpis.visitRatePct != null ? `${data.kpis.visitRatePct}% dos contatados` : undefined}
          icon="calendar"
          deltaPct={data.kpis.visits.deltaPct}
          direction={data.kpis.visits.direction}
          drill={{ metric: "visits", kind: "leads", title: "Visitas" }}
          filtersQuery={filtersQuery}
        />
        <StatCard
          label="Test-drives"
          value={String(data.kpis.testDrives.value)}
          sublabel={data.kpis.testDriveRatePct != null ? `${data.kpis.testDriveRatePct}% das visitas` : undefined}
          icon="car"
          deltaPct={data.kpis.testDrives.deltaPct}
          direction={data.kpis.testDrives.direction}
          drill={{ metric: "testDrives", kind: "leads", title: "Test-drives" }}
          filtersQuery={filtersQuery}
        />
        <StatCard
          label="Propostas"
          value={String(data.kpis.proposals.value)}
          sublabel={data.kpis.proposalRatePct != null ? `${data.kpis.proposalRatePct}% dos test-drives` : undefined}
          icon="file-text"
          deltaPct={data.kpis.proposals.deltaPct}
          direction={data.kpis.proposals.direction}
          drill={{ metric: "proposals", kind: "leads", title: "Propostas" }}
          filtersQuery={filtersQuery}
        />
        <StatCard
          label="Veículos vendidos"
          value={String(data.kpis.sales.value)}
          icon="trending-up"
          deltaPct={data.kpis.sales.deltaPct}
          direction={data.kpis.sales.direction}
          drill={{ metric: "sold", kind: "sales", title: "Vendas realizadas" }}
          filtersQuery={filtersQuery}
        />
        <StatCard
          label="Faturamento"
          value={formatCurrency(data.kpis.revenue.value)}
          icon="dollar-sign"
          deltaPct={data.kpis.revenue.deltaPct}
          direction={data.kpis.revenue.direction}
          drill={{ metric: "sold", kind: "sales", title: "Vendas realizadas" }}
          filtersQuery={filtersQuery}
        />
        <StatCard
          label="Ticket médio"
          value={data.kpis.avgTicket != null ? formatCurrency(data.kpis.avgTicket) : "—"}
          icon="receipt"
          filtersQuery={filtersQuery}
        />
      </div>

      {/* Funil comercial (seção 3) */}
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold text-accent-400">Funil comercial</h2>
        <FunnelChart stages={data.funnel} bottleneck={data.bottleneck} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Origem dos leads (seção 4) */}
        <Card className="p-6">
          <h2 className="mb-5 text-base font-semibold text-accent-400">Origem dos leads</h2>
          <OriginBreakdown rows={data.originBreakdown} />
        </Card>

        {/* Insights automáticos (seção 15) */}
        <Card className="p-6">
          <h2 className="mb-5 text-base font-semibold text-accent-400">Insights da IA</h2>
          <InsightsPanel insights={data.insights} />
        </Card>
      </div>

      {/* Performance por canal (seção 5) */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-accent-400">Performance por canal</h2>
        <ChannelTable rows={data.channelTable} />
      </div>

      {/* Performance de marketing / ROI (seção 6) */}
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold text-accent-400">Performance de marketing</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            ["Investimento em mídia", formatCurrency(data.marketing.investment)],
            ["Receita atribuída", formatCurrency(data.marketing.revenue)],
            ["CPL", data.marketing.cpl != null ? formatCurrency(data.marketing.cpl) : "—"],
            ["CAC", data.marketing.cac != null ? formatCurrency(data.marketing.cac) : "—"],
            ["ROAS", data.marketing.roas != null ? `${data.marketing.roas}x` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-xl font-semibold text-ink-950">{value}</span>
              <span className="text-xs text-ink-500">{label}</span>
            </div>
          ))}
        </div>
        {data.marketing.roiPct != null && (
          <div className="mt-4 rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-sm font-semibold text-accent-400">
            ROI: {data.marketing.roiPct}%
          </div>
        )}
      </Card>

      {/* Performance das campanhas (seção 7) */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-accent-400">Performance das campanhas</h2>
        <CampaignTable rows={data.campaignTable} />
      </div>

      {/* Performance dos vendedores (seção 8) */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-accent-400">Performance dos vendedores</h2>
        <SalespersonRanking rows={data.salespeople} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tempo de resposta + leads sem atendimento (seções 9, 14) */}
        <Card className="p-6">
          <h2 className="mb-5 text-base font-semibold text-accent-400">Tempo de resposta aos leads</h2>
          <ResponsePendingCard responseTime={data.responseTime} filtersQuery={filtersQuery} />
        </Card>

        {/* Previsão de fechamento (seção 12) */}
        <Card className="p-6">
          <h2 className="mb-5 text-base font-semibold text-accent-400">Previsão de fechamento do mês</h2>
          <ForecastCard forecast={data.forecast} />
        </Card>
      </div>

      {/* Metas (seções 10, 11) */}
      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-accent-400">Meta do mês</h2>
          <EditGoalsModal salesUnitsTarget={data.goals.salesUnitsTarget} revenueTarget={data.goals.revenueTarget} />
        </div>
        <GoalProgress goals={data.goals} />
      </Card>

      {/* Gráficos de vendas e faturamento (seções 16, 17) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-5 text-base font-semibold text-accent-400">Vendas ao longo do tempo</h2>
          <TimeSeriesChart data={data.salesOverTime} kind="count" />
        </Card>
        <Card className="p-6">
          <h2 className="mb-5 text-base font-semibold text-accent-400">Faturamento ao longo do tempo</h2>
          <TimeSeriesChart data={data.revenueOverTime} kind="currency" />
        </Card>
      </div>

      {/* Distribuição de vendas (seção 18) */}
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold text-accent-400">Distribuição de vendas</h2>
        <DistributionSection distribution={data.distribution} />
      </Card>

      {/* Estoque x demanda (seção 13) */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-accent-400">Estoque x demanda</h2>
        <StockDemandTable rows={data.stockDemand} />
      </div>

      {/* Saúde do estoque (aging) — já existia, mantido */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-ink-600" />
          <h2 className="text-base font-semibold text-accent-400">Saúde do estoque</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stockHealth.map(({ label, value, tone }) => (
            <Card key={label} className="flex flex-col gap-1 p-5">
              <span className={`text-2xl font-semibold ${tone}`}>{value}</span>
              <span className="text-xs text-ink-500">{label}</span>
            </Card>
          ))}
        </div>
        {m.stock90plus > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-sm text-warning-500">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            {m.stock90plus} veículo(s) parado(s) há mais de 90 dias — considere revisão de preço ou campanha dedicada.
          </div>
        )}
      </div>

    </div>
  );
}
