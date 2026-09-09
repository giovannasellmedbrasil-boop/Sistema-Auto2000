"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { CUSTOMER_KIND_LABELS, NEGOTIATION_PAYMENT_METHOD_LABELS, VEHICLE_CONDITION_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormGroup, Input, Label, Select } from "@/components/ui/Field";
import { formatCurrency } from "@/lib/utils";

export function NewNegotiationForm({
  vehicles,
  sellers,
}: {
  vehicles: Pick<Vehicle, "id" | "brand" | "model" | "version" | "modelYear" | "price">[];
  sellers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [customerKind, setCustomerKind] = useState<"INDIVIDUAL" | "COMPANY">("INDIVIDUAL");
  const [customerMarried, setCustomerMarried] = useState(false);
  const [hasRepresentativeProcuration, setHasRepresentativeProcuration] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "FINANCING">("CASH");
  const [hasTradeIn, setHasTradeIn] = useState(false);
  const [vehicleCondition, setVehicleCondition] = useState<"NEW" | "USED">("USED");
  const [needsTransfer, setNeedsTransfer] = useState(true);
  const [interstate, setInterstate] = useState(false);
  const [needsCourier, setNeedsCourier] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    const sellerId = String(form.get("sellerId"));
    const sellerName = sellers.find((s) => s.id === sellerId)?.name ?? "";

    const payload = {
      customerKind,
      customerName: form.get("customerName"),
      customerDocument: form.get("customerDocument"),
      customerPhone: form.get("customerPhone"),
      customerEmail: form.get("customerEmail") || undefined,
      customerMarried,
      hasRepresentativeProcuration,
      vehicleId: form.get("vehicleId"),
      sellerId,
      sellerName,
      saleValue: form.get("saleValue"),
      paymentMethod,
      financing:
        paymentMethod === "FINANCING"
          ? {
              financierName: form.get("financierName"),
              financedAmount: form.get("financedAmount"),
              downPayment: form.get("downPayment"),
              installments: form.get("installments"),
              status: "PREPARING_DOCS",
            }
          : undefined,
      hasTradeIn,
      tradeIn: hasTradeIn
        ? {
            plate: form.get("tradeInPlate"),
            brand: form.get("tradeInBrand"),
            model: form.get("tradeInModel"),
            year: form.get("tradeInYear"),
            mileageKm: form.get("tradeInMileage"),
            requestedValue: form.get("tradeInRequestedValue"),
          }
        : undefined,
      vehicleCondition,
      needsTransfer,
      interstate,
      needsCourier,
      documentationResponsible: form.get("documentationResponsible") || undefined,
    };

    try {
      const res = await fetch("/api/negotiations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error ?? "Não foi possível cadastrar a venda.");
        setStatus("error");
        return;
      }
      const data = await res.json();
      router.push(`/admin/documentacao/${data.negotiation.id}`);
      router.refresh();
    } catch {
      setErrorMsg("Não foi possível cadastrar a venda.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-sm font-semibold text-accent-400">Cliente</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FormGroup>
            <Label>Tipo</Label>
            <Select value={customerKind} onChange={(e) => setCustomerKind(e.target.value as never)}>
              {Object.entries(CUSTOMER_KIND_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>{customerKind === "INDIVIDUAL" ? "Nome completo" : "Razão social"}</Label>
            <Input name="customerName" required />
          </FormGroup>
          <FormGroup>
            <Label>{customerKind === "INDIVIDUAL" ? "CPF" : "CNPJ"}</Label>
            <Input name="customerDocument" required />
          </FormGroup>
          <FormGroup>
            <Label>Telefone (WhatsApp)</Label>
            <Input name="customerPhone" required placeholder="5511999999999" />
          </FormGroup>
          <FormGroup>
            <Label hint="opcional">E-mail</Label>
            <Input name="customerEmail" type="email" />
          </FormGroup>
        </div>
        <div className="flex flex-wrap gap-5 pt-1">
          {customerKind === "INDIVIDUAL" && (
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={customerMarried} onChange={(e) => setCustomerMarried(e.target.checked)} />
              Cliente casado(a) (exige certidão de casamento e dados do cônjuge)
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={hasRepresentativeProcuration}
              onChange={(e) => setHasRepresentativeProcuration(e.target.checked)}
            />
            Negociação por procuração
          </label>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-sm font-semibold text-accent-400">Veículo e venda</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FormGroup className="sm:col-span-2">
            <Label>Veículo</Label>
            <Select name="vehicleId" required defaultValue="">
              <option value="" disabled>Selecione um veículo do estoque</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.version} {v.modelYear} — {formatCurrency(v.price)}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Condição</Label>
            <Select value={vehicleCondition} onChange={(e) => setVehicleCondition(e.target.value as never)}>
              {Object.entries(VEHICLE_CONDITION_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Vendedor</Label>
            <Select name="sellerId" required defaultValue="">
              <option value="" disabled>Selecione</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Valor da venda</Label>
            <Input name="saleValue" type="number" min={0} step={100} required />
          </FormGroup>
          <FormGroup>
            <Label>Forma de pagamento</Label>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as never)}>
              {Object.entries(NEGOTIATION_PAYMENT_METHOD_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label hint="opcional">Responsável pela documentação</Label>
            <Input name="documentationResponsible" placeholder="Ex: Juliana" />
          </FormGroup>
        </div>
      </Card>

      {paymentMethod === "FINANCING" && (
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-sm font-semibold text-accent-400">Financiamento</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FormGroup>
              <Label>Financeira</Label>
              <Input name="financierName" required />
            </FormGroup>
            <FormGroup>
              <Label>Valor financiado</Label>
              <Input name="financedAmount" type="number" min={0} step={100} required />
            </FormGroup>
            <FormGroup>
              <Label>Entrada</Label>
              <Input name="downPayment" type="number" min={0} step={100} required />
            </FormGroup>
            <FormGroup>
              <Label>Parcelas</Label>
              <Input name="installments" type="number" min={1} required />
            </FormGroup>
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-sm font-semibold text-accent-400">Transferência e usado na troca</h2>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={needsTransfer} onChange={(e) => setNeedsTransfer(e.target.checked)} />
            Requer transferência do veículo
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={interstate} onChange={(e) => setInterstate(e.target.checked)} />
            Venda interestadual
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={needsCourier} onChange={(e) => setNeedsCourier(e.target.checked)} />
            Usar despachante
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={hasTradeIn} onChange={(e) => setHasTradeIn(e.target.checked)} />
            Cliente dará veículo usado como entrada
          </label>
        </div>

        {hasTradeIn && (
          <div className="grid grid-cols-2 gap-4 border-t border-white/8 pt-4 sm:grid-cols-3">
            <FormGroup>
              <Label>Placa</Label>
              <Input name="tradeInPlate" required />
            </FormGroup>
            <FormGroup>
              <Label>Marca</Label>
              <Input name="tradeInBrand" required />
            </FormGroup>
            <FormGroup>
              <Label>Modelo</Label>
              <Input name="tradeInModel" required />
            </FormGroup>
            <FormGroup>
              <Label>Ano</Label>
              <Input name="tradeInYear" type="number" required />
            </FormGroup>
            <FormGroup>
              <Label>Quilometragem</Label>
              <Input name="tradeInMileage" type="number" min={0} required />
            </FormGroup>
            <FormGroup>
              <Label>Valor solicitado pelo cliente</Label>
              <Input name="tradeInRequestedValue" type="number" min={0} step={100} required />
            </FormGroup>
          </div>
        )}
      </Card>

      {status === "error" && <p className="text-sm text-danger-500">{errorMsg}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
          Cadastrar venda e gerar checklist
        </Button>
        <Button href="/admin/documentacao" variant="outline">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
