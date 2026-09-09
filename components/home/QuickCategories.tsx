import Link from "next/link";
import {
  Car,
  CarFront,
  Settings2,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CATEGORIES = [
  { label: "SUVs", href: "/estoque?bodyType=SUV", icon: CarFront },
  { label: "Sedans", href: "/estoque?bodyType=SEDAN", icon: Car },
  { label: "Hatch", href: "/estoque?bodyType=HATCH", icon: Car },
  { label: "Picapes", href: "/estoque?bodyType=PICKUP", icon: Truck },
  { label: "Automáticos", href: "/estoque?transmission=AUTOMATIC", icon: Settings2 },
  { label: "Até R$ 60 mil", href: "/estoque?priceMax=60000", icon: Wallet },
  { label: "Até R$ 100 mil", href: "/estoque?priceMax=100000", icon: Wallet },
  { label: "Recém-chegados", href: "/estoque?sort=recent", icon: Sparkles },
];

export function QuickCategories() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading eyebrow="Comece por aqui" title="O que você está buscando?" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col items-start gap-4 rounded-card border border-white/8 bg-ink-100 p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-50 text-ink-700 transition-colors group-hover:bg-accent-100 group-hover:text-accent-700">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="text-sm font-semibold text-ink-900">{label}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
