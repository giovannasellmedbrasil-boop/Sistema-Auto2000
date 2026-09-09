import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Mesma base de código serve dois links diferentes: o site público (home
// em "/") e este deploy "sistema", cujo link deve abrir direto no painel
// administrativo. Em vez de duplicar o app, a variável de ambiente
// SYSTEM_ONLY_HOME (definida só no projeto Vercel do sistema) faz a home
// redirecionar para /admin — o deploy do site público continua com a home
// normal, sem essa variável definida.
export function proxy(request: NextRequest) {
  if (process.env.SYSTEM_ONLY_HOME === "true" && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}

export const config = {
  matcher: "/",
};
