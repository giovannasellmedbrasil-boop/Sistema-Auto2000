// Simulador de financiamento — seção 9. Usa uma taxa referencial fixa apenas
// para fins de estimativa neste ambiente de demonstração. Nenhuma proposta
// real de crédito é gerada aqui; quando uma financeira/banco for integrado
// (seção 26), esta função deve ser substituída pela chamada à API real.

export const DEMO_MONTHLY_RATE = 0.0199; // 1,99% a.m. — taxa referencial de demonstração

export function simulateFinancing(financedAmount: number, termMonths: number, rate = DEMO_MONTHLY_RATE) {
  if (financedAmount <= 0 || termMonths <= 0) {
    return { installment: 0, totalCost: 0, totalInterest: 0 };
  }
  if (rate === 0) {
    const installment = financedAmount / termMonths;
    return { installment, totalCost: financedAmount, totalInterest: 0 };
  }
  const installment =
    (financedAmount * rate) / (1 - Math.pow(1 + rate, -termMonths));
  const totalCost = installment * termMonths;
  return {
    installment,
    totalCost,
    totalInterest: totalCost - financedAmount,
  };
}

// Comprometimento de renda (seção 6). A taxa de juros usada na simulação de
// crédito da loja é sempre informada pelo vendedor — nunca um valor
// inventado — por isso `simulateFinancing` é chamada explicitamente com a
// taxa recebida do formulário, sem usar DEMO_MONTHLY_RATE, nesse fluxo.
export function incomeCommitmentRatio(installment: number, monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 0;
  return installment / monthlyIncome;
}
