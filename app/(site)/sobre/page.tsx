import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Mail, MapPin, Phone, ShieldCheck, Star, Award, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a história, os diferenciais e as garantias da Auto2000.",
};

const DIFERENCIAIS = [
  { icon: ShieldCheck, title: "Procedência verificada", text: "Todo veículo passa por inspeção de +140 itens antes de entrar no estoque." },
  { icon: Award, title: "Garantia na compra", text: "Garantia de motor e câmbio inclusa em todos os seminovos, conforme condições do veículo." },
  { icon: Users, title: "Time especializado", text: "Consultores dedicados a te ajudar a encontrar o carro certo, sem pressão." },
];

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?sca_esv=97ecd86c81018411&cs=0&output=search&kgmid=/g/11c54g7zmk&q=Auto+2000+Ve%C3%ADculos&shem=dlvs1,epsd1,ltae,rimspwouoe&shndl=30&source=sh/x/loc/uni/m1/1&kgs=2b5ad3114cfcec60&utm_source=dlvs1,epsd1,ltae,rimspwouoe,sh/x/loc/uni/m1/1#lrd=0x94ce5d672c2ed5a1:0x1b750281f91d1451,1,,,,";

export default function SobrePage() {
  return (
    <Container className="flex flex-col gap-16 py-10 sm:py-14">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-accent-400 sm:text-4xl">
          Sobre a Auto2000
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-500">
          Há mais de quatro décadas, construímos nossa história com base em confiança,
          tradição e relacionamento.
        </p>
      </div>

      <div className="flex max-w-3xl flex-col gap-5 text-base leading-relaxed text-ink-500">
        <p>
          Fundada em 1982, nossa loja nasceu como um negócio familiar e, ao longo de 44 anos
          de trajetória, consolidou-se no mercado mantendo os mesmos valores que fizeram parte
          do nosso início: seriedade, transparência, respeito e compromisso com cada cliente.
        </p>
        <p>
          Somos uma empresa familiar, com uma estrutura construída para oferecer segurança,
          conforto e um atendimento próximo em todas as etapas da compra ou venda de um veículo.
        </p>
        <p>
          Ao longo dos anos, acompanhamos as transformações do mercado automotivo, evoluímos
          nossa forma de trabalhar e incorporamos novas tecnologias, sem deixar de lado aquilo
          que consideramos essencial: conhecer nossos clientes, entender suas necessidades e
          construir relações duradouras.
        </p>
        <p>
          Cada veículo que passa pela nossa loja faz parte de uma história e cada cliente que
          confia em nosso trabalho passa a fazer parte da nossa também.
        </p>
        <p className="font-medium text-accent-400">
          Desde 1982, tradição de família, confiança construída ao longo de gerações.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {DIFERENCIAIS.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="flex flex-col gap-3 p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h3 className="text-sm font-semibold text-accent-400">{title}</h3>
            <p className="text-sm leading-relaxed text-ink-500">{text}</p>
          </Card>
        ))}
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-3 rounded-card border border-white/8 bg-ink-100 p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-[var(--shadow-card-hover)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
            <Star className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <h3 className="text-sm font-semibold text-accent-400">Avaliação dos clientes</h3>
          <p className="text-sm leading-relaxed text-ink-500">
            4,8/5 em 120 avaliações de clientes atendidos, direto no Google.
          </p>
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-8">
          <h2 className="text-lg font-semibold text-accent-400">Visite nossa loja</h2>
          <div className="flex flex-col gap-3 text-sm text-ink-600">
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
  );
}
