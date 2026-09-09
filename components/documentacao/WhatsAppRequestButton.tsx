"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/utils";

export function WhatsAppRequestButton({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (ex: contexto não seguro) — sem tratamento adicional
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button href={buildWhatsAppLink(message)} target="_blank" variant="whatsapp" size="sm">
        <MessageCircle className="h-4 w-4" />
        Solicitar documento pelo WhatsApp
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copiado" : "Copiar mensagem"}
      </Button>
    </div>
  );
}
