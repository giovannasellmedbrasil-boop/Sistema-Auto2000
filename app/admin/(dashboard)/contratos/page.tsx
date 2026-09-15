import type { Metadata } from "next";
import { FileText, Plus } from "lucide-react";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { listContracts } from "@/lib/server/db";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContractsTable } from "@/components/contratos/ContractsTable";

export const metadata: Metadata = { title: "Contratos", robots: { index: false } };

export default async function AdminContratosPage() {
  const session = await getAdminSession();
  if (!session) return null;

  const contracts = await listContracts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Contratos</h1>
          <p className="text-sm text-ink-500">
            Gere contratos de consignação, venda e troca, e recibo de compra a partir dos modelos da loja.
          </p>
        </div>
        <Button href="/admin/contratos/novo" size="sm">
          <Plus className="h-4 w-4" />
          Novo contrato
        </Button>
      </div>

      {contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum contrato gerado ainda"
          description="Clique em 'Novo contrato' para preencher os dados e gerar o documento completo."
          action={<Button href="/admin/contratos/novo">Novo contrato</Button>}
        />
      ) : (
        <ContractsTable contracts={contracts} canDelete={hasRole(session.role, ["MANAGER", "ADMIN"])} />
      )}
    </div>
  );
}
