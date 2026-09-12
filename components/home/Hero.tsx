import Image from "next/image";
import Link from "next/link";
import { Wallet } from "lucide-react";

const PRICE_RANGES = [
  { label: "Até R$ 25 mil", href: "/?priceMax=25000" },
  { label: "De R$ 25 mil a R$ 50 mil", href: "/?priceMin=25000&priceMax=50000" },
  { label: "De R$ 50 mil a R$ 75 mil", href: "/?priceMin=50000&priceMax=75000" },
  { label: "A partir de R$ 75 mil", href: "/?priceMin=75000" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
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

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 pb-16 pt-20 text-center sm:items-start sm:px-6 sm:pb-20 sm:pt-28 sm:text-left lg:px-8">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-accent-400 sm:max-w-xl sm:text-6xl animate-fade-in-up">
          Novos caminhos começam com a escolha certa.
        </h1>

        <p className="max-w-xl text-balance text-lg text-white/70 animate-fade-in-up">
          Encontre, simule e negocie seu veículo de forma simples, rápida e segura.
        </p>

        <div className="grid w-full grid-cols-2 gap-3 animate-fade-in-up sm:grid-cols-4">
          {PRICE_RANGES.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col items-start gap-4 rounded-card border border-white/8 bg-ink-100 p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-50 text-ink-700 transition-colors group-hover:bg-accent-100 group-hover:text-accent-700">
                <Wallet className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="text-sm font-semibold text-ink-900">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
