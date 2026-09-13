import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LogoWatermark } from "@/components/ui/LogoWatermark";
import { buildWhatsAppLink } from "@/lib/utils";

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-8">
          <h2 className="text-lg font-semibold text-accent-400">Visite nossa loja</h2>
          <div className="flex flex-col gap-3 text-sm text-white">
            <span className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-600" />
              Av. Professor Luiz Ignácio Anhaia Mello, 8201 - Parque São Lourenço, São Paulo - SP, 03155-000
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-ink-600" /> Seg a sex, 9h às 18h · Sáb, 9h às 15h
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-ink-600" /> (11) 94729-4679
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-ink-600" /> auto2000veiculos@uol.com.br
            </span>
          </div>
          <Button
            href={buildWhatsAppLink("Olá! Gostaria de saber mais sobre a Auto2000.")}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            className="w-fit"
          >
            Falar no WhatsApp
          </Button>
        </Card>

        <Card className="relative aspect-video overflow-hidden p-0 lg:aspect-auto">
          <Image
            src="/loja-fachada.png"
            alt="Fachada da loja Auto2000, Av. Professor Luiz Ignácio Anhaia Mello, 8201"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </Card>
      </div>
      </Container>
    </div>
  );
}
