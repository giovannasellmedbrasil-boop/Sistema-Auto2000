"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, MessageCircle, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { buildWhatsAppLink } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/venda-seu-carro", label: "Venda seu carro" },
  { href: "/sobre", label: "Sobre nós" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center" aria-label="Auto2000 — início">
            <Image
              src="/logo.png"
              alt="Auto2000 Veículos"
              width={896}
              height={444}
              priority
              className="h-11 w-auto rounded-md"
            />
          </Link>

          <div className="flex items-center gap-2 border-l border-white/15 pl-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-accent-400 text-accent-400">
              <Award className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-xs font-bold text-accent-400">44 ANOS</span>
              <span className="block text-[10px] text-accent-400">de tradição</span>
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-accent-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/favoritos"
            aria-label="Meus favoritos"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/8 hover:text-accent-400"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Button
            href={buildWhatsAppLink("Olá! Gostaria de falar com a Auto2000.")}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            size="sm"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/8 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-white/10 bg-black lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/8"
              >
                {link.label}
              </Link>
            ))}
            <Button
              href={buildWhatsAppLink("Olá! Gostaria de falar com a Auto2000.")}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              className="mt-2"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
