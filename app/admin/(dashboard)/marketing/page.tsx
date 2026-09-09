import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { listMarketingCampaigns } from "@/lib/server/db";
import { CampaignManager } from "@/components/admin/dashboard/CampaignManager";

export const metadata: Metadata = { title: "Marketing", robots: { index: false } };

export default async function AdminMarketingPage() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) redirect("/admin");

  const campaigns = listMarketingCampaigns();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Marketing</h1>
        <p className="text-sm text-ink-500">
          Cadastre as campanhas ativas para calcular CPL, CAC, ROAS e ROI no Dashboard Executivo. O investimento é o total da campanha, em reais.
        </p>
      </div>
      <CampaignManager campaigns={campaigns} />
    </div>
  );
}
