"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Input de valor em reais (inteiros, sem centavos — convenção do projeto).
// Existe porque <input type="number"> usa SEMPRE o ponto como separador
// DECIMAL (padrão americano), nunca como separador de milhar: digitar
// "66.000" nele vira 66 (interpretado como "66,000" = 66 com zeros à
// direita), não 66 mil. Aqui o campo visível é texto livre, formatado com
// ponto de milhar ao digitar (estilo brasileiro), e um input oculto com o
// mesmo `name` carrega o número puro (sem pontos) que o resto do formulário
// já espera via FormData.
export function MoneyInput({
  name,
  defaultValue,
  required,
  placeholder,
  className,
  id,
}: {
  name: string;
  defaultValue?: number | null;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [display, setDisplay] = useState(() =>
    defaultValue != null ? formatThousands(String(Math.round(defaultValue))) : ""
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setDisplay(digits ? formatThousands(digits) : "");
  }

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/40">
        R$
      </span>
      <input type="hidden" name={name} value={display.replace(/\./g, "")} />
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        aria-required={required}
        className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
      />
    </div>
  );
}

function formatThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Mesma ideia do MoneyInput, mas controlado (value/onValueChange) para os
// poucos casos que recalculam algo ao vivo (ex.: simulador de
// financiamento) em vez de só ler o valor no submit do formulário via
// FormData.
export function ControlledMoneyInput({
  id,
  value,
  onValueChange,
  className,
}: {
  id?: string;
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    onValueChange(digits ? Number(digits) : 0);
  }

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/40">
        R$
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value ? formatThousands(String(value)) : ""}
        onChange={handleChange}
        className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
      />
    </div>
  );
}
