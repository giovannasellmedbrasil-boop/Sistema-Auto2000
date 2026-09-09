import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, hasRole, listDemoUsers } from "@/lib/server/auth";
import { USER_ROLE_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Usuários", robots: { index: false } };

export default async function UsuariosPage() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["ADMIN"])) redirect("/admin");

  const users = listDemoUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Usuários</h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Perfis de acesso da seção 14 do briefing (Vendedor, Gerente, Administrador). Neste ambiente
          de demonstração, os usuários são fixos por variável de ambiente — cadastro/edição de
          usuários entra quando o provedor de autenticação real (ex: NextAuth) for integrado.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-600">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="px-4 py-3 font-medium">Permissões</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink-50 last:border-0">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-ink-700">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone="accent">{USER_ROLE_LABELS[u.role]}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-ink-600">{PERMISSIONS[u.role]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const PERMISSIONS: Record<string, string> = {
  SALES: "Cadastrar cliente, solicitar consulta, ver seus clientes/consultas, simular financiamento",
  MANAGER: "Tudo do vendedor + ver todos os vendedores, consultas, propostas e indicadores",
  ADMIN: "Tudo do gerente + gerenciar usuários, integrações, Serasa, financeiras e permissões",
};
