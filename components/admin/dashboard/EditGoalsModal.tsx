"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, FormGroup } from "@/components/ui/Field";

export function EditGoalsModal({
  salesUnitsTarget,
  revenueTarget,
}: {
  salesUnitsTarget: number;
  revenueTarget: number;
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
    const res = await fetch("/api/admin/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salesUnitsTarget: Number(form.get("salesUnitsTarget")),
        revenueTarget: Number(form.get("revenueTarget")),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar a meta.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" /> Editar meta
      </Button>

      {open && (
        <Modal title="Meta do mês" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormGroup>
              <Label htmlFor="salesUnitsTarget">Meta de vendas (veículos)</Label>
              <Input id="salesUnitsTarget" name="salesUnitsTarget" type="number" min={0} required defaultValue={salesUnitsTarget} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="revenueTarget" hint="em reais">
                Meta de faturamento
              </Label>
              <Input id="revenueTarget" name="revenueTarget" type="number" min={0} step="0.01" required defaultValue={revenueTarget} />
            </FormGroup>
            {error && <p className="text-sm text-danger-500">{error}</p>}
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando…" : "Salvar meta"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
