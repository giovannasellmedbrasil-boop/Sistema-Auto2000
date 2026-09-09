import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export const NOT_AVAILABLE = "Informação não disponível na consulta contratada.";

type Tone = "neutral" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "text-white",
  success: "text-success-500",
  warning: "text-accent-400",
  danger: "text-danger-500",
};

export function IndicatorCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
}) {
  const isMissing = value == null || value === "";
  return (
    <Card className="flex flex-col gap-1.5 p-5">
      <span className="text-xs uppercase tracking-wide text-ink-500">{label}</span>
      <span
        className={cn(
          "text-lg font-semibold",
          isMissing ? "text-sm font-normal text-ink-600" : toneClass[tone]
        )}
      >
        {isMissing ? NOT_AVAILABLE : value}
      </span>
    </Card>
  );
}
