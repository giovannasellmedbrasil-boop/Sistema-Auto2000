"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormGroup, Input, Label } from "@/components/ui/Field";
import { formatCpfInput, isValidCpf } from "@/lib/utils";

export function NovaAnaliseForm() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isValidCpf(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }
    if (!consent) {
      setError("Confirme a autorização do cliente para prosseguir.");
      return;
    }

    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/credito/consultar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          cpf,
          birthDate: form.get("birthDate"),
          phone: form.get("phone"),
          email: form.get("email") || undefined,
          monthlyIncome: form.get("monthlyIncome"),
          downPayment: form.get("downPayment"),
          vehicleInterest: form.get("vehicleInterest"),
          vehiclePrice: form.get("vehiclePrice"),
          consent,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Não foi possível concluir a análise agora.");
        setStatus("error");
        return;
      }
      router.push(`/admin/credito/${data.id}`);
    } catch {
      setError("Não foi possível concluir a análise agora.");
      setStatus("error");
    }
  }

  return (
    <Card className="flex flex-col gap-6 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormGroup className="sm:col-span-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" name="name" required placeholder="Nome do cliente" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              required
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpfInput(e.target.value))}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input id="birthDate" name="birthDate" type="date" required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" required placeholder="(11) 90000-0000" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="email" hint="opcional">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="cliente@email.com" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="monthlyIncome">Renda mensal declarada</Label>
            <Input id="monthlyIncome" name="monthlyIncome" type="number" min={0} step={100} required placeholder="R$ 0,00" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="downPayment">Valor aproximado da entrada</Label>
            <Input id="downPayment" name="downPayment" type="number" min={0} step={500} required placeholder="R$ 0,00" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="vehicleInterest">Veículo de interesse</Label>
            <Input id="vehicleInterest" name="vehicleInterest" required placeholder="Ex: Toyota Corolla XEi 2023" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="vehiclePrice">Valor do veículo</Label>
            <Input id="vehiclePrice" name="vehiclePrice" type="number" min={0} step={500} required placeholder="R$ 0,00" />
          </FormGroup>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 accent-accent-500"
          />
          <span>
            <ShieldCheck className="mb-1 h-4 w-4 text-accent-400" />
            {" "}Confirmo que o cliente autorizou a consulta de seus dados para finalidade de análise de
            crédito.
          </span>
        </label>

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Button type="submit" size="lg" disabled={status === "submitting" || !consent}>
          {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
          Analisar crédito
        </Button>
      </form>
    </Card>
  );
}
