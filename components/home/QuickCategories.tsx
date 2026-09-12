import Link from "next/link";
import { Wallet } from "lucide-react";
import { Container } from "@/components/ui/Container";

const CATEGORIES = [
  { label: "Até R$ 25 mil", href: "/estoque?priceMax=25000", icon: Wallet },
  { label: "De R$ 25 mil a R$ 50 mil", href: "/estoque?priceMin=25000&priceMax=50000", icon: Wallet },
  { label: "De R$ 50 mil a R$ 75 mil", href: "/estoque?priceMin=50000&priceMax=75000", icon: Wallet },
  { label: "A partir de R$ 75 mil", href: "/estoque?priceMin=75000", icon: Wallet },
];

export function QuickCategories() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
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
