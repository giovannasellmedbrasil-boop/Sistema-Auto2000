import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/server/auth";
import { getContractById, listVehiclesAdmin } from "@/lib/server/db";
import { ContractForm } from "@/components/contratos/ContractForm";

export const metadata: Metadata = { title: "Editar contrato", robots: { index: false } };

export default async function EditarContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return null;

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) notFound();

  const vehicles = await listVehiclesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Editar contrato</h1>
        <p className="max-w-2xl text-sm text-ink-500">Altere os dados e salve — o documento é regerado com as novas informações.</p>
      </div>
      <div className="max-w-3xl">
        <ContractForm vehicles={vehicles} contract={contract} />
      </div>
    </div>
  );
}
