import { Hero } from "@/components/home/Hero";
import { QuickCategories } from "@/components/home/QuickCategories";
import { FeaturedVehicles } from "@/components/home/FeaturedVehicles";
import { TrustSection } from "@/components/home/TrustSection";
import { listVehiclesPublic } from "@/lib/server/db";

// Consulta o mock store real a cada requisição — sem isso, o Next tentaria
// pré-renderizar esta página como estática no build (sem acesso à rede do
// Postgres no ambiente de build da Vercel), e o catálogo em destaque ficaria
// congelado com os dados do momento do último deploy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const allFeatured = await listVehiclesPublic({ sort: "recent" });
  const featured = allFeatured.slice(0, 8);

  return (
    <>
      <Hero />
      <QuickCategories />
      <FeaturedVehicles vehicles={featured} />
      <TrustSection />
    </>
  );
}
