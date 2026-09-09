"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { LeadChannel } from "@/lib/types";
import { LEAD_CHANNEL_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, FormGroup, Select, Textarea } from "@/components/ui/Field";

const CHANNEL_OPTIONS = Object.entries(LEAD_CHANNEL_LABELS) as [LeadChannel, string][];

export function NewLeadModal({
  vehicles,
  salespeople,
  campaigns,
}: {
  vehicles: { id: string; label: string }[];
  salespeople: { id: string; name: string }[];
  campaigns: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? "") || undefined,
      vehicleId: String(form.get("vehicleId") ?? "") || null,
      ownerId: String(form.get("ownerId") ?? "") || null,
      channel: String(form.get("channel") ?? "SITE"),
      campaignId: String(form.get("campaignId") ?? "") || null,
      message: String(form.get("message") ?? "") || undefined,
    };

    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar o lead.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Novo lead
      </Button>

      {open && (
        <Modal title="Novo lead" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormGroup>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" required />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email" hint="opcional">
                  E-mail
                </Label>
                <Input id="email" name="email" type="email" />
              </FormGroup>
            </div>
            <FormGroup>
              <Label htmlFor="vehicleId" hint="opcional">
                Veículo de interesse
              </Label>
              <Select id="vehicleId" name="vehicleId" defaultValue="">
                <option value="">Nenhum específico</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="ownerId" hint="opcional">
                Vendedor responsável
              </Label>
              <Select id="ownerId" name="ownerId" defaultValue="">
                <option value="">Sem atribuição</option>
                {salespeople.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup>
                <Label htmlFor="channel">Canal / origem</Label>
                <Select id="channel" name="channel" required defaultValue="SITE">
                  {CHANNEL_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="campaignId" hint="opcional">
                  Campanha
                </Label>
                <Select id="campaignId" name="campaignId" defaultValue="">
                  <option value="">Nenhuma</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>
            <FormGroup>
              <Label htmlFor="message" hint="opcional">
                Observação
              </Label>
              <Textarea id="message" name="message" />
            </FormGroup>

            {error && <p className="text-sm text-danger-500">{error}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando…" : "Criar lead"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
