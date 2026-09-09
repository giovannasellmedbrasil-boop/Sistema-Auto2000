"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Info, Pencil, Plus, XCircle } from "lucide-react";
import type { CompanyFiscalProfile, Invoice, TaxRegime } from "@/lib/types";
import { INVOICE_STATUS_LABELS, TAX_REGIME_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Label, FormGroup, Select, Textarea } from "@/components/ui/Field";
import { formatCurrency } from "@/lib/utils";

// CNPJ da própria loja não é mascarado — ao contrário do CPF/CNPJ de um
// comprador, é um número de registro público que já aparece por inteiro em
// qualquer nota fiscal/documento emitido pela empresa.
function formatCnpjDisplay(digits: string): string {
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

interface VehicleOption {
  id: string;
  label: string;
  price: number;
}

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function InvoiceManager({
  profile,
  invoices,
  vehicles,
}: {
  profile: CompanyFiscalProfile | null;
  invoices: Invoice[];
  vehicles: VehicleOption[];
}) {
  const router = useRouter();
  const [editingProfile, setEditingProfile] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      cnpj: String(form.get("cnpj") ?? ""),
      razaoSocial: String(form.get("razaoSocial") ?? ""),
      nomeFantasia: String(form.get("nomeFantasia") ?? "") || null,
      inscricaoEstadual: String(form.get("inscricaoEstadual") ?? ""),
      regimeTributario: String(form.get("regimeTributario") ?? "SIMPLES_NACIONAL") as TaxRegime,
      cep: String(form.get("cep") ?? ""),
      logradouro: String(form.get("logradouro") ?? ""),
      numero: String(form.get("numero") ?? ""),
      bairro: String(form.get("bairro") ?? ""),
      municipio: String(form.get("municipio") ?? ""),
      uf: String(form.get("uf") ?? ""),
    };

    const res = await fetch("/api/admin/fiscal-profile", {
      method: "PUT",
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
    setEditingProfile(false);
    router.refresh();
  }

  async function handleInvoiceSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      vehicleId: String(form.get("vehicleId") ?? ""),
      buyerName: String(form.get("buyerName") ?? ""),
      buyerDocument: String(form.get("buyerDocument") ?? ""),
      value: Number(form.get("value") ?? 0),
      notes: String(form.get("notes") ?? "") || null,
    };

    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível registrar a nota.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setCreatingInvoice(false);
    setSelectedVehicleId("");
    router.refresh();
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancelar o registro desta nota? Como ela nunca chegou a ser emitida na SEFAZ, isso só remove a solicitação daqui.")) return;
    await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-2.5 rounded-xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-sm text-warning-500">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0" />
        <span>
          Emitir uma NF-e de verdade exige assinatura com certificado digital e comunicação com a SEFAZ — isso ainda
          não está conectado neste sistema. As notas abaixo ficam registradas como <strong>pendentes de
          integração</strong>: nenhuma chave de acesso, número ou protocolo é fabricado como se a nota tivesse sido
          emitida de fato.
        </span>
      </div>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-accent-400">Dados fiscais da loja</h3>
          <Button size="sm" variant="outline" onClick={() => setEditingProfile(true)}>
            <Pencil className="h-4 w-4" /> {profile ? "Editar" : "Configurar"}
          </Button>
        </div>
        {profile ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-ink-600">Razão social:</span> <span className="text-ink-900">{profile.razaoSocial}</span>
            </div>
            <div>
              <span className="text-ink-600">CNPJ:</span> <span className="text-ink-900">{formatCnpjDisplay(profile.cnpj)}</span>
            </div>
            <div>
              <span className="text-ink-600">Inscrição estadual:</span> <span className="text-ink-900">{profile.inscricaoEstadual}</span>
            </div>
            <div>
              <span className="text-ink-600">Regime tributário:</span>{" "}
              <span className="text-ink-900">{TAX_REGIME_LABELS[profile.regimeTributario]}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-ink-600">Endereço:</span>{" "}
              <span className="text-ink-900">
                {profile.logradouro}, {profile.numero} — {profile.bairro}, {profile.municipio}/{profile.uf} — CEP {profile.cep}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-500">
            Configure os dados fiscais da loja antes de registrar notas fiscais.
          </p>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-accent-400">Notas fiscais</h3>
        <Button size="sm" onClick={() => setCreatingInvoice(true)} disabled={!profile}>
          <Plus className="h-4 w-4" /> Nova nota fiscal
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-card border border-dashed border-white/15 text-sm text-ink-500">
          Nenhuma nota fiscal registrada ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/10 bg-ink-100">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-600">
                <th className="px-4 py-3 font-medium">Comprador</th>
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Veículo</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Solicitado por</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const vehicle = vehicles.find((v) => v.id === inv.vehicleId);
                return (
                  <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-ink-900">{inv.buyerName}</td>
                    <td className="px-4 py-3 text-ink-700">{inv.buyerDocument}</td>
                    <td className="px-4 py-3 text-ink-700">{vehicle?.label ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-700">{formatCurrency(inv.value)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={inv.status === "CANCELLED" ? "neutral" : "warning"}>
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{inv.requestedBy}</td>
                    <td className="px-4 py-3 text-ink-500">{new Date(inv.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3 text-right">
                      {inv.status === "PENDING_INTEGRATION" && (
                        <button
                          onClick={() => handleCancel(inv.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-danger-500/10 hover:text-danger-500"
                          aria-label="Cancelar"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingProfile && (
        <Modal title="Dados fiscais da loja" onClose={() => setEditingProfile(false)}>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <FormGroup>
              <Label htmlFor="razaoSocial">Razão social</Label>
              <Input id="razaoSocial" name="razaoSocial" required defaultValue={profile?.razaoSocial} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="nomeFantasia" hint="opcional">Nome fantasia</Label>
              <Input id="nomeFantasia" name="nomeFantasia" defaultValue={profile?.nomeFantasia ?? ""} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" name="cnpj" required maxLength={18} defaultValue={profile?.cnpj} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="inscricaoEstadual">Inscrição estadual</Label>
                <Input id="inscricaoEstadual" name="inscricaoEstadual" required defaultValue={profile?.inscricaoEstadual} />
              </FormGroup>
            </div>
            <FormGroup>
              <Label htmlFor="regimeTributario">Regime tributário</Label>
              <Select id="regimeTributario" name="regimeTributario" required defaultValue={profile?.regimeTributario ?? "SIMPLES_NACIONAL"}>
                {Object.entries(TAX_REGIME_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup>
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" name="cep" required maxLength={9} defaultValue={profile?.cep} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="uf">UF</Label>
                <Select id="uf" name="uf" required defaultValue={profile?.uf ?? ""}>
                  <option value="" disabled>Selecione</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </Select>
              </FormGroup>
            </div>
            <FormGroup>
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input id="logradouro" name="logradouro" required defaultValue={profile?.logradouro} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup>
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" name="numero" required defaultValue={profile?.numero} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" name="bairro" required defaultValue={profile?.bairro} />
              </FormGroup>
            </div>
            <FormGroup>
              <Label htmlFor="municipio">Município</Label>
              <Input id="municipio" name="municipio" required defaultValue={profile?.municipio} />
            </FormGroup>

            {error && <p className="text-sm text-danger-500">{error}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingProfile(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {creatingInvoice && (
        <Modal title="Nova nota fiscal" onClose={() => setCreatingInvoice(false)}>
          <form onSubmit={handleInvoiceSubmit} className="flex flex-col gap-4">
            <FormGroup>
              <Label htmlFor="vehicleId">Veículo</Label>
              <Select
                id="vehicleId"
                name="vehicleId"
                required
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="" disabled>Selecione o veículo</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="buyerName">Nome do comprador</Label>
              <Input id="buyerName" name="buyerName" required />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="buyerDocument" hint="CPF ou CNPJ">Documento do comprador</Label>
              <Input id="buyerDocument" name="buyerDocument" required placeholder="000.000.000-00" />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="value">Valor da nota</Label>
              <Input
                id="value"
                name="value"
                type="number"
                min={0.01}
                step={0.01}
                required
                defaultValue={selectedVehicle?.price}
                key={selectedVehicleId}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="notes" hint="opcional">Observações</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </FormGroup>

            {error && <p className="text-sm text-danger-500">{error}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setCreatingInvoice(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Registrando…" : "Registrar"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
