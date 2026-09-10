import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleFiltersPanel } from "@/components/estoque/VehicleFiltersPanel";
import { listVehiclesPublic, listBrands } from "@/lib/server/db";
import type { BodyType, FuelType, Transmission, VehicleFilters } from "@/lib/types";

export const metadata: Metadata = {
  title: "Nossos veículos",
  description: "Explore o estoque completo de veículos seminovos da Auto2000 com filtros por marca, preço, ano e mais.",
};

function toNumber(value?: string) {
  const n = Number(value);
  return value && !Number.isNaN(n) ? n : undefined;
}

export default async function EstoquePage({
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

  // Um carro marcado como vendido no estoque sai da vitrine automaticamente
  // na próxima renderização — listVehiclesPublic() já exclui SOLD por
  // padrão quando includeSold não é passado.
  const vehicles = listVehiclesPublic(filters);
  const brands = listBrands();
  const colors = Array.from(new Set(listVehiclesPublic().map((v) => v.color))).sort();

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-accent-400 sm:text-4xl">
          Nossos veículos
        </h1>
        <p className="text-ink-500">
          {vehicles.length === 0
            ? "Nenhum veículo encontrado com esses filtros."
            : `Encontramos ${vehicles.length} ${vehicles.length === 1 ? "veículo" : "veículos"}`}
        </p>
      </div>

      <VehicleFiltersPanel brands={brands} colors={colors} />

      {vehicles.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhum veículo encontrado"
          description="Tente ajustar ou limpar os filtros para ver mais opções do nosso estoque."
          action={<Button href="/estoque">Limpar filtros</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </Container>
  );
}
