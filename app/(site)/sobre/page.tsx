import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { LogoWatermark } from "@/components/ui/LogoWatermark";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a história, os diferenciais e as garantias da Auto2000.",
};

export default function SobrePage() {
  return (
    <div className="relative">
      {/* A marca d'água fica numa faixa com altura fixa (igual à medida do
          Hero da home) em vez de esticar pela altura da página inteira —
          senão o logo sairia gigante/desproporcional em páginas mais longas. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden overflow-hidden sm:block sm:h-[790px] lg:h-[715px] xl:h-[690px]">
        <LogoWatermark />
      </div>
      <Container className="relative flex flex-col gap-16 py-10 sm:py-14">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-accent-400 sm:text-4xl">
          Auto 2000 Veículos
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-white">
          Há mais de quatro décadas, construímos nossa história com base em confiança,
          tradição e relacionamento.
        </p>
      </div>

      <div className="flex max-w-3xl flex-col gap-5 text-base leading-relaxed text-white">
        <p>
          Ao longo de 44 anos, acompanhamos muito mais do que mudanças no mercado.
          Acompanhamos conquistas, novos começos e diferentes gerações de clientes que
          escolheram confiar na Auto2000.
        </p>
        <p>
          Porque sabemos que um carro representa muito mais do que uma compra. Ele acompanha
          momentos importantes, realiza planos e faz parte de novas histórias.
        </p>
        <p>
          E é essa confiança, construída ao longo de tantos anos, que nos inspira a continuar.
        </p>
        <p className="font-medium text-accent-400">
          Auto2000. Desde 1982, uma história de família, feita de confiança e construída para
          atravessar gerações.
        </p>
      </div>

      <Card className="relative mx-auto aspect-video w-full max-w-3xl overflow-hidden p-0">
        <Image
          src="/loja-fachada.png"
          alt="Fachada da loja Auto2000, Av. Professor Luiz Ignácio Anhaia Mello, 8201"
          fill
          className="object-cover"
          sizes="(min-width: 768px) 48rem, 100vw"
        />
      </Card>
      </Container>
    </div>
  );
}
