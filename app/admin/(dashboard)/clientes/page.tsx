import type { Metadata } from "next";
import { getAdminSession } from "@/lib/server/auth";
import { listSalesCustomers } from "@/lib/server/db";
import { maskDocument } from "@/lib/utils";
import { ClientesManager } from "@/components/admin/dashboard/ClientesManager";

export const metadata: Metadata = { title: "Clientes", robots: { index: false } };

export default async function AdminClientesPage() {
  const session = await getAdminSession();
  if (!session) return null;

  // CPF/CNPJ nunca sai do servidor sem máscara — a tabela mostra o valor
  // mascarado; o formulário de edição busca o registro completo sob demanda
  // (GET /api/clientes/[id]) só quando alguém realmente clica em editar, em
  // vez de embutir o documento completo no HTML da listagem.
  const customers = (await listSalesCustomers()).map((c) => ({ ...c, document: maskDocument(c.document) }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Clientes</h1>
        <p className="text-sm text-ink-500">
          Cadastro de clientes com dados de contato, endereço e CNH.
        </p>
      </div>
      <ClientesManager customers={customers} />
    </div>
  );
}
