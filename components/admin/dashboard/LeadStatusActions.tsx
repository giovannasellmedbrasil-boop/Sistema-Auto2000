"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Lead, LeadLostReason } from "@/lib/types";
import { LEAD_LOST_REASON_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, FormGroup, Select } from "@/components/ui/Field";

type SimpleAction = "contacted" | "visit" | "testDrive";
type ModalAction = "proposal" | "sold" | "lost";

const LOST_REASON_OPTIONS = Object.entries(LEAD_LOST_REASON_LABELS) as [LeadLostReason, string][];
const PAYMENT_METHODS = ["À vista", "Financiamento", "Financiamento + troca", "Consórcio contemplado", "Cartão + financiamento"];

const NEXT_SIMPLE_ACTION: Partial<Record<NonNullable<Lead["status"]>, { action: SimpleAction; label: string }>> = {
  NEW_LEAD: { action: "contacted", label: "Marcar contato" },
  IN_PROGRESS: { action: "contacted", label: "Marcar contato" },
  CONTACT_ATTEMPT: { action: "contacted", label: "Marcar contato" },
  CONTACTED: { action: "visit", label: "Registrar visita" },
  VISIT_SCHEDULED: { action: "visit", label: "Registrar visita" },
  VISITED: { action: "testDrive", label: "Registrar test-drive" },
};

export function LeadStatusActions({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const status = lead.status ?? "NEW_LEAD";

  async function callAction(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível atualizar o lead.");
      return false;
    }
    setModal(null);
    router.refresh();
    return true;
  }

  if (status === "SOLD" || status === "LOST") {
    return null;
  }

  const simple = NEXT_SIMPLE_ACTION[status];
  const canPropose = status === "TEST_DRIVE_DONE";
  const canSell = status === "PROPOSAL_SENT" || status === "NEGOTIATING";

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-500" />}
      {simple && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => callAction({ action: simple.action })}>
          {simple.label}
        </Button>
      )}
      {canPropose && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => setModal("proposal")}>
          Enviar proposta
        </Button>
      )}
      {canSell && (
        <Button size="sm" disabled={loading} onClick={() => setModal("sold")}>
          Registrar venda
        </Button>
      )}
      <Button size="sm" variant="ghost" disabled={loading} onClick={() => setModal("lost")}>
        Marcar perdido
      </Button>

      {modal === "proposal" && (
        <Modal title="Enviar proposta" onClose={() => setModal(null)}>
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const value = Number(new FormData(e.currentTarget).get("proposalValue"));
              callAction({ action: "proposal", proposalValue: value });
            }}
            className="flex flex-col gap-4"
          >
            <FormGroup>
              <Label htmlFor="proposalValue" hint="em reais">
                Valor proposto
              </Label>
              <Input id="proposalValue" name="proposalValue" type="number" min={0} step="0.01" required autoFocus />
            </FormGroup>
            {error && <p className="text-sm text-danger-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Confirmar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "sold" && (
        <Modal title="Registrar venda" onClose={() => setModal(null)}>
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              callAction({
                action: "sold",
                finalPrice: Number(form.get("finalPrice")),
                paymentMethod: String(form.get("paymentMethod")),
              });
            }}
            className="flex flex-col gap-4"
          >
            <FormGroup>
              <Label htmlFor="finalPrice" hint="em reais">
                Valor final
              </Label>
              <Input
                id="finalPrice"
                name="finalPrice"
                type="number"
                min={0}
                step="0.01"
                required
                autoFocus
                defaultValue={lead.proposalValue ?? undefined}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="paymentMethod">Forma de pagamento</Label>
              <Select id="paymentMethod" name="paymentMethod" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </FormGroup>
            {error && <p className="text-sm text-danger-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Confirmar venda
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "lost" && (
        <Modal title="Marcar como perdido" onClose={() => setModal(null)}>
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const reason = String(new FormData(e.currentTarget).get("reason"));
              callAction({ action: "lost", reason });
            }}
            className="flex flex-col gap-4"
          >
            <FormGroup>
              <Label htmlFor="reason">Motivo da perda</Label>
              <Select id="reason" name="reason" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {LOST_REASON_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </FormGroup>
            {error && <p className="text-sm text-danger-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="outline" disabled={loading}>
                Confirmar
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
