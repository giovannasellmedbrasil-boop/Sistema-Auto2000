import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function AiTeaser() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-card border border-accent-500/25 bg-black p-8 text-center sm:p-10">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
            <Sparkles className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold tracking-tight text-accent-400">
              Qual carro combina com você?
            </h3>
            <p className="text-sm leading-relaxed text-white/60">
              Conte o que procura em poucas palavras e nossa inteligência encontra as
              melhores opções disponíveis no nosso estoque real — sem inventar veículos.
            </p>
          </div>
          <Button href="/encontre-seu-carro" variant="secondary" className="w-fit">
            Encontrar meu carro com IA
          </Button>
        </div>
      </Container>
    </section>
  );
}
