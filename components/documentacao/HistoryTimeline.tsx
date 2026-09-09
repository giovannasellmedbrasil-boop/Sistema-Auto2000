import type { NegotiationHistoryEvent } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { History } from "lucide-react";

export function HistoryTimeline({ events }: { events: NegotiationHistoryEvent[] }) {
  if (events.length === 0) {
    return <EmptyState icon={History} title="Sem histórico ainda" />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((e) => (
        <li key={e.id} className="flex gap-3 text-sm">
          <span className="w-28 shrink-0 text-xs text-ink-500">
            {new Date(e.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-ink-800">
            {e.message} <span className="text-ink-500">— {e.actor}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
