"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormGroup, Input, Label, Textarea } from "@/components/ui/Field";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email") || undefined,
          message: form.get("message") || undefined,
          origin: "SITE",
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-white/8 bg-ink-100 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-success-500" />
        <h2 className="text-lg font-semibold text-accent-400">Mensagem enviada!</h2>
        <p className="text-sm text-ink-500">Retornaremos o quanto antes.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-white/8 bg-ink-100 p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormGroup>
          <Label htmlFor="contact-name">Nome completo</Label>
          <Input id="contact-name" name="name" required placeholder="Seu nome" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="contact-phone">Telefone / WhatsApp</Label>
          <Input id="contact-phone" name="phone" required placeholder="(11) 90000-0000" />
        </FormGroup>
      </div>
      <FormGroup>
        <Label htmlFor="contact-email" hint="opcional">E-mail</Label>
        <Input id="contact-email" name="email" type="email" placeholder="voce@email.com" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="contact-message">Mensagem</Label>
        <Textarea id="contact-message" name="message" required placeholder="Como podemos ajudar?" />
      </FormGroup>
      {status === "error" && (
        <p className="text-sm text-danger-500">Não foi possível enviar agora. Tente novamente.</p>
      )}
      <Button type="submit" disabled={status === "submitting"} className="w-fit">
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar mensagem
      </Button>
    </form>
  );
}
