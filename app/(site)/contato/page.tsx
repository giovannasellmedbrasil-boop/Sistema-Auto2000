import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/leads/ContactForm";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a equipe da Auto2000 por telefone, e-mail, WhatsApp ou formulário.",
};

export default function ContatoPage() {
  return (
    <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-accent-400 sm:text-4xl">
            Fale com a gente
          </h1>
          <p className="text-ink-500">Nossa equipe responde rapidamente em todos os canais.</p>
        </div>
        <div className="flex flex-col gap-4 text-sm text-ink-600">
          <span className="inline-flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-600" />
            Av. Professor Luiz Ignácio Anhaia Mello, 8201 - Parque São Lourenço, São Paulo - SP, 03155-000
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-ink-600" /> (11) 94729-4679
          </span>
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-ink-600" /> auto2000veiculos@uol.com.br
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-ink-600" /> Seg a sex, 9h às 18h · Sáb, 9h às 15h
          </span>
        </div>
      </div>
      <ContactForm />
    </Container>
  );
}
