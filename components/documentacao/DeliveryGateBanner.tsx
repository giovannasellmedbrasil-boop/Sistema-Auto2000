import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ChecklistItem } from "@/lib/types";
import { DeliverButton } from "@/components/documentacao/DeliverButton";

export function DeliveryGateBanner({
  negotiationId,
  ready,
  missingItems,
  alreadyDelivered,
  canConfirmDelivery,
}: {
  negotiationId: string;
  ready: boolean;
  missingItems: ChecklistItem[];
  alreadyDelivered: boolean;
  canConfirmDelivery: boolean;
}) {
  if (alreadyDelivered) {
    return (
      <Card className="flex items-center gap-3 border-success-500/30 bg-success-500/10 p-5">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-success-500" />
        <p className="text-sm font-semibold text-success-500">Veículo já entregue ao cliente.</p>
      </Card>
    );
  }

  if (ready) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-4 border-success-500/30 bg-success-500/10 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-success-500" />
          <p className="text-sm font-semibold text-success-500">
            DOCUMENTAÇÃO COMPLETA — VEÍCULO LIBERADO PARA ENTREGA
          </p>
        </div>
        {canConfirmDelivery && <DeliverButton negotiationId={negotiationId} />}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 border-danger-500/30 bg-danger-500/10 p-5">
      <div className="flex items-center gap-3">
        <XCircle className="h-6 w-6 shrink-0 text-danger-500" />
        <p className="text-sm font-semibold text-danger-500">
          Faltam {missingItems.length} {missingItems.length === 1 ? "item" : "itens"} para liberar a entrega
        </p>
      </div>
      <ul className="ml-9 flex flex-col gap-1 text-sm text-ink-700">
        {missingItems.map((item) => (
          <li key={item.id}>• {item.label}</li>
        ))}
      </ul>
    </Card>
  );
}
