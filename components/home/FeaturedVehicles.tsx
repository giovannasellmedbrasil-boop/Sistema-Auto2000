import { SearchX } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleFiltersPanel } from "@/components/vehicles/VehicleFiltersPanel";

export function FeaturedVehicles({
  vehicles,
  brands,
  colors,
}: {
  vehicles: Vehicle[];
  brands: string[];
  colors: string[];
}) {
  return (
    <section className="border-b border-white/8 bg-white/[0.02] py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading title="A escolha certa começa aqui" />

        <VehicleFiltersPanel brands={brands} colors={colors} />

        {vehicles.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum veículo encontrado"
            description="Tente ajustar ou limpar os filtros para ver mais opções do nosso estoque."
            action={<Button href="/">Limpar filtros</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
