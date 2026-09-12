"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import type { SalesCustomer } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, FormGroup } from "@/components/ui/Field";

// A listagem chega com o documento (CPF/CNPJ) já mascarado pelo servidor —
// ao editar, buscamos o registro completo sob demanda em vez de guardar o
// valor real na página desde o início.
type MaskedCustomer = SalesCustomer;

export function ClientesManager({ customers }: { customers: MaskedCustomer[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SalesCustomer | "new" | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openEdit(id: string) {
    setLoadingEdit(id);
    setError(null);
    try {
      const res = await fetch(`/api/clientes/${id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.customer) {
        setError(data?.error ?? "Não foi possível carregar o cliente.");
        return;
      }
      setEditing(data.customer);
    } finally {
      setLoadingEdit(null);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      document: String(form.get("document") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? "") || null,
      address: String(form.get("address") ?? ""),
      cep: String(form.get("cep") ?? ""),
      cnhNumber: String(form.get("cnhNumber") ?? ""),
    };

    const isNew = editing === "new";
    const url = isNew ? "/api/clientes" : `/api/clientes/${(editing as SalesCustomer).id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
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
    if (!confirm(`Remover o cadastro de "${name}"?`)) return;
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const editTarget = editing === "new" ? null : editing;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Novo cliente
        </Button>
      </div>

      {error && !editing && <p className="text-sm text-danger-500">{error}</p>}

      {customers.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-card border border-dashed border-white/15 text-sm text-ink-500">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">CNH</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-900">{c.name}</div>
                    <div className="text-xs text-ink-600">{c.address}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-600">{c.document}</td>
                  <td className="px-4 py-3 text-ink-700">
                    <div>{c.phone}</div>
                    {c.email && <div className="text-xs text-ink-600">{c.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{c.cnhNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c.id)}
                        disabled={loadingEdit === c.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-700"
                        aria-label="Editar"
                      >
                        {loadingEdit === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
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
        <Modal title={editing === "new" ? "Novo cliente" : "Editar cliente"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormGroup>
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" name="name" required defaultValue={editTarget?.name} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="document">CPF/CNPJ</Label>
              <Input id="document" name="document" required defaultValue={editTarget?.document} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" required defaultValue={editTarget?.phone} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" defaultValue={editTarget?.email ?? ""} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" name="cep" required defaultValue={editTarget?.cep} placeholder="00000-000" />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="address">Endereço completo</Label>
              <Input id="address" name="address" required defaultValue={editTarget?.address} placeholder="Rua, número, bairro, cidade/UF" />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="cnhNumber">Número da CNH</Label>
              <Input id="cnhNumber" name="cnhNumber" required defaultValue={editTarget?.cnhNumber} />
            </FormGroup>

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
