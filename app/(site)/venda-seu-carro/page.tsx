import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { TradeInForm } from "@/components/trade-in/TradeInForm";

export const metadata: Metadata = {
  title: "Venda seu carro",
  description: "Envie os dados do seu veículo e receba uma avaliação inicial da Auto2000.",
};

export default async function VendaSeuCarroPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-accent-400 sm:text-4xl">
          Venda seu carro para nós
        </h1>
        <p className="max-w-2xl text-ink-500">
          Envie os dados do seu veículo e receba uma avaliação inicial.
        </p>
      </div>
      <div className="max-w-3xl">
        <TradeInForm desiredVehicleSlug={sp.veiculo} />
      </div>
    </Container>
  );
}
