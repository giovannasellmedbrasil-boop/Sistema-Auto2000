"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CONTRACT_FIELDS, CONTRACT_TYPE_LABELS, type ContractType } from "@/lib/contracts/config";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormGroup, Select, Textarea } from "@/components/ui/Field";

export function ContractForm({ initialType }: { initialType?: ContractType }) {
  const router = useRouter();
  const [type, setType] = useState<ContractType>(initialType ?? "CONSIGNACAO");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
                  <Textarea name={f.key} defaultValue={f.defaultValue} placeholder={f.placeholder} required={f.required} />
                ) : (
                  <Input
                    name={f.key}
                    type={f.type}
                    required={f.required}
                    defaultValue={f.defaultValue}
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
