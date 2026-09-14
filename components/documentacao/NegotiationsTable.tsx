"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, FolderSearch } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BucketBadge } from "@/components/documentacao/BucketBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NEGOTIATION_PAYMENT_METHOD_LABELS, type Negotiation, type NegotiationBucket } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export interface NegotiationRow {
  negotiation: Negotiation;
  vehicleLabel: string;
  progressPercent: number;
  bucket: NegotiationBucket;
}

export function NegotiationsTable({ rows, canDelete }: { rows: NegotiationRow[]; canDelete?: boolean }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Excluir a venda ${code}? Isso remove também o checklist e os documentos anexados. Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    await fetch(`/api/negotiations/${id}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  }

  if (rows.length === 0) {
    return <EmptyState icon={FolderSearch} title="Nenhuma venda encontrada" description="Ajuste os filtros ou cadastre uma nova venda." />;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-600">
            <th className="px-4 py-3">Venda</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Veículo</th>
            <th className="px-4 py-3">Vendedor</th>
            <th className="px-4 py-3">Pagamento</th>
            <th className="px-4 py-3">Progresso</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ negotiation, vehicleLabel, progressPercent, bucket }) => (
            <tr key={negotiation.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
              <td className="px-4 py-3">
                <Link href={`/admin/documentacao/${negotiation.id}`} className="font-medium text-accent-400 hover:underline">
                  {negotiation.code}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-800">{negotiation.customerName}</td>
              <td className="px-4 py-3 text-ink-700">{vehicleLabel}</td>
              <td className="px-4 py-3 text-ink-700">{negotiation.sellerName}</td>
              <td className="px-4 py-3 text-ink-700">
                {NEGOTIATION_PAYMENT_METHOD_LABELS[negotiation.paymentMethod]}
                <span className="block text-xs text-ink-500">{formatCurrency(negotiation.saleValue)}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <ProgressBar percent={progressPercent} className="w-24" />
                  <span className="text-xs text-ink-500">{progressPercent}%</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <BucketBadge bucket={bucket} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/documentacao/${negotiation.id}/editar`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-700"
                    aria-label="Editar venda"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(negotiation.id, negotiation.code)}
                      disabled={deletingId === negotiation.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-danger-500/10 hover:text-danger-500"
                      aria-label="Excluir venda"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
