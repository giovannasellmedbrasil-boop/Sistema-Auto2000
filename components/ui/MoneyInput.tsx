"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Input de valor em reais, com centavos opcionais (estilo brasileiro: ponto
// de milhar, vírgula decimal). Existe porque <input type="number"> usa
// SEMPRE o ponto como separador DECIMAL (padrão americano), nunca como
// separador de milhar: digitar "66.000" nele vira 66 (interpretado como
// "66,000" = 66 com zeros à direita), não 66 mil. Aqui o campo visível é
// texto livre — dígitos formam o milhar, uma vírgula opcional abre os
// centavos (até 2 dígitos) — e um input oculto com o mesmo `name` carrega o
// número puro em notação decimal com ponto (ex: "1234.56") que o resto do
// formulário já espera via FormData.
function sanitizeMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[^\d,]/g, "");
  const firstComma = cleaned.indexOf(",");
  if (firstComma === -1) return cleaned;
  const intPart = cleaned.slice(0, firstComma).replace(/,/g, "");
  const decPart = cleaned.slice(firstComma + 1).replace(/,/g, "").slice(0, 2);
  return `${intPart},${decPart}`;
}

function formatThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatMoneyDisplay(sanitized: string): string {
  const [intRaw, decPart] = sanitized.split(",");
  const intFormatted = intRaw ? formatThousands(intRaw) : "";
  return decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted;
}

function toRawValue(sanitized: string): string {
  const [intRaw, decPart] = sanitized.split(",");
  if (!intRaw && decPart === undefined) return "";
  const intVal = intRaw || "0";
  if (decPart === undefined) return intVal;
  return `${intVal}.${(decPart + "00").slice(0, 2)}`;
}

function sanitizedFromNumber(value: number): string {
  const cents = Math.round(value * 100);
  const hasCents = cents % 100 !== 0;
  if (!hasCents) return String(Math.trunc(cents / 100));
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const intPart = Math.trunc(abs / 100);
  const decPart = String(abs % 100).padStart(2, "0");
  return `${negative ? "-" : ""}${intPart},${decPart}`;
}

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
  const [sanitized, setSanitized] = useState(() => (defaultValue != null ? sanitizedFromNumber(defaultValue) : ""));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSanitized(sanitizeMoneyInput(e.target.value));
  }

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/40">
        R$
      </span>
      <input type="hidden" name={name} value={toRawValue(sanitized)} />
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={formatMoneyDisplay(sanitized)}
        onChange={handleChange}
        placeholder={placeholder}
        aria-required={required}
        className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
      />
    </div>
  );
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
  const [sanitized, setSanitized] = useState(() => (value ? sanitizedFromNumber(value) : ""));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = sanitizeMoneyInput(e.target.value);
    setSanitized(next);
    const raw = toRawValue(next);
    onValueChange(raw ? Number(raw) : 0);
  }

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/40">
        R$
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={formatMoneyDisplay(sanitized)}
        onChange={handleChange}
        className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
      />
    </div>
  );
}
