"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormGroup, Input, Label, Textarea } from "@/components/ui/Field";
import type { LeadOrigin } from "@/lib/types";

type TriggerVariant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp";

export function LeadFormModal({
  triggerLabel,
  triggerIcon,
  triggerVariant = "primary",
  triggerSize = "md",
  triggerClassName,
  title,
  subtitle,
  vehicleId,
  origin,
  defaultMessage,
}: {
  // O botão de disparo é renderizado aqui dentro (Client Component), nunca
  // recebido como elemento pronto de um Server Component — funções (o
  // onClick) e handlers vivos não atravessam essa fronteira de forma confiável.
  triggerLabel: string;
  triggerIcon?: ReactNode;
  triggerVariant?: TriggerVariant;
  triggerSize?: "sm" | "md" | "lg";
  triggerClassName?: string;
  title: string;
  subtitle?: string;
  vehicleId?: string;
  origin: LeadOrigin;
  defaultMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

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
          vehicleId,
          origin,
        }),
      });
      if (!res.ok) throw new Error("Falha ao enviar");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function close() {
    setOpen(false);
    setStatus("idle");
  }

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        {triggerIcon}
        {triggerLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div
            className="absolute inset-0"
            onClick={close}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-white/10 bg-ink-100 p-6 shadow-2xl animate-fade-in-up sm:rounded-2xl sm:p-7">
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-600 hover:bg-ink-50 hover:text-ink-700"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-success-500" />
                <h3 className="text-lg font-semibold text-accent-400">Recebemos seu contato!</h3>
                <p className="text-sm text-ink-500">
                  Um de nossos consultores vai falar com você em breve.
                </p>
                <Button variant="outline" onClick={close} className="mt-2">
                  Fechar
                </Button>
              </div>
            ) : (
              <>
                <h3 className="pr-8 text-lg font-semibold text-accent-400">{title}</h3>
                {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}

                <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                  <FormGroup>
                    <Label htmlFor="lead-name">Nome completo</Label>
                    <Input id="lead-name" name="name" required placeholder="Seu nome" />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="lead-phone">Telefone / WhatsApp</Label>
                    <Input id="lead-phone" name="phone" required placeholder="(11) 90000-0000" />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="lead-email" hint="opcional">E-mail</Label>
                    <Input id="lead-email" name="email" type="email" placeholder="voce@email.com" />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="lead-message" hint="opcional">Mensagem</Label>
                    <Textarea
                      id="lead-message"
                      name="message"
                      defaultValue={defaultMessage}
                      placeholder="Conte um pouco mais sobre o que procura"
                    />
                  </FormGroup>

                  {status === "error" && (
                    <p className="text-sm text-danger-500">
                      Não foi possível enviar agora. Tente novamente em instantes.
                    </p>
                  )}

                  <Button type="submit" disabled={status === "submitting"} className="mt-1">
                    {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enviar
                  </Button>
                  <p className="text-center text-xs text-ink-600">
                    Ao enviar, você concorda em ser contatado por nossa equipe sobre este atendimento.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
