import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Auto+2000+Ve%C3%ADculos/@-23.6022028,-46.5239818,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce5d672c2ed5a1:0x1b750281f91d1451!8m2!3d-23.6022077!4d-46.5214069!16s%2Fg%2F11c54g7zmk?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white/60">
      <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
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
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white">
            Desde 1982, uma loja de família construída com tradição, confiança e
            compromisso em sede própria.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-white">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-2 hover:text-accent-400"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
              Av. Professor Luiz Ignácio Anhaia Mello, 8201 - Parque São Lourenço, São Paulo - SP, 03155-000
            </a>
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

        <video
          src="/auto2000.mp4"
          controls
          playsInline
          preload="metadata"
          className="w-full rounded-card border border-white/8 shadow-[var(--shadow-card)]"
        />
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="text-xs text-white/35">
          <span>© {new Date().getFullYear()} Auto2000. Todos os direitos reservados.</span>
        </Container>
      </div>
    </footer>
  );
}
