import type { Metadata } from "next";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Landmark,
  Truck,
  UserCheck,
  ClipboardList,
  PackageCheck,
  Plus,
  ListChecks,
} from "lucide-react";
import { getAdminSession } from "@/lib/server/auth";
import {
  getChecklistItems,
  getNegotiationDashboardMetrics,
  listVehiclesAdmin,
  listNegotiations,
  listSalespeople,
} from "@/lib/server/db";
import { classifyNegotiation, computeProgressPercent } from "@/lib/server/documentChecklist";
import type { NegotiationBucket, NegotiationPaymentMethod, NegotiationStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NegotiationFiltersBar } from "@/components/documentacao/NegotiationFiltersBar";
import { NegotiationsTable, type NegotiationRow } from "@/components/documentacao/NegotiationsTable";

export const metadata: Metadata = { title: "Documentação", robots: { index: false } };

export default async function DocumentacaoDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getAdminSession();
  if (!session) return null;
  const sp = await searchParams;

  const isSales = session.role === "SALES";
  const [metrics, allSellers, negotiations, vehicles] = await Promise.all([
    getNegotiationDashboardMetrics(),
    listSalespeople(),
    listNegotiations({
      q: sp.q,
      sellerId: isSales ? session.id : sp.sellerId,
      status: sp.status as NegotiationStatus | undefined,
      bucket: sp.bucket as NegotiationBucket | undefined,
      paymentMethod: sp.paymentMethod as NegotiationPaymentMethod | undefined,
    }),
    listVehiclesAdmin(),
  ]);
  const sellers = allSellers.filter((s) => s.active).map((s) => ({ id: s.id, name: s.name }));
  const vehiclesById = new Map(vehicles.map((v) => [v.id, v]));

  const rows: NegotiationRow[] = await Promise.all(
    negotiations.map(async (negotiation) => {
      const items = await getChecklistItems(negotiation.id);
      const vehicle = vehiclesById.get(negotiation.vehicleId);
      return {
        negotiation,
        vehicleLabel: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.version}` : "—",
        progressPercent: computeProgressPercent(items),
        bucket: classifyNegotiation(items),
      };
    })
  );

  const cards = [
    { label: "Vendas em andamento", value: metrics.inProgress, icon: ClipboardList },
    { label: "Documentações completas", value: metrics.complete, icon: CheckCircle2 },
    { label: "Documentações pendentes", value: metrics.pending, icon: Clock },
    { label: "Aguardando cliente", value: metrics.awaitingClient, icon: UserCheck },
    { label: "Aguardando banco/financeira", value: metrics.awaitingBank, icon: Landmark },
    { label: "Aguardando despachante", value: metrics.awaitingCourier, icon: Truck },
    { label: "Liberados para entrega", value: metrics.readyForDelivery, icon: PackageCheck },
    { label: "Pendências críticas", value: metrics.critical, icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Assistente de Documentação</h1>
          <p className="text-sm text-ink-500">{metrics.inProgress} venda(s) em andamento.</p>
        </div>
        <div className="flex gap-2">
          <Button href="/admin/documentacao/pendencias" variant="outline" size="sm">
            <ListChecks className="h-4 w-4" />
            Central de pendências
          </Button>
          <Button href="/admin/documentacao/nova" size="sm">
            <Plus className="h-4 w-4" />
            Nova venda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex flex-col gap-2 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.6} />
            </span>
            <span className="text-2xl font-semibold text-ink-950">{value}</span>
            <span className="text-xs text-ink-500">{label}</span>
          </Card>
        ))}
      </div>

      <NegotiationFiltersBar sellers={sellers} />
      <NegotiationsTable rows={rows} />
    </div>
  );
}
