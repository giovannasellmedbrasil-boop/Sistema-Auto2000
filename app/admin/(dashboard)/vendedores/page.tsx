import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { listSalespeople } from "@/lib/server/db";
import { SalespersonManager } from "@/components/admin/dashboard/SalespersonManager";

export const metadata: Metadata = { title: "Vendedores", robots: { index: false } };

export default async function AdminVendedoresPage() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) redirect("/admin");

  const salespeople = listSalespeople();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Vendedores</h1>
        <p className="text-sm text-ink-500">
          Cadastre a equipe de vendas para que o funil e o ranking do Dashboard Executivo tenham a quem atribuir leads e vendas.
        </p>
      </div>
      <SalespersonManager salespeople={salespeople} />
    </div>
  );
}
