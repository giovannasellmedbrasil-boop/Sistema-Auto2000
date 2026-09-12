"use client";

import { useEffect } from "react";

// Só é montado no layout do site público (nunca no admin) — cada
// carregamento de página real do visitante dispara um POST silencioso que
// registra a visita (ver app/api/track-visit/route.ts). Roda apenas no
// navegador, então não conta bots/crawlers que não executam JavaScript.
export function VisitTracker() {
  useEffect(() => {
    fetch("/api/track-visit", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
