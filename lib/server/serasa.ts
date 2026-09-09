import crypto from "node:crypto";
import type { CreditFactor, CreditIndicators, CreditReport } from "@/lib/types";

// Integração com a API oficial e contratada da Serasa Experian (seção 2 do
// briefing). Nunca faz scraping ou automação do site da Serasa — apenas
// chamadas HTTP autenticadas ao endpoint oficial contratado, configurado por
// variáveis de ambiente. As credenciais só existem aqui (server-only) e
// nunca são importadas por um Client Component.
//
// Enquanto SERASA_API_URL/CLIENT_ID/CLIENT_SECRET/API_KEY não estiverem
// definidas, o app roda em MODO DEMO: os dados retornados são fictícios,
// gerados de forma determinística a partir do CPF (mesma consulta = mesmo
// resultado, sem persistir nada em serviço externo) e sempre marcados com
// `demo: true`. A UI é responsável por exibir o aviso "DADOS SIMULADOS —
// NÃO REPRESENTAM CONSULTA REAL" sempre que `demo` for true.

interface SerasaConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  apiKey: string;
  environment: string;
}

function getConfig(): SerasaConfig | null {
  const apiUrl = process.env.SERASA_API_URL;
  const clientId = process.env.SERASA_CLIENT_ID;
  const clientSecret = process.env.SERASA_CLIENT_SECRET;
  const apiKey = process.env.SERASA_API_KEY;
  if (!apiUrl || !clientId || !clientSecret || !apiKey) return null;
  return {
    apiUrl,
    clientId,
    clientSecret,
    apiKey,
    environment: process.env.SERASA_ENVIRONMENT ?? "sandbox",
  };
}

export function isServiceConfigured(): boolean {
  return getConfig() !== null;
}

export function getServiceEnvironment(): string {
  return getConfig()?.environment ?? "não configurado (modo demo)";
}

export async function fetchCreditReport(cpfDigits: string): Promise<CreditReport> {
  const config = getConfig();
  if (!config) return buildDemoReport(cpfDigits);
  return fetchRealReport(config, cpfDigits);
}

// --- Integração real ---------------------------------------------------
//
// Estrutura pronta para o produto contratado junto à Serasa Experian.
// O endpoint, o payload de autenticação e o parsing da resposta variam
// conforme o produto/plano contratado — ajustar `getAccessToken` e
// `parseProviderResponse` de acordo com a documentação oficial recebida no
// onboarding, sem inventar campos que a API não retorne.
async function fetchRealReport(config: SerasaConfig, cpfDigits: string): Promise<CreditReport> {
  const token = await getAccessToken(config);
  const res = await fetch(`${config.apiUrl}/credit-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-api-key": config.apiKey,
    },
    body: JSON.stringify({ document: cpfDigits }),
  });

  if (!res.ok) {
    throw new Error(`API da Serasa respondeu ${res.status}`);
  }

  const data = await res.json();
  return parseProviderResponse(data);
}

async function getAccessToken(config: SerasaConfig): Promise<string> {
  // Placeholder do fluxo OAuth client-credentials — substituir pela
  // implementação real do produto contratado quando o onboarding técnico
  // com a Serasa Experian for concluído.
  void config;
  throw new Error(
    "Fluxo de autenticação da API Serasa ainda não implementado para este produto contratado."
  );
}

function parseProviderResponse(data: unknown): CreditReport {
  // O mapeamento do payload real deve seguir exatamente a documentação do
  // produto contratado — nunca inventar estrutura aqui.
  void data;
  throw new Error("Parser da resposta da API Serasa ainda não implementado.");
}

// --- Modo demo -----------------------------------------------------------

function buildDemoReport(cpfDigits: string): CreditReport {
  const seed = crypto.createHash("sha256").update(cpfDigits || "0").digest();
  const rnd = (i: number) => seed[i % seed.length] / 255;

  const score = Math.round(300 + rnd(0) * 700);
  const scoreClassification =
    score >= 700 ? "Bom" : score >= 500 ? "Regular" : score >= 300 ? "Atenção" : "Baixo";
  const riskIndicator =
    score >= 700
      ? "Risco relativo baixo"
      : score >= 500
        ? "Risco relativo moderado"
        : "Risco relativo elevado";

  const hasRestriction = rnd(1) > 0.75;
  const recentInquiries = Math.round(rnd(5) * 5);

  const indicators: CreditIndicators = {
    restrictions: hasRestriction ? "Restrição identificada (simulada)" : "Nenhuma identificada",
    pendingDebtsAmount: hasRestriction ? Math.round(rnd(2) * 5000) : 0,
    protests: hasRestriction && rnd(3) > 0.5 ? Math.round(1 + rnd(3) * 2) : 0,
    bouncedChecks: 0,
    negativeDebts: hasRestriction && rnd(4) > 0.4 ? Math.round(1 + rnd(4) * 2) : 0,
    recentInquiries,
    positiveRegistry: rnd(6) > 0.2 ? "ATIVO" : "INATIVO",
  };

  const factors: CreditFactor[] = [
    {
      label: "Histórico de pagamentos considerado nesta consulta",
      impact: score >= 600 ? "POSITIVE" : "NEUTRAL",
    },
    { label: "Tempo de relacionamento com o mercado de crédito", impact: "POSITIVE" },
    hasRestriction
      ? { label: "Ocorrência de restrição financeira identificada", impact: "NEGATIVE" }
      : { label: "Ausência de restrições identificadas nesta consulta", impact: "POSITIVE" },
    {
      label: "Volume de consultas recentes ao CPF",
      impact: recentInquiries > 3 ? "NEGATIVE" : "NEUTRAL",
    },
  ];

  return {
    provider: "DEMO",
    demo: true,
    score,
    scoreRangeMax: 1000,
    scoreClassification,
    riskIndicator,
    consultedAt: new Date().toISOString(),
    indicators,
    factors,
  };
}
