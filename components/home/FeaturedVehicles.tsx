import { SearchX } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

export function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <section className="border-b border-white/8 bg-white/[0.02] py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading title="A escolha certa começa aqui" />

        {vehicles.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum veículo encontrado"
            description="Não encontramos veículos nessa faixa de preço no momento. Veja todo o nosso estoque."
            action={<Button href="/">Ver todos os veículos</Button>}
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
