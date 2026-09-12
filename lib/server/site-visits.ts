// Contagem real de visitantes do site público (ver prisma/schema.prisma —
// modelo SiteVisit). Nunca fabricado: cada linha é uma visita de verdade,
// registrada pelo componente cliente components/site/VisitTracker.tsx.

import { prisma } from "@/lib/server/prisma";

export async function registerSiteVisit(visitorId: string): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  await prisma.siteVisit.upsert({
    where: { visitorId_date: { visitorId, date } },
    create: { visitorId, date },
    update: {},
  });
}

// Número de pessoas distintas (por cookie anônimo) que visitaram o site
// dentro do período — cada uma conta uma única vez, mesmo tendo voltado
// em dias diferentes dentro do período.
export async function countUniqueVisitors(from: Date, to: Date): Promise<number> {
  const rows = await prisma.siteVisit.groupBy({
    by: ["visitorId"],
    where: { createdAt: { gte: from, lte: to } },
  });
  return rows.length;
}
