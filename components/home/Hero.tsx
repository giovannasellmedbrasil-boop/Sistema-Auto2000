import Image from "next/image";
import { HeroSearch } from "@/components/home/HeroSearch";

export function Hero({ brands }: { brands: string[] }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(255,176,0,0.35), transparent 45%), radial-gradient(circle at 85% 0%, rgba(255,176,0,0.22), transparent 40%)",
        }}
      />

      {/* Marca d'água do logo — apenas textura de fundo, nunca sobre o conteúdo */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-6%] top-[58%] hidden h-[70%] w-[42%] -translate-y-1/2 sm:right-[-4%] sm:block sm:h-[85%] sm:w-[40%] lg:right-[-2%] lg:h-[95%] lg:w-[44%]"
        style={{
          opacity: 0.08,
          filter: "blur(3px)",
          WebkitMaskImage:
            "radial-gradient(ellipse 62% 72% at 62% 50%, black 25%, transparent 85%)",
          maskImage:
            "radial-gradient(ellipse 62% 72% at 62% 50%, black 25%, transparent 85%)",
        }}
      >
        <Image
          src="/logo.png"
          alt=""
          fill
          priority={false}
          className="object-contain"
          sizes="45vw"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 py-20 text-center sm:items-start sm:px-6 sm:py-28 sm:text-left lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 animate-fade-in-up">
          Seminovos selecionados · Financiamento facilitado
        </span>

        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-accent-400 sm:max-w-xl sm:text-6xl animate-fade-in-up">
          Seu próximo carro começa aqui.
        </h1>

        <p className="max-w-xl text-balance text-lg text-white/70 animate-fade-in-up">
          Encontre, simule e negocie seu veículo de forma simples, rápida e segura.
        </p>

        <div className="w-full max-w-2xl animate-fade-in-up">
          <HeroSearch brands={brands} />
        </div>
      </div>
    </section>
  );
}
