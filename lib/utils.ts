import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function vehicleSlug(v: {
  brand: string;
  model: string;
  version: string;
  modelYear: number;
}): string {
  return slugify(`${v.brand}-${v.model}-${v.version}-${v.modelYear}`);
}

export function daysInStock(enteredStockAt: string): number {
  const entered = new Date(enteredStockAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - entered) / (1000 * 60 * 60 * 24)));
}

const STORE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511947294679";

export function buildWhatsAppLink(message: string): string {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?${params.toString()}`;
}

export function vehicleWhatsAppMessage(v: {
  brand: string;
  model: string;
  version: string;
  modelYear: number;
}): string {
  return `Olá! Tenho interesse no ${v.brand} ${v.model} ${v.version} ${v.modelYear} anunciado no site.`;
}

// --- CPF (seção 13 — CPF sempre mascarado na interface) --------------------

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskCpf(cpf: string): string {
  const digits = onlyDigits(cpf);
  const last2 = digits.slice(-2).padStart(2, "*");
  return `***.***.***-${last2}`;
}

export function formatCpfInput(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// --- Assistente de Documentação --------------------------------------------

export function documentRequestWhatsAppMessage(params: {
  customerFirstName: string;
  vehicleLabel: string;
  missingLabels: string[];
}): string {
  const { customerFirstName, vehicleLabel, missingLabels } = params;
  const list = missingLabels.map((l) => `• ${l}`).join("\n");
  return `Olá, ${customerFirstName}! Para continuarmos o processo de compra do seu ${vehicleLabel}, precisamos dos seguintes documentos:\n\n${list}\n\nVocê pode enviar os documentos respondendo esta mensagem.`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// --- Precificação — links de busca (nunca scraping, apenas conveniência) ---

export function buildMarketSearchLinks(vehicle: { brand: string; model: string; version: string; modelYear: number }) {
  const query = `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.modelYear}`;
  const encoded = encodeURIComponent(query);
  return [
    { label: "Google", url: `https://www.google.com/search?q=${encoded}+preço+usado+à+venda` },
    { label: "Mercado Livre", url: `https://lista.mercadolivre.com.br/${encodeURIComponent(query.replace(/\s+/g, "-"))}` },
    { label: "OLX", url: `https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios?q=${encoded}` },
    { label: "Webmotors", url: `https://www.webmotors.com.br/carros/estoque?q=${encoded}` },
    { label: "iCarros", url: `https://www.icarros.com.br/busca/?q=${encoded}` },
  ];
}

export function isValidCpf(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;
  return check2 === parseInt(digits[10], 10);
}
