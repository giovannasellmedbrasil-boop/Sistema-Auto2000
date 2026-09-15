"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { CONTRACT_FIELDS, CONTRACT_TYPE_LABELS, type ContractType } from "@/lib/contracts/config";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormGroup, Select, Textarea } from "@/components/ui/Field";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Card } from "@/components/ui/Card";

export function ContractForm({ initialType }: { initialType?: ContractType }) {
  const router = useRouter();
  const [type, setType] = useState<ContractType>(initialType ?? "CONSIGNACAO");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [saleCode, setSaleCode] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<Record<string, string>>({});
  const [prefillVersion, setPrefillVersion] = useState(0);

  // Busca a venda pelo código (#1024) já cadastrada em "Nova Venda" e
  // preenche o que já existe no sistema — dados do cliente e do veículo do
  // estoque. Chassi, placa e renavam não são rastreados no estoque hoje,
  // então continuam em branco mesmo após a busca.
  async function handleLookup() {
    const code = saleCode.trim();
    if (!code) return;
    setLookingUp(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/negotiations?q=${encodeURIComponent(code)}`);
      const data = await res.json().catch(() => null);
      const negotiation = data?.negotiations?.[0];
      if (!negotiation) {
        setLookupError("Nenhuma venda encontrada com esse código.");
        return;
      }

      const vRes = await fetch(`/api/vehicles?ids=${negotiation.vehicleId}`);
      const vData = await vRes.json().catch(() => null);
      const vehicle: { brand?: string; model?: string; version?: string; manufactureYear?: number; modelYear?: number } | undefined =
        vData?.vehicles?.[0];

      setPrefill({
        buyerName: negotiation.customerName ?? "",
        buyerCpf: negotiation.customerDocument ?? "",
        buyerAddress: negotiation.customerAddress ?? "",
        buyerCep: negotiation.customerCep ?? "",
        buyerPhone: negotiation.customerPhone ?? "",
        buyerEmail: negotiation.customerEmail ?? "",
        vehicleBrandModel: vehicle ? `${vehicle.brand}/${vehicle.model} ${vehicle.version}` : "",
        vehicleYear: vehicle ? `${vehicle.manufactureYear}/${vehicle.modelYear}` : "",
        saleValue: negotiation.saleValue != null ? String(negotiation.saleValue) : "",
      });
      setPrefillVersion((v) => v + 1);
    } catch {
      setLookupError("Não foi possível buscar a venda agora.");
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const fields: Record<string, string> = {};
    for (const f of CONTRACT_FIELDS[type]) {
      fields[f.key] = f.type === "checkbox" ? String(form.get(f.key) === "on") : String(form.get(f.key) ?? "");
    }

    const res = await fetch("/api/contratos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, fields }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível gerar o contrato.");
      setSubmitting(false);
      return;
    }
    const data = await res.json();
    router.push(`/admin/contratos/${data.contract.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormGroup className="max-w-xs">
        <Label>Tipo de contrato</Label>
        <Select value={type} onChange={(e) => setType(e.target.value as ContractType)}>
          {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormGroup>

      {type === "VENDA_TROCA" && (
        <Card className="flex flex-col gap-2 p-4">
          <Label hint="opcional">Preencher a partir de uma venda já cadastrada</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              value={saleCode}
              onChange={(e) => setSaleCode(e.target.value)}
              placeholder="Código da venda, ex: #1024"
              className="max-w-56"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleLookup} disabled={lookingUp}>
              {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </Button>
          </div>
          {lookupError && <p className="text-xs text-danger-500">{lookupError}</p>}
          <p className="text-xs text-ink-500">
            Preenche cliente e veículo com o que já está no sistema. Chassi, placa e renavam não são
            rastreados no estoque — continuam manuais.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CONTRACT_FIELDS[type].map((f) => (
          <FormGroup key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : undefined}>
            {f.type === "checkbox" ? (
              <label className="mt-6 flex items-center gap-2 text-sm text-white/85">
                <input type="checkbox" name={f.key} />
                {f.label}
              </label>
            ) : (
              <>
                <Label hint={f.required ? undefined : "opcional"}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    key={`${f.key}-${prefillVersion}`}
                    name={f.key}
                    defaultValue={prefill[f.key] ?? f.defaultValue}
                    placeholder={f.placeholder}
                    required={f.required}
                    className={f.large ? "min-h-48" : undefined}
                  />
                ) : f.type === "money" ? (
                  <MoneyInput
                    key={`${f.key}-${prefillVersion}`}
                    name={f.key}
                    required={f.required}
                    defaultValue={
                      prefill[f.key] != null && prefill[f.key] !== ""
                        ? Number(prefill[f.key])
                        : f.defaultValue != null
                          ? Number(f.defaultValue)
                          : undefined
                    }
                    placeholder={f.placeholder}
                  />
                ) : (
                  <Input
                    key={`${f.key}-${prefillVersion}`}
                    name={f.key}
                    type={f.type}
                    required={f.required}
                    defaultValue={prefill[f.key] ?? f.defaultValue}
                    placeholder={f.placeholder}
                  />
                )}
              </>
            )}
          </FormGroup>
        ))}
      </div>

      {error && <p className="text-sm text-danger-500">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Gerar contrato
        </Button>
        <Button href="/admin/contratos" variant="outline">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
