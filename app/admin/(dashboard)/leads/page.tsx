import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { listLeads, listVehiclesAdmin, listSalespeople, listMarketingCampaigns } from "@/lib/server/db";
import { LEAD_CHANNEL_LABELS, LEAD_LOST_REASON_LABELS, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewLeadModal } from "@/components/admin/dashboard/NewLeadModal";
import { LeadStatusActions } from "@/components/admin/dashboard/LeadStatusActions";

export const metadata: Metadata = { title: "Leads", robots: { index: false } };

const STATUS_TONE: Record<LeadStatus, "accent" | "warning" | "success" | "neutral"> = {
  NEW_LEAD: "accent",
  IN_PROGRESS: "accent",
  CONTACT_ATTEMPT: "accent",
  CONTACTED: "warning",
  VISIT_SCHEDULED: "warning",
  VISITED: "warning",
  TEST_DRIVE_DONE: "warning",
  PROPOSAL_SENT: "warning",
  NEGOTIATING: "warning",
  SOLD: "success",
  LOST: "neutral",
};

export default async function AdminLeadsPage() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) redirect("/admin");

  const [leads, salespeopleList, allVehicles, campaigns] = await Promise.all([
    listLeads(),
    listSalespeople(),
    listVehiclesAdmin(),
    listMarketingCampaigns(),
  ]);
  const salespeopleById = new Map(salespeopleList.map((s) => [s.id, s]));
  const vehiclesById = new Map(allVehicles.map((v) => [v.id, v]));
  const vehicleOptions = allVehicles.map((v) => ({ id: v.id, label: `${v.brand} ${v.model} ${v.version}` }));
  const salespeopleOptions = salespeopleList.map((s) => ({ id: s.id, name: s.name }));
  const campaignOptions = campaigns.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Leads</h1>
          <p className="text-sm text-ink-500">{leads.length} lead(s) no funil.</p>
        </div>
        <NewLeadModal vehicles={vehicleOptions} salespeople={salespeopleOptions} campaigns={campaignOptions} />
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum lead ainda"
          description="Cadastre um lead manualmente com o botão acima, ou aguarde que um visitante do site demonstre interesse em um veículo."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Veículo de interesse</th>
                <th className="px-4 py-3 font-medium">Vendedor</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const vehicle = lead.vehicleId ? vehiclesById.get(lead.vehicleId) : undefined;
                const owner = lead.ownerId ? salespeopleById.get(lead.ownerId) : undefined;
                const status = lead.status ?? "NEW_LEAD";
                return (
                  <tr key={lead.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-900">{lead.name}</div>
                      <div className="text-xs text-ink-600">{lead.phone}</div>
                      {lead.message && (
                        <div className="mt-0.5 max-w-xs truncate text-xs text-ink-600" title={lead.message}>
                          {lead.message}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}</td>
                    <td className="px-4 py-3 text-ink-700">{owner?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-700">{lead.channel ? LEAD_CHANNEL_LABELS[lead.channel] : "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[status]}>{LEAD_STATUS_LABELS[status]}</Badge>
                      {status === "LOST" && lead.lostReason && (
                        <div className="mt-1 text-[11px] text-ink-600">{LEAD_LOST_REASON_LABELS[lead.lostReason]}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <LeadStatusActions lead={lead} />
                    </td>
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
