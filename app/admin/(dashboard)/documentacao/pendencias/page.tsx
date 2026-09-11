import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/server/auth";
import { getChecklistItems, listVehiclesAdmin, listNegotiations } from "@/lib/server/db";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListChecks } from "lucide-react";

export const metadata: Metadata = { title: "Central de Pendências", robots: { index: false } };

interface PendingRow {
  negotiationId: string;
  code: string;
  customerName: string;
  vehicleLabel: string;
  label: string;
  responsible: string;
  dueDate: string | null;
  updatedAt: string;
}

export default async function CentralDePendenciasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getAdminSession();
  if (!session) return null;
  const sp = await searchParams;
  const sort = sp.sort === "oldest" ? "oldest" : "urgent";

  const isSales = session.role === "SALES";
  const [allNegotiations, vehicles] = await Promise.all([
    listNegotiations(isSales ? { sellerId: session.id } : {}),
    listVehiclesAdmin(),
  ]);
  const negotiations = allNegotiations.filter((n) => n.status === "IN_PROGRESS");
  const vehiclesById = new Map(vehicles.map((v) => [v.id, v]));

  const rows: PendingRow[] = [];
  for (const negotiation of negotiations) {
    const items = await getChecklistItems(negotiation.id);
    const vehicle = vehiclesById.get(negotiation.vehicleId);
    const vehicleLabel = vehicle ? `${vehicle.brand} ${vehicle.model}` : "—";
    for (const item of items) {
      if (!item.required || item.status === "APPROVED" || item.status === "NOT_APPLICABLE") continue;
      rows.push({
        negotiationId: negotiation.id,
        code: negotiation.code,
        customerName: negotiation.customerName,
        vehicleLabel,
        label: item.label,
        responsible: item.responsible ?? negotiation.documentationResponsible ?? "—",
        dueDate: item.dueDate ?? null,
        updatedAt: item.updatedAt,
      });
    }
  }

  rows.sort((a, b) => {
    if (sort === "oldest") return a.updatedAt < b.updatedAt ? -1 : 1;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Central de Pendências</h1>
        <p className="text-sm text-ink-500">{rows.length} pendência(s) em {negotiations.length} venda(s) em andamento.</p>
      </div>

      <div className="flex gap-2 text-sm">
        <Link
          href="/admin/documentacao/pendencias?sort=urgent"
          className={sort === "urgent" ? "font-semibold text-accent-400" : "text-ink-500 hover:text-ink-700"}
        >
          Mais urgentes
        </Link>
        <span className="text-ink-500">·</span>
        <Link
          href="/admin/documentacao/pendencias?sort=oldest"
          className={sort === "oldest" ? "font-semibold text-accent-400" : "text-ink-500 hover:text-ink-700"}
        >
          Mais antigas
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ListChecks} title="Nenhuma pendência em aberto" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3">Venda</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3">Pendência</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/documentacao/${row.negotiationId}`} className="font-medium text-accent-400 hover:underline">
                      {row.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-800">{row.customerName}</td>
                  <td className="px-4 py-3 text-ink-700">{row.vehicleLabel}</td>
                  <td className="px-4 py-3 text-ink-700">{row.label}</td>
                  <td className="px-4 py-3 text-ink-700">{row.responsible}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {row.dueDate ? new Date(row.dueDate).toLocaleDateString("pt-BR") : "Aguardando"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
