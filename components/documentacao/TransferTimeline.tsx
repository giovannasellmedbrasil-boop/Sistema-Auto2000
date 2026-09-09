"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { TRANSFER_STAGE_LABELS, TRANSFER_STAGE_ORDER, type TransferStageKey } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransferTimeline({ negotiationId, currentStage }: { negotiationId: string; currentStage: TransferStageKey }) {
  const router = useRouter();
  const [saving, setSaving] = useState<TransferStageKey | null>(null);
  const currentIndex = TRANSFER_STAGE_ORDER.indexOf(currentStage);

  async function advanceTo(stage: TransferStageKey) {
    setSaving(stage);
    try {
      const res = await fetch(`/api/negotiations/${negotiationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferStage: stage }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-0">
      {TRANSFER_STAGE_ORDER.map((stage, i) => {
        const done = i <= currentIndex;
        const isNext = i === currentIndex + 1;
        return (
          <div key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  done ? "border-success-500 bg-success-500 text-white" : "border-white/20 text-white/50"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < TRANSFER_STAGE_ORDER.length - 1 && (
                <span className={cn("w-px flex-1", done ? "bg-success-500" : "bg-white/15")} style={{ minHeight: 28 }} />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between pb-7">
              <span className={cn("text-sm", done ? "text-ink-800" : "text-ink-500")}>{TRANSFER_STAGE_LABELS[stage]}</span>
              {isNext && (
                <button
                  type="button"
                  onClick={() => advanceTo(stage)}
                  disabled={saving === stage}
                  className="text-xs font-medium text-accent-400 hover:underline disabled:opacity-50"
                >
                  {saving === stage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Marcar concluído"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
