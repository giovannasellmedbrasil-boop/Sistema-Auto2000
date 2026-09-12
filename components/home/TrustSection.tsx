import { ShieldCheck, BadgeCheck, Clock3, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Procedência garantida",
    text: "Todos os veículos passam por laudo cautelar antes de entrar no estoque.",
  },
  {
    icon: BadgeCheck,
    title: "Documentação em dia",
    text: "Nossa equipe cuida de todo o processo incluindo o de transferência de propriedade.",
  },
  {
    icon: Clock3,
    title: "Processo rápido",
    text: "Simule, negocie e feche negócio sem enrolação, presencial ou online.",
  },
  {
    icon: HeartHandshake,
    title: "Suporte pós-venda",
    text: "Acompanhamos cada pedido de perto e permanecemos à disposição para dúvidas, ajustes ou qualquer suporte necessário.",
    checkmark: true,
  },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text, checkmark }) => (
          <div key={title} className="flex flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h3 className="flex items-center gap-2 text-base font-semibold text-accent-400">
              {title}
              {checkmark && <CheckCircle2 className="h-4.5 w-4.5 text-success-500" strokeWidth={2} />}
            </h3>
            {text && <p className="text-sm leading-relaxed text-white">{text}</p>}
          </div>
        ))}
      </Container>
    </section>
  );
}
