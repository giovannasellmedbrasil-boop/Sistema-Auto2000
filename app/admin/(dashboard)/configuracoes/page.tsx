import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { isServiceConfigured, getServiceEnvironment } from "@/lib/server/serasa";
import { listAuditLogs } from "@/lib/server/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Configurações", robots: { index: false } };

export default async function ConfiguracoesPage() {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["ADMIN"])) redirect("/admin");

  const configured = isServiceConfigured();
  const environment = getServiceEnvironment();
  const logs = listAuditLogs(30);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Configurações</h1>
        <p className="text-sm text-ink-500">Integrações, credenciais e auditoria (seção 14).</p>
      </div>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-base font-semibold text-accent-400">Integração Serasa Experian</h2>
        <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
          configured
            ? "border-success-500/30 bg-success-500/10 text-success-600"
            : "border-warning-500/30 bg-warning-500/10 text-warning-500"
        }`}>
          {configured ? (
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          )}
          <p>
            {configured
              ? `Credenciais detectadas — ambiente "${environment}". As consultas usam a API oficial.`
              : "Nenhuma credencial configurada. As análises de crédito rodam em MODO DEMO, com dados fictícios claramente identificados."}
          </p>
        </div>
        <p className="text-xs text-ink-600">
          As credenciais (SERASA_API_URL, SERASA_CLIENT_ID, SERASA_CLIENT_SECRET, SERASA_API_KEY,
          SERASA_ENVIRONMENT) ficam exclusivamente em variáveis de ambiente no servidor — nunca são
          editáveis por aqui nem expostas ao navegador. Ajuste-as no arquivo de ambiente e reinicie a
          aplicação.
        </p>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-accent-400" />
          <h2 className="text-base font-semibold text-accent-400">Logs de acesso e de consultas</h2>
        </div>
        <p className="text-xs text-ink-600">
          Últimos {logs.length} eventos. CPFs completos, tokens e credenciais nunca são gravados nos
          logs.
        </p>
        {logs.length === 0 ? (
          <p className="text-sm text-ink-500">Nenhum evento registrado ainda.</p>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <Badge tone={log.type === "LOGIN_FAILED" ? "warning" : "neutral"}>{log.type}</Badge>
                <span className="text-ink-700">{log.detail}</span>
                <span className="ml-auto shrink-0 text-xs text-ink-500">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
