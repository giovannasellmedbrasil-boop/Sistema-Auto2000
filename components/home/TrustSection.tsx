import { ShieldCheck, Clock3, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Procedência garantida",
    text: "Todos os veículos passam por laudo cautelar antes de entrar no estoque.",
  },
  {
    icon: Clock3,
    title: "Processo rápido",
    text: "Da simulação à entrega do seu veículo, cuidamos de cada etapa para tornar sua compra rápida, simples e segura, seja presencialmente ou online.",
  },
  {
    icon: HeartHandshake,
    title: "Suporte pós-venda",
    text: "Acompanhamos cada pedido de perto e permanecemos à disposição para dúvidas, ajustes ou qualquer suporte necessário.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h3 className="flex items-center gap-2 text-base font-semibold text-accent-400">
              {title}
              <CheckCircle2 className="h-4.5 w-4.5 text-success-500" strokeWidth={2} />
            </h3>
            <p className="text-sm leading-relaxed text-white">{text}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
