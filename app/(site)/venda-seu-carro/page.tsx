import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { TradeInForm } from "@/components/trade-in/TradeInForm";
import { LogoWatermark } from "@/components/ui/LogoWatermark";

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
    <div className="relative">
      {/* Faixa com altura fixa (mesma medida do Hero da home) para a marca
          d'água — evita que o logo estique/deforme em páginas mais longas. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden overflow-hidden sm:block sm:h-[790px] lg:h-[715px] xl:h-[690px]">
        <LogoWatermark />
      </div>
      <Container className="relative flex flex-col gap-10 py-10 sm:py-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-accent-400 sm:text-4xl">
            Venda seu carro com segurança e facilidade
          </h1>
          <p className="max-w-2xl text-white">
            Envie os dados do seu veículo e receba uma avaliação inicial.
          </p>
        </div>
        <div className="max-w-3xl">
          <TradeInForm desiredVehicleSlug={sp.veiculo} />
        </div>
      </Container>
    </div>
  );
}
