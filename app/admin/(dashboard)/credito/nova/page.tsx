import type { Metadata } from "next";
import { NovaAnaliseForm } from "@/components/credito/NovaAnaliseForm";

export const metadata: Metadata = { title: "Nova Análise de Crédito", robots: { index: false } };

export default function NovaAnalisePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Análise Inteligente de Crédito</h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Consulte indicadores de crédito e tenha uma pré-análise inteligente para auxiliar na
          negociação do financiamento. A consulta só é realizada após confirmar a autorização do
          cliente.
        </p>
      </div>

      <div className="max-w-3xl">
        <NovaAnaliseForm />
      </div>
    </div>
  );
}
