"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { MarketingCampaign, LeadChannel } from "@/lib/types";
import { LEAD_CHANNEL_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, FormGroup, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

const CHANNEL_OPTIONS = Object.entries(LEAD_CHANNEL_LABELS) as [LeadChannel, string][];

export function CampaignManager({ campaigns }: { campaigns: MarketingCampaign[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MarketingCampaign | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      channel: String(form.get("channel") ?? "OTHER"),
      platform: String(form.get("platform") ?? ""),
      cost: Number(form.get("cost") ?? 0),
      impressions: form.get("impressions") ? Number(form.get("impressions")) : null,
      clicks: form.get("clicks") ? Number(form.get("clicks")) : null,
      startDate: String(form.get("startDate") ?? ""),
      endDate: form.get("endDate") ? String(form.get("endDate")) : null,
      active: form.get("active") === "on",
    };

    const isNew = editing === "new";
    const url = isNew ? "/api/admin/campaigns" : `/api/admin/campaigns/${(editing as MarketingCampaign).id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover a campanha "${name}"? Vendas e leads já atribuídos a ela permanecem no histórico.`)) return;
    await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const editTarget = editing === "new" ? null : editing;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Nova campanha
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-card border border-dashed border-white/15 text-sm text-ink-500">
          Nenhuma campanha cadastrada ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3 font-medium">Campanha</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Investimento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-900">{c.name}</div>
                    <div className="text-xs text-ink-600">{c.platform}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{LEAD_CHANNEL_LABELS[c.channel]}</td>
                  <td className="px-4 py-3 text-ink-700">{formatCurrency(c.cost)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={c.active ? "success" : "neutral"}>{c.active ? "Ativa" : "Encerrada"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(c)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-700"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-danger-500/10 hover:text-danger-500"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Nova campanha" : "Editar campanha"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormGroup>
              <Label htmlFor="name">Nome da campanha</Label>
              <Input id="name" name="name" required defaultValue={editTarget?.name} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="channel">Canal</Label>
              <Select id="channel" name="channel" required defaultValue={editTarget?.channel ?? "META_ADS"}>
                {CHANNEL_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="platform">Plataforma</Label>
              <Input id="platform" name="platform" required placeholder="Ex: Meta Ads, Google Ads, Webmotors" defaultValue={editTarget?.platform} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="cost" hint="em reais">
                Investimento
              </Label>
              <Input id="cost" name="cost" type="number" min={0} step="0.01" required defaultValue={editTarget?.cost} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup>
                <Label htmlFor="impressions" hint="opcional">
                  Impressões
                </Label>
                <Input id="impressions" name="impressions" type="number" min={0} defaultValue={editTarget?.impressions ?? undefined} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="clicks" hint="opcional">
                  Cliques
                </Label>
                <Input id="clicks" name="clicks" type="number" min={0} defaultValue={editTarget?.clicks ?? undefined} />
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup>
                <Label htmlFor="startDate">Início</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  defaultValue={editTarget?.startDate ? editTarget.startDate.slice(0, 10) : ""}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="endDate" hint="opcional">
                  Fim
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={editTarget?.endDate ? editTarget.endDate.slice(0, 10) : ""}
                />
              </FormGroup>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" name="active" defaultChecked={editTarget?.active ?? true} className="h-4 w-4 rounded" />
              Campanha ativa
            </label>

            {error && <p className="text-sm text-danger-500">{error}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
