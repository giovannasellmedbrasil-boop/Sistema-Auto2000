import { ShieldCheck, BadgeCheck, Clock3, HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/Container";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Procedência garantida",
    text: "Todos os veículos passam por inspeção antes de entrar no estoque.",
  },
  {
    icon: BadgeCheck,
    title: "Documentação em dia",
    text: "Transferência e burocracia cuidadas por nossa equipe, do início ao fim.",
  },
  {
    icon: Clock3,
    title: "Processo rápido",
    text: "Simule, negocie e feche negócio sem enrolação, presencial ou online.",
  },
  {
    icon: HeartHandshake,
    title: "Suporte pós-venda",
    text: "Canal direto com nossa equipe mesmo depois da compra concluída.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h3 className="text-base font-semibold text-accent-400">{title}</h3>
            <p className="text-sm leading-relaxed text-ink-500">{text}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
