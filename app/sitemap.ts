import type { MetadataRoute } from "next";
import { listVehiclesPublic } from "@/lib/server/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.auto2000.com.br";

// Evita a pré-renderização estática no build (sem acesso à rede do Postgres
// no ambiente de build da Vercel) — mesmo motivo de app/(site)/page.tsx.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/estoque",
    "/encontre-seu-carro",
    "/venda-seu-carro",
    "/sobre",
    "/contato",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  // Veículos vendidos ficam de fora do sitemap (seção 29) para não indexar
  // páginas que deixaram de representar um produto disponível.
  const vehicleRoutes = (await listVehiclesPublic()).map((v) => ({
    url: `${SITE_URL}/veiculos/${v.slug}`,
    lastModified: v.updatedAt,
  }));

  return [...staticRoutes, ...vehicleRoutes];
}
