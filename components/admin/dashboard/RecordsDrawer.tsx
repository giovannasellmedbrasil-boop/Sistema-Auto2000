"use client";

import { useEffect, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import { formatCurrency } from "@/lib/utils";

export type DrillKind = "leads" | "sales";

interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle: string | null;
  owner: string | null;
  channel: string | null;
  status: string | null;
  createdAt: string;
}

interface SaleRow {
  id: string;
  vehicle: string;
  owner: string;
  channel: string;
  finalPrice: number;
  paymentMethod: string;
  soldAt: string;
}

const LEAD_COLUMNS: CsvColumn<LeadRow>[] = [
  { header: "Nome", value: (r) => r.name },
  { header: "Telefone", value: (r) => r.phone },
  { header: "E-mail", value: (r) => r.email },
  { header: "Veículo de interesse", value: (r) => r.vehicle },
  { header: "Vendedor", value: (r) => r.owner },
  { header: "Origem", value: (r) => r.channel },
  { header: "Status", value: (r) => r.status },
  { header: "Data", value: (r) => new Date(r.createdAt).toLocaleString("pt-BR") },
];

const SALE_COLUMNS: CsvColumn<SaleRow>[] = [
  { header: "Veículo", value: (r) => r.vehicle },
  { header: "Vendedor", value: (r) => r.owner },
  { header: "Origem", value: (r) => r.channel },
  { header: "Valor", value: (r) => r.finalPrice },
  { header: "Forma de pagamento", value: (r) => r.paymentMethod },
  { header: "Data", value: (r) => new Date(r.soldAt).toLocaleString("pt-BR") },
];

export function RecordsDrawer({
  title,
  kind,
  fetchUrl,
  onClose,
}: {
  title: string;
  kind: DrillKind;
  fetchUrl: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [sales, setSales] = useState<SaleRow[]>([]);

  useEffect(() => {
    let active = true;
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (kind === "leads") setLeads(data.leads ?? []);
        else setSales(data.sales ?? []);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [fetchUrl, kind]);

  function handleExport() {
    if (kind === "leads") {
      downloadCsv(`leads-${Date.now()}.csv`, toCsv(leads, LEAD_COLUMNS));
    } else {
      downloadCsv(`vendas-${Date.now()}.csv`, toCsv(sales, SALE_COLUMNS));
    }
  }

  const count = kind === "leads" ? leads.length : sales.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-ink-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-accent-400">{title}</h3>
            <p className="text-xs text-ink-500">{loading ? "Carregando…" : `${count} registro(s)`}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || count === 0}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              aria-label="Fechar"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-ink-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : count === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-ink-500">Nenhum registro neste período.</div>
          ) : kind === "leads" ? (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-ink-100">
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Veículo</th>
                  <th className="px-4 py-3 font-medium">Vendedor</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-900">{lead.name}</div>
                      <div className="text-xs text-ink-600">{lead.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{lead.vehicle ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-700">{lead.owner ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-700">{lead.channel ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-700">{lead.status ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-500">{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-ink-100">
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
                  <th className="px-4 py-3 font-medium">Veículo</th>
                  <th className="px-4 py-3 font-medium">Vendedor</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Pagamento</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 text-ink-900">{sale.vehicle}</td>
                    <td className="px-4 py-3 text-ink-700">{sale.owner}</td>
                    <td className="px-4 py-3 text-ink-700">{sale.channel}</td>
                    <td className="px-4 py-3 text-ink-700">{formatCurrency(sale.finalPrice)}</td>
                    <td className="px-4 py-3 text-ink-700">{sale.paymentMethod}</td>
                    <td className="px-4 py-3 text-ink-500">{new Date(sale.soldAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
