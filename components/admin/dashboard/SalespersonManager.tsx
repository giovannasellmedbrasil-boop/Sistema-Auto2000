"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Salesperson } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, FormGroup } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function SalespersonManager({ salespeople }: { salespeople: Salesperson[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Salesperson | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      role: String(form.get("role") ?? "Consultor de vendas"),
      goalUnits: Number(form.get("goalUnits") ?? 0),
      active: form.get("active") === "on",
    };

    const isNew = editing === "new";
    const url = isNew ? "/api/admin/salespeople" : `/api/admin/salespeople/${(editing as Salesperson).id}`;
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
    if (!confirm(`Remover "${name}" da equipe? Isso não apaga vendas/leads já registrados dele(a).`)) return;
    await fetch(`/api/admin/salespeople/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const editTarget = editing === "new" ? null : editing;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Novo vendedor
        </Button>
      </div>

      {salespeople.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-card border border-dashed border-white/15 text-sm text-ink-500">
          Nenhum vendedor cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3 font-medium">Vendedor</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Meta mensal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {salespeople.map((s) => (
                <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} seed={s.photoSeed} size="sm" />
                      <div>
                        <div className="font-medium text-ink-900">{s.name}</div>
                        <div className="text-xs text-ink-600">{s.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    <div>{s.phone}</div>
                    <div className="text-xs text-ink-600">{s.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{s.goalUnits} veículos</td>
                  <td className="px-4 py-3">
                    <Badge tone={s.active ? "success" : "neutral"}>{s.active ? "Ativo" : "Inativo"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(s)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-700"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
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
        <Modal title={editing === "new" ? "Novo vendedor" : "Editar vendedor"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormGroup>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required defaultValue={editTarget?.name} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required defaultValue={editTarget?.email} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" required defaultValue={editTarget?.phone} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="role">Cargo</Label>
              <Input id="role" name="role" defaultValue={editTarget?.role ?? "Consultor de vendas"} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="goalUnits">Meta mensal (veículos)</Label>
              <Input id="goalUnits" name="goalUnits" type="number" min={0} defaultValue={editTarget?.goalUnits ?? 0} />
            </FormGroup>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" name="active" defaultChecked={editTarget?.active ?? true} className="h-4 w-4 rounded" />
              Vendedor ativo
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
