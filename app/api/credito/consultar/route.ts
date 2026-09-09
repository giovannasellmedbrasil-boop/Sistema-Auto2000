import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { fetchCreditReport } from "@/lib/server/serasa";
import { interpretCreditReport } from "@/lib/creditAI";
import { appendAuditLog, createConsentRecord, createCreditAnalysis, createCreditCustomer } from "@/lib/server/db";
import { isValidCpf, maskCpf, onlyDigits } from "@/lib/utils";

// Registro da finalidade da consulta (seção 13) — texto fixo apresentado ao
// vendedor no formulário e gravado junto ao consentimento, nunca inventado
// caso a caso.
const CONSENT_TEXT =
  "Confirmo que o cliente autorizou a consulta de seus dados para finalidade de análise de crédito, com o objetivo de apoiar a negociação de financiamento de veículo junto à concessionária.";

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo"),
  cpf: z.string().trim().refine(isValidCpf, "CPF inválido"),
  birthDate: z.string().trim().min(8, "Informe a data de nascimento"),
  phone: z.string().trim().min(8, "Informe um telefone válido"),
  email: z.string().trim().email().optional().or(z.literal("")),
  monthlyIncome: z.coerce.number().positive("Informe a renda mensal"),
  downPayment: z.coerce.number().min(0),
  vehicleInterest: z.string().trim().min(2, "Informe o veículo de interesse"),
  vehiclePrice: z.coerce.number().positive("Informe o valor do veículo"),
  consent: z.literal(true, { message: "É necessário confirmar a autorização do cliente." }),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  if (!checkRateLimit(`credit:${session.id}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas consultas em pouco tempo. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const cpfDigits = onlyDigits(data.cpf);

  const customer = createCreditCustomer({
    name: data.name,
    cpf: cpfDigits,
    birthDate: data.birthDate,
    phone: data.phone,
    email: data.email || null,
  });

  const consent = createConsentRecord({
    customerId: customer.id,
    text: CONSENT_TEXT,
    granted: true,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  let report;
  try {
    report = await fetchCreditReport(cpfDigits);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível concluir a consulta na integração da Serasa agora. Tente novamente em instantes." },
      { status: 502 }
    );
  }

  const aiAnalysis = interpretCreditReport({
    report,
    monthlyIncome: data.monthlyIncome,
    downPayment: data.downPayment,
    vehiclePrice: data.vehiclePrice,
  });

  const analysis = createCreditAnalysis({
    customerId: customer.id,
    vehicleId: null,
    vehicleInterest: data.vehicleInterest,
    vehiclePrice: data.vehiclePrice,
    monthlyIncome: data.monthlyIncome,
    downPayment: data.downPayment,
    consentRecordId: consent.id,
    status: report.demo ? "UNAVAILABLE_DEMO" : "COMPLETED",
    report,
    aiAnalysis,
    commercialStatus: "CREDIT_CHECKED",
    sellerId: session.id,
    sellerName: session.name,
  });

  appendAuditLog({
    type: "CREDIT_QUERY",
    userEmail: session.email,
    detail: `Consulta de crédito para CPF ${maskCpf(cpfDigits)} — finalidade: análise de crédito para financiamento de veículo.`,
  });

  return NextResponse.json({ id: analysis.id }, { status: 201 });
}
