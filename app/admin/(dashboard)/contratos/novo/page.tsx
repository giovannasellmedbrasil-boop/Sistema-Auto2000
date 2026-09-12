import type { Metadata } from "next";
import { ContractForm } from "@/components/contratos/ContractForm";

export const metadata: Metadata = { title: "Novo contrato", robots: { index: false } };

export default function NovoContratoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Novo contrato</h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Escolha o tipo e preencha os dados — o contrato completo é gerado no modelo da loja, pronto para
          imprimir ou salvar em PDF.
        </p>
      </div>
      <div className="max-w-3xl">
        <ContractForm />
      </div>
    </div>
  );
}
