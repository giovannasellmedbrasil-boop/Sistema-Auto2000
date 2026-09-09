import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { getCompanyFiscalProfile, listInvoices, listVehiclesAdmin } from "@/lib/server/db";
import { InvoiceManager } from "@/components/admin/dashboard/InvoiceManager";
import { maskDocument } from "@/lib/utils";

export const metadata: Metadata = { title: "Notas Fiscais", robots: { index: false } };

export default async function AdminNotasFiscaisPage() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) redirect("/admin");

  const profile = getCompanyFiscalProfile();
  // O CPF/CNPJ do comprador nunca deve sair do servidor sem máscara — mascara
  // aqui, antes de virar prop de um Client Component, em vez de mandar o
  // documento completo pro navegador e só esconder visualmente lá.
  const invoices = listInvoices().map((inv) => ({ ...inv, buyerDocument: maskDocument(inv.buyerDocument) }));
  const vehicles = listVehiclesAdmin().map((v) => ({
    id: v.id,
    label: `${v.brand} ${v.model} ${v.version} ${v.modelYear}`,
    price: v.price,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Notas Fiscais</h1>
        <p className="text-sm text-ink-500">
          Registro de emissão de NF-e para as vendas de veículos.
        </p>
      </div>
      <InvoiceManager profile={profile} invoices={invoices} vehicles={vehicles} />
    </div>
  );
}
