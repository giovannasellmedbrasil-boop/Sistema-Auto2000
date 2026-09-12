import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { getAdminSession } from "@/lib/server/auth";
import { listContracts } from "@/lib/server/db";
import { CONTRACT_TYPE_LABELS } from "@/lib/contracts/config";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Contratos", robots: { index: false } };

function contractTitle(fields: Record<string, string>): string {
  return (
    fields.buyerName ||
    fields.consignanteName ||
    fields.sellerName ||
    "Contrato"
  );
}

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
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Parte</th>
                <th className="px-4 py-3 font-medium">Veículo</th>
                <th className="px-4 py-3 font-medium">Gerado em</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-ink-700">{CONTRACT_TYPE_LABELS[c.type]}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/contratos/${c.id}`} className="font-medium text-white hover:text-accent-400">
                      {contractTitle(c.fields)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{c.fields.vehicleBrandModel ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(c.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
