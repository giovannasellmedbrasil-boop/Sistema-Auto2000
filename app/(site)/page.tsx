import { Hero } from "@/components/home/Hero";
import { FeaturedVehicles } from "@/components/home/FeaturedVehicles";
import { TrustSection } from "@/components/home/TrustSection";
import { listVehiclesPublic } from "@/lib/server/db";
import type { BodyType, FuelType, Transmission, VehicleFilters } from "@/lib/types";

// Consulta o mock store real a cada requisição — sem isso, o Next tentaria
// pré-renderizar esta página como estática no build (sem acesso à rede do
// Postgres no ambiente de build da Vercel), e o catálogo ficaria congelado
// com os dados do momento do último deploy.
export const dynamic = "force-dynamic";

function toNumber(value?: string) {
  const n = Number(value);
  return value && !Number.isNaN(n) ? n : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const filters: VehicleFilters = {
    q: sp.q,
    brand: sp.brand,
    bodyType: sp.bodyType as BodyType | undefined,
    priceMin: toNumber(sp.priceMin),
    priceMax: toNumber(sp.priceMax),
    yearMin: toNumber(sp.yearMin),
    yearMax: toNumber(sp.yearMax),
    mileageMax: toNumber(sp.mileageMax),
    transmission: sp.transmission as Transmission | undefined,
    fuel: sp.fuel as FuelType | undefined,
    color: sp.color,
    sort: (sp.sort as VehicleFilters["sort"]) ?? "recent",
  };

  const vehicles = await listVehiclesPublic(filters);

  return (
    <>
      <Hero />
      <FeaturedVehicles vehicles={vehicles} />
      <TrustSection />
    </>
  );
}
