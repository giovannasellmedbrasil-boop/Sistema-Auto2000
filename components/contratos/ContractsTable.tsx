"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { CONTRACT_TYPE_LABELS } from "@/lib/contracts/config";
import type { Contract } from "@/lib/types";

function contractTitle(fields: Record<string, string>): string {
  return fields.buyerName || fields.consignanteName || fields.sellerName || "Contrato";
}

export function ContractsTable({ contracts, canDelete }: { contracts: Contract[]; canDelete?: boolean }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir o contrato de ${title}? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    await fetch(`/api/contratos/${id}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">Veículo</th>
            <th className="px-4 py-3 font-medium">Placa</th>
            <th className="px-4 py-3 font-medium">Chassi</th>
            <th className="px-4 py-3 font-medium">Renavam</th>
            <th className="px-4 py-3 font-medium">Gerado em</th>
            <th className="px-4 py-3 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => {
            const title = contractTitle(c.fields);
            return (
              <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-ink-700">{CONTRACT_TYPE_LABELS[c.type]}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/contratos/${c.id}`} className="font-medium text-white hover:text-accent-400">
                    {title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-700">{c.fields.vehicleBrandModel ?? "—"}</td>
                <td className="px-4 py-3 text-ink-700">{c.fields.plate || "—"}</td>
                <td className="px-4 py-3 text-ink-700">{c.fields.chassi || "—"}</td>
                <td className="px-4 py-3 text-ink-700">{c.fields.renavam || "—"}</td>
                <td className="px-4 py-3 text-ink-500">{new Date(c.createdAt).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/contratos/${c.id}/editar`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50 hover:text-ink-700"
                      aria-label="Editar contrato"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(c.id, title)}
                        disabled={deletingId === c.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-danger-500/10 hover:text-danger-500"
                        aria-label="Excluir contrato"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
