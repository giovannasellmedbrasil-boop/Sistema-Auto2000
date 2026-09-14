"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormGroup, Input, Label, Select } from "@/components/ui/Field";
import { buildWhatsAppLink } from "@/lib/utils";

export function TradeInForm({ desiredVehicleSlug }: { desiredVehicleSlug?: string }) {
  const [hasFinancing, setHasFinancing] = useState("nao");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const phone = String(form.get("phone") ?? "");
    const email = String(form.get("email") ?? "");
    try {
      const res = await fetch("/api/trade-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          plate: form.get("plate"),
          brand: form.get("brand"),
          model: form.get("model"),
          version: form.get("version") || undefined,
          year: form.get("year"),
          mileageKm: form.get("mileageKm"),
          color: form.get("color"),
          hasFinancing: hasFinancing === "sim",
          expectedValue: form.get("expectedValue") || undefined,
          desiredVehicleSlug,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const link = buildWhatsAppLink(
        [
          "Olá! Quero vender/trocar meu carro.",
          data.message,
          `Meus dados: ${name}, ${phone}${email ? `, ${email}` : ""}.`,
        ].join(" ")
      );
      setWhatsappHref(link);
      window.open(link, "_blank", "noopener,noreferrer");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-success-500" />
        <h2 className="text-lg font-semibold text-accent-400">Solicitação recebida!</h2>
        <p className="max-w-sm text-sm text-white">
          Abrimos o WhatsApp com os dados do seu veículo para a nossa equipe.
        </p>
        {whatsappHref && (
          <Button href={whatsappHref} target="_blank" rel="noopener noreferrer" variant="whatsapp">
            <MessageCircle className="h-4 w-4" />
            Abrir WhatsApp
          </Button>
        )}
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <Card className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className="text-base font-semibold text-accent-400">Dados do veículo</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FormGroup>
            <Label>Placa</Label>
            <Input name="plate" required maxLength={8} placeholder="ABC1D23" />
          </FormGroup>
          <FormGroup>
            <Label>Marca</Label>
            <Input name="brand" required placeholder="Ex: Toyota" />
          </FormGroup>
          <FormGroup>
            <Label>Modelo</Label>
            <Input name="model" required placeholder="Ex: Corolla" />
          </FormGroup>
          <FormGroup>
            <Label hint="opcional">Versão</Label>
            <Input name="version" placeholder="Ex: XEi" />
          </FormGroup>
          <FormGroup>
            <Label>Ano</Label>
            <Input name="year" type="number" required min={1980} max={new Date().getFullYear() + 1} placeholder="2022" />
          </FormGroup>
          <FormGroup>
            <Label>Quilometragem</Label>
            <Input name="mileageKm" type="number" required min={0} placeholder="45000" />
          </FormGroup>
          <FormGroup>
            <Label>Cor</Label>
            <Input name="color" required placeholder="Ex: Prata" />
          </FormGroup>
          <FormGroup>
            <Label>Possui financiamento?</Label>
            <Select value={hasFinancing} onChange={(e) => setHasFinancing(e.target.value)}>
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label hint="opcional">Valor esperado</Label>
            <Input name="expectedValue" type="number" min={0} step={1} placeholder="R$ 0,00" />
          </FormGroup>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className="text-base font-semibold text-accent-400">Seus dados de contato</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormGroup>
            <Label>Nome completo</Label>
            <Input name="name" required placeholder="Seu nome" />
          </FormGroup>
          <FormGroup>
            <Label>Telefone / WhatsApp</Label>
            <Input name="phone" required placeholder="(11) 90000-0000" />
          </FormGroup>
          <FormGroup>
            <Label hint="opcional">E-mail</Label>
            <Input name="email" type="email" placeholder="voce@email.com" />
          </FormGroup>
        </div>
      </Card>

      {status === "error" && (
        <p className="text-sm text-danger-500">
          Não foi possível enviar sua solicitação agora. Tente novamente em instantes.
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-fit">
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        Solicitar avaliação
      </Button>
    </form>
  );
}
