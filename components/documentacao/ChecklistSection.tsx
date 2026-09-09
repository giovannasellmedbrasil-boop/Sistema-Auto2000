import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ChecklistItemRow } from "@/components/documentacao/ChecklistItemRow";
import { computeProgressPercent } from "@/lib/server/documentChecklist";
import { CHECKLIST_CATEGORY_LABELS, type ChecklistCategory, type ChecklistItem } from "@/lib/types";

export function ChecklistSection({
  negotiationId,
  category,
  items,
}: {
  negotiationId: string;
  category: ChecklistCategory;
  items: ChecklistItem[];
}) {
  if (items.length === 0) return null;
  const percent = computeProgressPercent(items);

  return (
    <Card className="flex flex-col gap-3 p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-accent-400">{CHECKLIST_CATEGORY_LABELS[category]}</h3>
        <span className="text-xs text-ink-500">{percent}%</span>
      </div>
      <ProgressBar percent={percent} />
      <div className="flex flex-col">
        {items.map((item) => (
          <ChecklistItemRow key={item.id} negotiationId={negotiationId} item={item} />
        ))}
      </div>
    </Card>
  );
}
