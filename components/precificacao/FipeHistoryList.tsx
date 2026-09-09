import type { FipeQuote } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function FipeHistoryList({ quotes }: { quotes: FipeQuote[] }) {
  if (quotes.length === 0) return <p className="text-sm text-ink-500">Nenhuma consulta registrada ainda.</p>;

  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {quotes.map((q) => (
        <li key={q.id} className="flex items-center gap-3 text-ink-700">
          <span className="font-medium text-ink-900">{formatCurrency(q.value)}</span>
          <span className="text-ink-500">ref. {q.referenceMonth}</span>
          <span className="ml-auto text-xs text-ink-500">{new Date(q.queriedAt).toLocaleString("pt-BR")}</span>
        </li>
      ))}
    </ul>
  );
}
