const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// "2026-09-02" -> "02 de Setembro de 2026" (mesmo formato dos modelos
// originais em PDF) — parseado manualmente para não sofrer deslocamento de
// fuso horário do construtor Date com uma string "YYYY-MM-DD".
export function formatDateExtended(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${String(day).padStart(2, "0")} de ${MONTHS_PT[month - 1]} de ${year}`;
}

// "2026-09-10" -> "10/09/2026"
export function formatDateSlash(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}
