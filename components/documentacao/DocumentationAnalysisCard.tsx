import { CheckCircle2, Info, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { DocumentationAnalysis } from "@/lib/server/documentChecklist";

export function DocumentationAnalysisCard({ analysis }: { analysis: DocumentationAnalysis }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-accent-400">Análise da documentação</h3>
        <span className="text-sm font-semibold text-ink-800">{analysis.percent}% completa</span>
      </div>
      <ProgressBar percent={analysis.percent} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          {analysis.receivedLabels.map((label) => (
            <p key={label} className="flex items-center gap-2 py-0.5 text-sm text-ink-700">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-500" />
              {label}
            </p>
          ))}
        </div>
        <div>
          {analysis.missingLabels.map((label) => (
            <p key={label} className="flex items-center gap-2 py-0.5 text-sm text-ink-700">
              <XCircle className="h-3.5 w-3.5 shrink-0 text-danger-500" />
              {label}
            </p>
          ))}
        </div>
      </div>
      <p className="flex items-start gap-2 text-xs text-ink-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Verificação automática baseada no checklist e no que já foi marcado/anexado — não é leitura do
        conteúdo do arquivo (OCR/IA). Extração automática de dados do documento é uma evolução futura,
        quando um provedor de visão computacional for integrado.
      </p>
    </Card>
  );
}
