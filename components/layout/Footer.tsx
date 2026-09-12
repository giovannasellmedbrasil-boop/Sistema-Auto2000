import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Auto+2000+Ve%C3%ADculos/@-23.6022028,-46.5239818,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce5d672c2ed5a1:0x1b750281f91d1451!8m2!3d-23.6022077!4d-46.5214069!16s%2Fg%2F11c54g7zmk?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white/60">
      <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm leading-relaxed text-white">
            Desde 1982, uma loja de família construída com tradição, confiança e
            compromisso em sede própria.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-white">
            <div className="flex items-start gap-3">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir localização da Auto2000 no Google Maps"
                className="group relative block h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-white/8"
              >
                <iframe
                  src="https://maps.google.com/maps?q=-23.6022077,-46.5214069&z=15&output=embed"
                  title="Mapa de localização da Auto2000"
                  className="h-full w-full pointer-events-none grayscale-[30%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
              </a>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-400"
              >
                <MapPin className="mb-0.5 inline h-4 w-4 shrink-0 text-accent-400" />{" "}
                Av. Professor Luiz Ignácio Anhaia Mello, 8201 - Parque São Lourenço, São Paulo - SP, 03155-000
              </a>
            </div>
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
