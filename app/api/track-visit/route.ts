import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { registerSiteVisit } from "@/lib/server/site-visits";

const COOKIE_NAME = "a2000_vid";

// Chamado pelo VisitTracker (client component) uma vez por carregamento de
// página do site público. Usa um cookie anônimo (só um ID aleatório, sem
// dado pessoal) para não contar a mesma pessoa duas vezes no mesmo dia.
export async function POST(request: NextRequest) {
  const existing = request.cookies.get(COOKIE_NAME)?.value;
  const visitorId = existing ?? randomUUID();

  await registerSiteVisit(visitorId);

  const response = NextResponse.json({ ok: true });
  if (!existing) {
    response.cookies.set(COOKIE_NAME, visitorId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }
  return response;
}
