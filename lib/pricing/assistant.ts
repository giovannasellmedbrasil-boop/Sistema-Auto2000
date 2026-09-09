// "Pergunte à IA sobre seu estoque" (seção 13) — casamento de palavras-chave
// em PT-BR sobre os dados JÁ CALCULADOS do estoque real. Não é uma chamada a
// um LLM: é uma heurística de intenção + consulta determinística, seguindo
// o mesmo princípio de honestidade de lib/matching.ts (nunca responde com
// dado que não exista no estoque real).

import type { EnrichedVehicle } from "@/lib/pricing/types";
import { formatCurrency } from "@/lib/utils";
import { DEMAND_LABELS } from "@/lib/pricing/engine";

export interface AssistantAnswer {
  text: string;
  vehicleIds: string[];
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function label(v: EnrichedVehicle["vehicle"]): string {
  return `${v.brand} ${v.model} ${v.version} ${v.modelYear}`;
}

function listLines(items: EnrichedVehicle[], render: (i: EnrichedVehicle) => string): string {
  return items.map((i) => `• ${label(i.vehicle)} — ${render(i)}`).join("\n");
}

function extractNumber(q: string, fallback: number): number {
  const match = q.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : fallback;
}

export function answerPricingQuestion(question: string, items: EnrichedVehicle[]): AssistantAnswer {
  const q = stripAccents(question.toLowerCase());

  if (/(baixar|reduzir).*(preco)|reduzir hoje|precisam? de reducao/.test(q)) {
    const list = items
      .filter((i) => i.recommendation.action === "REDUCE")
      .sort((a, b) => b.recommendation.amount - a.recommendation.amount)
      .slice(0, 10);
    if (list.length === 0) {
      return { text: "Nenhum veículo do estoque está com recomendação de redução hoje.", vehicleIds: [] };
    }
    return {
      text: `${list.length} veículo(s) com recomendação de redução hoje:\n${listLines(list, (i) => `reduzir ${formatCurrency(i.recommendation.amount)} → ${formatCurrency(i.recommendation.suggestedPrice)}`)}`,
      vehicleIds: list.map((i) => i.vehicle.id),
    };
  }

  if (/mais de \d+ dias|ha \d+ dias|acima de \d+ dias/.test(q)) {
    const n = extractNumber(q, 60);
    const list = items
      .filter((i) => i.recommendation.daysInStock >= n)
      .sort((a, b) => b.recommendation.daysInStock - a.recommendation.daysInStock);
    if (list.length === 0) {
      return { text: `Nenhum veículo está há mais de ${n} dias em estoque.`, vehicleIds: [] };
    }
    return {
      text: `${list.length} veículo(s) há mais de ${n} dias em estoque:\n${listLines(list, (i) => `${i.recommendation.daysInStock} dias`)}`,
      vehicleIds: list.map((i) => i.vehicle.id),
    };
  }

  if (/maior margem|mais margem|melhor margem/.test(q)) {
    const list = [...items].sort((a, b) => b.recommendation.margin.value - a.recommendation.margin.value).slice(0, 10);
    return {
      text: `Veículos com maior margem atual:\n${listLines(list, (i) => formatCurrency(i.recommendation.margin.value))}`,
      vehicleIds: list.map((i) => i.vehicle.id),
    };
  }

  if (/maior procura|mais procura|maior demanda|mais demanda/.test(q)) {
    const list = items
      .filter((i) => i.recommendation.demand.level === "HIGH")
      .sort((a, b) => b.recommendation.demand.score - a.recommendation.demand.score);
    if (list.length === 0) {
      return { text: "Nenhum veículo está classificado como alta procura no momento.", vehicleIds: [] };
    }
    return {
      text: `Veículos com maior procura:\n${listLines(list, (i) => DEMAND_LABELS[i.recommendation.demand.level])}`,
      vehicleIds: list.map((i) => i.vehicle.id),
    };
  }

  if (/barato demais|muito barato|abaixo do mercado/.test(q)) {
    const list = items
      .filter((i) => i.recommendation.marketPositionPercent < -8)
      .sort((a, b) => a.recommendation.marketPositionPercent - b.recommendation.marketPositionPercent);
    if (list.length === 0) {
      return { text: "Não encontrei veículos anunciados muito abaixo do mercado no momento.", vehicleIds: [] };
    }
    return {
      text: `${list.length} veículo(s) possivelmente abaixo do preço ideal de mercado:\n${listLines(list, (i) => `${i.recommendation.marketPositionPercent.toFixed(1).replace(".", ",")}% vs mercado`)}`,
      vehicleIds: list.map((i) => i.vehicle.id),
    };
  }

  if (/potencial.*aumento|podem? aumentar|aumentar.*preco/.test(q)) {
    const list = items
      .filter((i) => i.recommendation.action === "INCREASE")
      .sort((a, b) => b.recommendation.amount - a.recommendation.amount);
    if (list.length === 0) {
      return { text: "Nenhum veículo tem recomendação de aumento no momento.", vehicleIds: [] };
    }
    return {
      text: `${list.length} veículo(s) com potencial de aumento:\n${listLines(list, (i) => `+${formatCurrency(i.recommendation.amount)} → ${formatCurrency(i.recommendation.suggestedPrice)}`)}`,
      vehicleIds: list.map((i) => i.vehicle.id),
    };
  }

  if (/capital parado|dinheiro parado|valor parado/.test(q)) {
    const list = items
      .filter((i) => i.recommendation.action === "REDUCE" || i.recommendation.daysInStock > 60)
      .sort((a, b) => b.vehicle.price - a.vehicle.price);
    const total = list.reduce((acc, i) => acc + i.vehicle.price, 0);
    if (list.length === 0) {
      return { text: "Não identifiquei capital parado relevante no estoque atual.", vehicleIds: [] };
    }
    return {
      text: `Capital parado estimado: ${formatCurrency(total)} em ${list.length} veículo(s), principalmente:\n${listLines(list.slice(0, 10), (i) => `${formatCurrency(i.vehicle.price)} (${i.recommendation.daysInStock} dias)`)}`,
      vehicleIds: list.map((i) => i.vehicle.id),
    };
  }

  if (/vender \d+|priorizar|vender.*rapido|vender rapidamente/.test(q)) {
    const n = extractNumber(q, 10);
    const ranked = [...items].sort((a, b) => {
      const urgencyA =
        a.recommendation.daysInStock +
        (a.recommendation.demand.level === "LOW" ? 30 : 0) +
        (a.recommendation.action === "REDUCE" ? 20 : 0);
      const urgencyB =
        b.recommendation.daysInStock +
        (b.recommendation.demand.level === "LOW" ? 30 : 0) +
        (b.recommendation.action === "REDUCE" ? 20 : 0);
      return urgencyB - urgencyA;
    });
    const list = ranked.slice(0, n);
    return {
      text: `Se precisar vender ${n} veículo(s) rapidamente, priorize (por tempo parado + baixa procura):\n${listLines(list, (i) => `${i.recommendation.daysInStock} dias, ${DEMAND_LABELS[i.recommendation.demand.level].toLowerCase()}`)}`,
      vehicleIds: list.map((i) => i.vehicle.id),
    };
  }

  return {
    text: "Não entendi bem a pergunta. Você pode perguntar, por exemplo: \"Quais veículos eu deveria baixar de preço hoje?\", \"Quais carros estão há mais de 60 dias?\", \"Quais veículos possuem maior margem?\", \"Quais carros têm maior procura?\", \"Tenho algum carro barato demais?\", \"Quais veículos têm potencial para aumento de preço?\", \"Quais veículos representam maior capital parado?\" ou \"Se eu precisar vender 10 carros rapidamente, quais devo priorizar?\".",
    vehicleIds: [],
  };
}
