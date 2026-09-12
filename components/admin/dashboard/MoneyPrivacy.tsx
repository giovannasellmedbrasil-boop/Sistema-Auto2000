"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MoneyPrivacyContextValue {
  hidden: boolean;
  toggle: () => void;
}

const MoneyPrivacyContext = createContext<MoneyPrivacyContextValue>({ hidden: false, toggle: () => {} });

// Envolve o dashboard inteiro — qualquer valor em reais renderizado com
// <Money> dentro desta árvore respeita o mesmo estado de "ocultar valores",
// esteja o valor num Server Component (via children) ou num Client
// Component filho (via o hook useMoneyPrivacy). Estado por carregamento de
// página (sem persistência entre recarregamentos) — sempre visível ao abrir.
export function MoneyPrivacyProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);

  return (
    <MoneyPrivacyContext.Provider value={{ hidden, toggle: () => setHidden((prev) => !prev) }}>
      {children}
    </MoneyPrivacyContext.Provider>
  );
}

export function useMoneyPrivacy() {
  return useContext(MoneyPrivacyContext);
}

const MASK = "R$ ••••••";

// Substitua qualquer `formatCurrency(x)` renderizado no dashboard por
// `<Money value={x} />` para que o botão-olho consiga ocultá-lo.
export function Money({ value }: { value: number | null | undefined }) {
  const { hidden } = useMoneyPrivacy();
  if (value == null) return <>—</>;
  return <>{hidden ? MASK : formatCurrency(value)}</>;
}

export function MoneyPrivacyToggle() {
  const { hidden, toggle } = useMoneyPrivacy();
  return (
    <button
      type="button"
      onClick={toggle}
      title={hidden ? "Mostrar valores em reais" : "Ocultar valores em reais"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
    >
      {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
