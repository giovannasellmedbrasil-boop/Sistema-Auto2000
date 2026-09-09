import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { VehicleMatchFinder } from "@/components/ia/VehicleMatchFinder";

export const metadata: Metadata = {
  title: "Encontre seu carro com IA",
  description: "Descreva o carro que você procura e encontre as melhores opções do nosso estoque real.",
};

export default function EncontreSeuCarroPage() {
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <div className="flex flex-col gap-3 text-center sm:mx-auto sm:max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-accent-400 sm:text-4xl">
          Qual carro combina com você?
        </h1>
        <p className="text-ink-500">
          Conte o que procura e nossa inteligência encontra as melhores opções disponíveis no
          nosso estoque real.
        </p>
        <p className="text-xs text-ink-600">
          Versão inicial por correspondência de palavras-chave — recomendação com IA completa
          chega em breve. Nunca sugerimos veículos fora do estoque.
        </p>
      </div>
      <div className="mx-auto w-full max-w-3xl">
        <VehicleMatchFinder />
      </div>
    </Container>
  );
}
