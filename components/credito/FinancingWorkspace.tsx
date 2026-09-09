"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { simulateFinancing, incomeCommitmentRatio } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { FormGroup, Input, Label, Select } from "@/components/ui/Field";
import { VehicleImage } from "@/components/vehicles/VehicleImage";

// Simulador de capacidade financeira (seção 6) + veículos compatíveis
// (seção 8), combinados em um único componente para que ambos compartilhem
// a mesma taxa de juros e prazo informados pelo vendedor — a taxa nunca é
// presumida (seção 6: "Não inventar taxa de juros").

const TERMS = [12, 24, 36, 48, 60, 72];

export function FinancingWorkspace({
  monthlyIncome,
  vehiclePrice,
  initialDownPayment,
  compatibleVehicles,
}: {
  monthlyIncome: number;
  vehiclePrice: number;
  initialDownPayment: number;
  compatibleVehicles: Vehicle[];
}) {
  const [downPayment, setDownPayment] = useState(initialDownPayment);
  const [term, setTerm] = useState(48);
  const [ratePercent, setRatePercent] = useState("");

  const rate = ratePercent ? Number(ratePercent) / 100 : null;
  const financedAmount = Math.max(vehiclePrice - downPayment, 0);
  const result = useMemo(
    () => (rate != null ? simulateFinancing(financedAmount, term, rate) : null),
    [financedAmount, term, rate]
  );
  const commitment = result ? incomeCommitmentRatio(result.installment, monthlyIncome) : null;
  const downPaymentRatio = vehiclePrice > 0 ? downPayment / vehiclePrice : 0;

  return (
    <div className="flex flex-col gap-6" id="simulador">
      <Card className="flex flex-col gap-5 p-6">
        <div>
          <h3 className="text-base font-semibold text-accent-400">Capacidade estimada de pagamento</h3>
          <p className="text-sm text-ink-500">
            A taxa de juros deve ser informada pelo vendedor (ou vir de uma integração real com o
            banco/financeira) — nenhuma taxa é presumida automaticamente.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FormGroup>
            <Label>Renda</Label>
            <Input value={formatCurrency(monthlyIncome)} disabled />
          </FormGroup>
          <FormGroup>
            <Label>Veículo</Label>
            <Input value={formatCurrency(vehiclePrice)} disabled />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="wk-down">Entrada</Label>
            <Input
              id="wk-down"
              type="number"
              min={0}
              step={500}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Valor estimado financiado</Label>
            <Input value={formatCurrency(financedAmount)} disabled />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FormGroup>
            <Label htmlFor="wk-term">Prazo pretendido</Label>
            <Select id="wk-term" value={term} onChange={(e) => setTerm(Number(e.target.value))}>
              {TERMS.map((t) => (
                <option key={t} value={t}>
                  {t}x
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup className="col-span-2 sm:col-span-1">
            <Label htmlFor="wk-rate" hint="informada pelo vendedor">
              Taxa de juros (% a.m.)
            </Label>
            <Input
              id="wk-rate"
              type="number"
              min={0}
              step={0.01}
              placeholder="ex: 1,99"
              value={ratePercent}
              onChange={(e) => setRatePercent(e.target.value)}
            />
          </FormGroup>
        </div>

        {result && commitment != null ? (
          <div className="rounded-xl border border-accent-500/25 bg-black p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs text-white/50">Parcela simulada</span>
                <div className="text-2xl font-semibold text-accent-400">
                  {term}x de {formatCurrency(result.installment)}
                </div>
              </div>
              <div>
                <span className="text-xs text-white/50">Comprometimento estimado da renda</span>
                <div
                  className={`text-2xl font-semibold ${
                    commitment > 0.3 ? "text-danger-500" : "text-success-500"
                  }`}
                >
                  {Math.round(commitment * 100)}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 p-4 text-sm text-ink-500">
            <Info className="h-4 w-4 shrink-0" />
            Informe a taxa de juros para calcular a parcela simulada.
          </div>
        )}
      </Card>

      <div>
        <h3 className="mb-1 text-base font-semibold text-accent-400">Veículos compatíveis</h3>
        <p className="mb-4 text-sm text-ink-500">
          Veículos do estoque real que podem se encaixar melhor na simulação, considerando apenas os
          parâmetros financeiros informados — nenhum veículo é apresentado como aprovado.
        </p>

        {compatibleVehicles.length === 0 ? (
          <p className="text-sm text-ink-600">Nenhum veículo do estoque atual próximo desse orçamento no momento.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compatibleVehicles.map((v) => {
              const simDownPayment = Math.round(v.price * downPaymentRatio);
              const simFinanced = Math.max(v.price - simDownPayment, 0);
              const simResult = rate != null ? simulateFinancing(simFinanced, term, rate) : null;
              return (
                <Card key={v.id} className="flex flex-col gap-3 overflow-hidden p-0">
                  <div className="relative aspect-[4/3] w-full">
                    <VehicleImage seed={v.id} label={`${v.brand} ${v.model}`} className="h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-accent-400">
                        {v.brand} {v.model} {v.version}
                      </h4>
                      <p className="text-lg font-semibold text-white">{formatCurrency(v.price)}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-ink-500">
                      <dt>Entrada simulada</dt>
                      <dd className="text-right text-ink-700">{formatCurrency(simDownPayment)}</dd>
                      <dt>Valor financiado</dt>
                      <dd className="text-right text-ink-700">{formatCurrency(simFinanced)}</dd>
                      <dt>Parcela aproximada</dt>
                      <dd className="text-right text-ink-700">
                        {simResult ? `${term}x ${formatCurrency(simResult.installment)}` : "informe a taxa"}
                      </dd>
                    </dl>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
