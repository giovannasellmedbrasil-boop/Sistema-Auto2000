import type { Metadata } from "next";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { getAdminSession } from "@/lib/server/auth";
import { getContractById } from "@/lib/server/db";
import { CONTRACT_TYPE_LABELS } from "@/lib/contracts/config";
import { ContractDocument } from "@/components/contratos/ContractDocument";
import { PrintButton } from "@/components/credito/PrintButton";

export const metadata: Metadata = { title: "Contrato", robots: { index: false } };

export default async function ContratoDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) notFound();

  return (
    <div className="min-h-dvh bg-ink-50 px-4 py-10 print:bg-white print:py-0">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-card border border-white/10 bg-white p-10 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-center justify-between print:hidden">
          <span className="text-xs uppercase tracking-wide text-ink-500">{CONTRACT_TYPE_LABELS[contract.type]}</span>
          <PrintButton />
        </div>
        <div className="flex justify-center print:mb-4">
          <Image src="/logo.png" alt="Auto2000 Veículos" width={896} height={444} className="h-16 w-auto" priority />
        </div>
        <ContractDocument type={contract.type} fields={contract.fields} />
      </div>
    </div>
  );
}
