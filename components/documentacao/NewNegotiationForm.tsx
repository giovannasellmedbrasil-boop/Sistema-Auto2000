"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Negotiation, NegotiationPaymentMethod, Vehicle } from "@/lib/types";
import { CUSTOMER_KIND_LABELS, NEGOTIATION_PAYMENT_METHOD_LABELS, VEHICLE_CONDITION_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormGroup, Input, Label, Select } from "@/components/ui/Field";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { formatCurrency } from "@/lib/utils";

export function NewNegotiationForm({
  vehicles,
  sellers,
  initialVehicleId,
  negotiation,
}: {
  vehicles: Pick<Vehicle, "id" | "brand" | "model" | "version" | "modelYear" | "price">[];
  sellers: { id: string; name: string }[];
  initialVehicleId?: string;
  negotiation?: Negotiation;
}) {
  const router = useRouter();
  const isEditing = Boolean(negotiation);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [customerKind, setCustomerKind] = useState<"INDIVIDUAL" | "COMPANY">(negotiation?.customerKind ?? "INDIVIDUAL");
  const [hasRepresentativeProcuration, setHasRepresentativeProcuration] = useState(
    negotiation?.hasRepresentativeProcuration ?? false
  );
  const [paymentMethod, setPaymentMethod] = useState<NegotiationPaymentMethod>(negotiation?.paymentMethod ?? "CASH");
  const [vehicleCondition, setVehicleCondition] = useState<"NEW" | "USED">(negotiation?.vehicleCondition ?? "USED");
  const [needsTransfer, setNeedsTransfer] = useState(negotiation?.needsTransfer ?? true);
  const [interstate, setInterstate] = useState(negotiation?.interstate ?? false);
  const [needsCourier, setNeedsCourier] = useState(negotiation?.needsCourier ?? false);

  // A forma de pagamento já diz se há financiamento e/ou troca — em vez de
  // pedir de novo em checkboxes separados que poderiam ficar dessincronizados.
  const hasFinancing = paymentMethod.includes("FINANCING");
  const hasTradeIn = paymentMethod.includes("TRADE_IN");

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
      customerAddress: form.get("customerAddress"),
      customerCep: form.get("customerCep"),
      hasRepresentativeProcuration,
      vehicleId: form.get("vehicleId"),
      sellerId,
      sellerName,
      saleValue: form.get("saleValue"),
      paymentMethod,
      financing: hasFinancing
        ? {
            financierName: form.get("financierName"),
            financedAmount: form.get("financedAmount"),
            downPayment: form.get("downPayment"),
            installments: form.get("installments"),
            installmentValue: form.get("installmentValue"),
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
      const res = await fetch(isEditing ? `/api/negotiations/${negotiation!.id}` : "/api/negotiations", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error ?? (isEditing ? "Não foi possível salvar as alterações." : "Não foi possível cadastrar a venda."));
        setStatus("error");
        return;
      }
      const targetId = isEditing ? negotiation!.id : (await res.json()).negotiation.id;
      router.push(`/admin/documentacao/${targetId}`);
      router.refresh();
    } catch {
      setErrorMsg(isEditing ? "Não foi possível salvar as alterações." : "Não foi possível cadastrar a venda.");
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
            <Input name="customerName" required defaultValue={negotiation?.customerName} />
          </FormGroup>
          <FormGroup>
            <Label>{customerKind === "INDIVIDUAL" ? "CPF" : "CNPJ"}</Label>
            <Input name="customerDocument" required defaultValue={negotiation?.customerDocument} />
          </FormGroup>
          <FormGroup>
            <Label>Telefone (WhatsApp)</Label>
            <Input name="customerPhone" required placeholder="5511999999999" defaultValue={negotiation?.customerPhone} />
          </FormGroup>
          <FormGroup>
            <Label>E-mail</Label>
            <Input name="customerEmail" type="email" required defaultValue={negotiation?.customerEmail ?? undefined} />
          </FormGroup>
          <FormGroup>
            <Label>CEP</Label>
            <Input name="customerCep" required placeholder="00000-000" defaultValue={negotiation?.customerCep} />
          </FormGroup>
          <FormGroup className="sm:col-span-2">
            <Label>Endereço completo</Label>
            <Input
              name="customerAddress"
              required
              placeholder="Rua, número, bairro, cidade/UF"
              defaultValue={negotiation?.customerAddress}
            />
          </FormGroup>
        </div>
        <div className="flex flex-wrap gap-5 pt-1">
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
            <Select name="vehicleId" required defaultValue={negotiation?.vehicleId ?? initialVehicleId ?? ""}>
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
            <Select name="sellerId" required defaultValue={negotiation?.sellerId ?? ""}>
              <option value="" disabled>Selecione</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Valor da venda</Label>
            <MoneyInput name="saleValue" required defaultValue={negotiation?.saleValue} />
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
            <Select name="documentationResponsible" defaultValue={negotiation?.documentationResponsible ?? ""}>
              <option value="">Não definido</option>
              <option value="Cliente">Cliente</option>
              <option value="Loja">Loja</option>
            </Select>
          </FormGroup>
        </div>
      </Card>

      {hasFinancing && (
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-sm font-semibold text-accent-400">Financiamento</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FormGroup>
              <Label>Financeira</Label>
              <Input name="financierName" required defaultValue={negotiation?.financing?.financierName} />
            </FormGroup>
            <FormGroup>
              <Label>Valor financiado</Label>
              <MoneyInput name="financedAmount" required defaultValue={negotiation?.financing?.financedAmount} />
            </FormGroup>
            <FormGroup>
              <Label>Entrada</Label>
              <MoneyInput name="downPayment" required defaultValue={negotiation?.financing?.downPayment} />
            </FormGroup>
            <FormGroup>
              <Label>Quantidade de parcelas</Label>
              <Input
                name="installments"
                type="number"
                min={1}
                step={1}
                required
                placeholder="Ex: 48"
                defaultValue={negotiation?.financing?.installments}
              />
            </FormGroup>
            <FormGroup>
              <Label>Valor de cada parcela</Label>
              <MoneyInput
                name="installmentValue"
                required
                placeholder="Ex: 1.459"
                defaultValue={negotiation?.financing?.installmentValue}
              />
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
        </div>

        {hasTradeIn && (
          <div className="grid grid-cols-2 gap-4 border-t border-white/8 pt-4 sm:grid-cols-3">
            <p className="col-span-2 text-xs text-ink-500 sm:col-span-3">
              Dados do veículo usado dado como entrada (forma de pagamento inclui troca):
            </p>
            <FormGroup>
              <Label>Placa</Label>
              <Input name="tradeInPlate" required defaultValue={negotiation?.tradeIn?.plate} />
            </FormGroup>
            <FormGroup>
              <Label>Marca</Label>
              <Input name="tradeInBrand" required defaultValue={negotiation?.tradeIn?.brand} />
            </FormGroup>
            <FormGroup>
              <Label>Modelo</Label>
              <Input name="tradeInModel" required defaultValue={negotiation?.tradeIn?.model} />
            </FormGroup>
            <FormGroup>
              <Label>Ano</Label>
              <Input name="tradeInYear" type="number" required defaultValue={negotiation?.tradeIn?.year} />
            </FormGroup>
            <FormGroup>
              <Label>Quilometragem</Label>
              <Input name="tradeInMileage" type="number" min={0} required defaultValue={negotiation?.tradeIn?.mileageKm} />
            </FormGroup>
            <FormGroup>
              <Label>Valor solicitado pelo cliente</Label>
              <MoneyInput name="tradeInRequestedValue" required defaultValue={negotiation?.tradeIn?.requestedValue} />
            </FormGroup>
          </div>
        )}
      </Card>

      {status === "error" && <p className="text-sm text-danger-500">{errorMsg}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Salvar alterações" : "Gerar documentação necessária"}
        </Button>
        <Button href={isEditing ? `/admin/documentacao/${negotiation!.id}` : "/admin/documentacao"} variant="outline">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
