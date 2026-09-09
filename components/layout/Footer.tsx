import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";

const columns = [
  {
    title: "Comprar",
    links: [
      { href: "/estoque", label: "Todos os veículos" },
      { href: "/estoque?bodyType=SUV", label: "SUVs" },
      { href: "/estoque?bodyType=SEDAN", label: "Sedans" },
      { href: "/estoque?bodyType=HATCH", label: "Hatch" },
      { href: "/encontre-seu-carro", label: "Encontre com IA" },
      { href: "/venda-seu-carro", label: "Venda ou troque seu carro" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { href: "/sobre", label: "Sobre nós" },
      { href: "/contato", label: "Contato" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white/60">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center" aria-label="Auto2000 — início">
            <Image
              src="/logo.png"
              alt="Auto2000 Veículos"
              width={896}
              height={444}
              className="h-12 w-auto rounded-md"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            Desde 1982, uma loja de família construída com tradição, confiança e
            compromisso em sede própria.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-white/60">
            <span className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
              Av. Professor Luiz Ignácio Anhaia Mello, 8201 - Parque São Lourenço, São Paulo - SP, 03155-000
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-accent-400" /> (11) 94729-4679
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-accent-400" /> auto2000veiculos@uol.com.br
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-accent-400" /> Seg a sex, 9h às 18h · Sáb, 9h às 15h
            </span>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-accent-400">{col.title}</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/55 hover:text-accent-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="text-xs text-white/35">
          <span>© {new Date().getFullYear()} Auto2000. Todos os direitos reservados.</span>
        </Container>
      </div>
    </footer>
  );
}
