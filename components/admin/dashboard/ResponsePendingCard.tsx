"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RecordsDrawer } from "@/components/admin/dashboard/RecordsDrawer";
import type { DashboardData } from "@/lib/server/dashboard";

export function ResponsePendingCard({
  responseTime,
  filtersQuery,
}: {
  responseTime: DashboardData["responseTime"];
  filtersQuery: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4.5 w-4.5 text-ink-600" />
        <div>
          <div className="text-2xl font-semibold text-ink-950">
            {responseTime.avgMinutes != null ? `${Math.floor(responseTime.avgMinutes)} min` : "—"}
          </div>
          <div className="text-xs text-ink-500">Tempo médio de primeiro atendimento</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-success-500/10 py-2 text-success-600">🟢 {responseTime.under5} · &lt;5min</div>
        <div className="rounded-lg bg-warning-500/10 py-2 text-warning-500">🟡 {responseTime.from5to15} · 5–15min</div>
        <div className="rounded-lg bg-danger-500/10 py-2 text-danger-500">🔴 {responseTime.over15} · &gt;15min</div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <span className="text-sm text-ink-800">
          Leads ainda não atendidos: <span className="font-semibold text-ink-950">{responseTime.pendingLeads.length}</span>
        </span>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={responseTime.pendingLeads.length === 0}>
          Ver leads pendentes
        </Button>
      </div>

      {open && (
        <RecordsDrawer
          title="Leads aguardando atendimento"
          kind="leads"
          fetchUrl={`/api/admin/leads?${filtersQuery}&metric=pending`}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
