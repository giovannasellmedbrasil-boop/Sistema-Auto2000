"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormGroup, Input, Label } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <Image
        src="/logo.png"
        alt="Auto2000 Veículos"
        width={896}
        height={444}
        className="mb-6 h-10 w-auto rounded-md"
      />
      <h1 className="text-xl font-semibold text-accent-400">Acesso restrito</h1>
      <p className="mt-1 text-sm text-ink-500">Painel administrativo Auto2000</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <FormGroup>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required defaultValue="admin@auto2000.com.br" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required defaultValue="auto2000admin" />
        </FormGroup>

        {status === "error" && (
          <p className="text-sm text-danger-500">E-mail ou senha inválidos.</p>
        )}

        <Button type="submit" disabled={status === "submitting"} className="mt-2">
          {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar
        </Button>
        <p className="text-center text-xs text-ink-600">
          Ambiente de demonstração — credenciais já preenchidas.
        </p>
      </form>
    </Card>
  );
}
