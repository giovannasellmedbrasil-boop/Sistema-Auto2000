import type { Vehicle } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

export function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <section className="border-y border-white/8 bg-white/[0.02] py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Estoque selecionado"
          title="Veículos em destaque"
          subtitle="Uma seleção dos veículos mais recentes e procurados do nosso estoque."
          action={
            <Button href="/estoque" variant="outline">
              Ver estoque completo
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </Container>
    </section>
  );
}
