import type { CreditAiAnalysis, CreditReport, CreditScenario } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

// "ANÁLISE INTELIGENTE" (seção 5) — camada de interpretação dos indicadores
// efetivamente retornados pela consulta (real ou demo). Não é uma chamada a
// um modelo de linguagem: aplica regras objetivas sobre os dados recebidos,
// no mesmo espírito do motor de correspondência de veículos em
// lib/matching.ts (heurística declarada, nunca dado inventado).
//
// Nunca escreve "financiamento aprovado" — a decisão de crédito é sempre
// atribuída ao banco/financeira (REGRA FUNDAMENTAL do briefing).

export function interpretCreditReport(input: {
  report: CreditReport;
  monthlyIncome: number;
  downPayment: number;
  vehiclePrice: number;
}): CreditAiAnalysis {
  const { report, monthlyIncome, downPayment, vehiclePrice } = input;
  const { score, indicators } = report;

  const hasRestriction =
    indicators.restrictions != null && indicators.restrictions !== "Nenhuma identificada";
  const hasNegativeDebt = (indicators.negativeDebts ?? 0) > 0;
  const hasProtest = (indicators.protests ?? 0) > 0;
  const financedAmount = Math.max(vehiclePrice - downPayment, 0);

  const scenario = pickScenario({ score, hasRestriction, hasNegativeDebt, hasProtest });

  const parts: string[] = [];

  if (score != null) {
    parts.push(
      scenario === "FAVORABLE"
        ? "O cliente apresenta indicadores de crédito favoráveis, sem registros restritivos identificados nesta consulta e com score compatível com menor risco relativo segundo os dados apresentados."
        : scenario === "RISK"
          ? `Os indicadores encontrados nesta consulta sugerem maior risco relativo${
              hasRestriction || hasNegativeDebt || hasProtest
                ? " — há ocorrência restritiva identificada"
                : " — o score está em uma faixa mais baixa"
            }, e a proposta poderá exigir análise adicional pela instituição financeira.`
          : "O cliente apresenta indicadores de crédito intermediários nesta consulta, sem apontar automaticamente aprovação ou recusa — vale avaliar as condições de entrada e prazo antes de encaminhar."
    );
  } else {
    parts.push(
      "Não foi possível obter um score nesta consulta. A leitura a seguir considera apenas os demais indicadores retornados."
    );
  }

  if (vehiclePrice > 0) {
    parts.push(
      `Considerando a renda declarada (${formatCurrency(monthlyIncome)}), a entrada informada (${formatCurrency(
        downPayment
      )}) e o valor do veículo (${formatCurrency(vehiclePrice)}), o valor estimado a financiar é de ${formatCurrency(
        financedAmount
      )}.`
    );
  }

  parts.push(
    scenario === "FAVORABLE"
      ? "Há indícios de que vale prosseguir para uma simulação junto às instituições financeiras parceiras."
      : scenario === "RISK"
        ? "Pode ser interessante aumentar a entrada, reduzir o valor financiado ou avaliar um veículo de menor valor antes de encaminhar."
        : "Recomenda-se realizar simulação e, se possível, avaliar o aumento da entrada para fortalecer a proposta."
  );

  const suggestions: string[] = [];
  if (scenario !== "FAVORABLE") {
    suggestions.push("Aumentar o valor da entrada", "Reduzir o valor financiado");
  }
  if (scenario === "RISK") {
    suggestions.push(
      "Avaliar veículo de menor valor",
      "Encaminhar para análise manual",
      "Consultar diferentes instituições financeiras autorizadas"
    );
  }

  return { summary: parts.join(" "), scenario, suggestions };
}

function pickScenario(input: {
  score: number | null;
  hasRestriction: boolean;
  hasNegativeDebt: boolean;
  hasProtest: boolean;
}): CreditScenario {
  const { score, hasRestriction, hasNegativeDebt, hasProtest } = input;
  if (hasNegativeDebt || hasProtest) return "RISK";
  if (score != null && score < 500) return "RISK";
  if (score != null && score >= 700 && !hasRestriction) return "FAVORABLE";
  return "INTERMEDIATE";
}
