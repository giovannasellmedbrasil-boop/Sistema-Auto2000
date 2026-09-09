import type { Metadata } from "next";
import Link from "next/link";
import { UserSquare2 } from "lucide-react";
import { getAdminSession } from "@/lib/server/auth";
import { listCreditAnalyses, listCreditCustomers } from "@/lib/server/db";
import { maskCpf } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Clientes", robots: { index: false } };

export default async function ClientesPage() {
  const session = await getAdminSession();
  if (!session) return null;

  const isSales = session.role === "SALES";
  const analyses = listCreditAnalyses(isSales ? { sellerId: session.id } : {});
  const visibleCustomerIds = new Set(analyses.map((a) => a.customerId));
  const customers = listCreditCustomers().filter((c) => !isSales || visibleCustomerIds.has(c.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Clientes</h1>
        <p className="text-sm text-ink-500">
          {customers.length} cliente(s) com análise de crédito registrada.
        </p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={UserSquare2}
          title="Nenhum cliente ainda"
          description="Clientes aparecem aqui assim que uma análise de crédito é realizada em 'Nova Análise'."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">CPF</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Cadastrado em</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clientes/${c.id}`} className="font-medium text-white hover:text-accent-400">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-600">{maskCpf(c.cpf)}</td>
                  <td className="px-4 py-3 text-ink-700">
                    <div>{c.phone}</div>
                    {c.email && <div className="text-xs text-ink-600">{c.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-ink-500">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
