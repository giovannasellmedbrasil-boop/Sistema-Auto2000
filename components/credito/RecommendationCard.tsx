import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { CreditAiAnalysis } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// "Próxima ação recomendada" (seção 7). O texto de cada cenário é fixo
// (vem do briefing), não gerado livremente — só o cenário e as sugestões
// variam conforme a interpretação em lib/creditAI.ts.

const SCENARIO_CONFIG = {
  FAVORABLE: {
    icon: TrendingUp,
    tone: "border-success-500/30 bg-success-500/10 text-success-600",
    text: "Perfil apresenta indicadores favoráveis para seguir com simulação de financiamento.",
  },
  INTERMEDIATE: {
    icon: TrendingUp,
    tone: "border-accent-500/30 bg-accent-500/10 text-accent-400",
    text: "Pode ser interessante aumentar o valor da entrada ou avaliar diferentes condições de financiamento.",
  },
  RISK: {
    icon: AlertTriangle,
    tone: "border-danger-500/30 bg-danger-500/10 text-danger-500",
    text: "Os indicadores encontrados sugerem que a proposta poderá exigir análise adicional pela instituição financeira.",
  },
} as const;

export function RecommendationCard({
  aiAnalysis,
  downPayment,
  alternativeDownPayment,
}: {
  aiAnalysis: CreditAiAnalysis;
  downPayment: number;
  alternativeDownPayment: number;
}) {
  const { scenario, suggestions } = aiAnalysis;
  const config = SCENARIO_CONFIG[scenario];
  const Icon = config.icon;

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h3 className="text-base font-semibold text-accent-400">Próxima ação recomendada</h3>
      <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${config.tone}`}>
        <Icon className="h-4.5 w-4.5 shrink-0" />
        <p>{config.text}</p>
      </div>

      {scenario === "INTERMEDIATE" && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink-500">Entrada atual</span>
            <div className="font-semibold text-white">{formatCurrency(downPayment)}</div>
          </div>
          <div>
            <span className="text-ink-500">Entrada alternativa para simulação</span>
            <div className="font-semibold text-white">{formatCurrency(alternativeDownPayment)}</div>
          </div>
          <p className="col-span-2 text-xs text-ink-600">
            Trata-se apenas de uma simulação matemática, não de uma garantia de aprovação.
          </p>
        </div>
      )}

      {suggestions.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm text-ink-600">
          {suggestions.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <TrendingDown className="h-3.5 w-3.5 shrink-0 text-ink-500" />
              {s}
            </li>
          ))}
        </ul>
      )}

      {scenario === "FAVORABLE" && (
        <Button href="#simulador" size="lg">
          Simular financiamento
        </Button>
      )}
    </Card>
  );
}
