import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, createSessionToken, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from "@/lib/server/auth";
import { appendAuditLog } from "@/lib/server/db";
import { checkRateLimit } from "@/lib/server/rateLimit";

const schema = z.object({
  email: z.string().trim().min(3),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`login:${ip}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }

  const user = authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    await appendAuditLog({ type: "LOGIN_FAILED", userEmail: parsed.data.email, detail: "Tentativa de login com credenciais inválidas." });
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  await appendAuditLog({ type: "LOGIN", userEmail: user.email, detail: `Login realizado (${user.role}).` });

  const token = createSessionToken(user);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
