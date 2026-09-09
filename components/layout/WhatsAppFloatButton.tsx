"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";

export function WhatsAppFloatButton() {
  return (
    <a
      href={buildWhatsAppLink("Olá! Gostaria de falar com a Auto2000.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-whatsapp/30 transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-6.5 w-6.5" fill="currentColor" strokeWidth={0} />
    </a>
  );
}
