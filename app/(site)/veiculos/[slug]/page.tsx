import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Calendar,
  Check,
  DoorOpen,
  Droplets,
  Gauge,
  MessageCircle,
  Palette,
  Settings2,
  Wallet,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VehicleGallery } from "@/components/vehicles/VehicleGallery";
import { FavoriteButton } from "@/components/vehicles/FavoriteButton";
import { LeadFormModal } from "@/components/leads/LeadFormModal";
import { getVehicleBySlug, listVehiclesPublic } from "@/lib/server/db";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import {
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  VEHICLE_STATUS_LABELS,
} from "@/lib/types";
import {
  buildWhatsAppLink,
  formatCurrency,
  formatKm,
  vehicleWhatsAppMessage,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return { title: "Veículo não encontrado" };

  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.modelYear}`;
  const description = `${title} · ${formatKm(vehicle.mileageKm)} · ${TRANSMISSION_LABELS[vehicle.transmission]} · ${formatCurrency(vehicle.price)}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    robots: vehicle.status === "SOLD" ? { index: false, follow: true } : undefined,
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const isSold = vehicle.status === "SOLD";
  const whatsappHref = buildWhatsAppLink(vehicleWhatsAppMessage(vehicle));
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version}`;

  const similar = listVehiclesPublic({ bodyType: vehicle.bodyType })
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: title,
    brand: vehicle.brand,
    model: vehicle.model,
    vehicleModelDate: String(vehicle.modelYear),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileageKm,
      unitCode: "KMT",
    },
    color: vehicle.color,
    vehicleTransmission: TRANSMISSION_LABELS[vehicle.transmission],
    fuelType: FUEL_LABELS[vehicle.fuel],
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "BRL",
      availability: isSold
        ? "https://schema.org/SoldOut"
        : vehicle.status === "RESERVED"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
    },
  };

  const specs = [
    { icon: Calendar, label: "Ano", value: `${vehicle.manufactureYear}/${vehicle.modelYear}` },
    { icon: Gauge, label: "Km", value: formatKm(vehicle.mileageKm) },
    { icon: Zap, label: "Motor", value: vehicle.engine ?? "—" },
    { icon: Settings2, label: "Câmbio", value: TRANSMISSION_LABELS[vehicle.transmission] },
    { icon: Droplets, label: "Combustível", value: FUEL_LABELS[vehicle.fuel] },
    { icon: Palette, label: "Cor", value: vehicle.color },
    { icon: Wallet, label: "Final da placa", value: vehicle.plateEnding ?? "—" },
    { icon: DoorOpen, label: "Portas", value: String(vehicle.doors) },
  ];

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {isSold && (
        <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-sm text-warning-500">
          Este veículo já foi vendido. Confira opções semelhantes disponíveis logo abaixo.
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <VehicleGallery vehicle={vehicle} />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {vehicle.status !== "AVAILABLE" && (
                <Badge tone={isSold ? "neutral" : "warning"}>
                  {VEHICLE_STATUS_LABELS[vehicle.status]}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-accent-400 sm:text-3xl">
              {title} <span className="text-ink-600 font-normal">{vehicle.modelYear}</span>
            </h1>
            <p className="text-3xl font-semibold tracking-tight text-ink-950">
              {formatCurrency(vehicle.price)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-card border border-ink-100 p-4 sm:grid-cols-4">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-600">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </span>
                <span className="text-sm font-medium text-ink-900">{value}</span>
              </div>
            ))}
          </div>

          {!isSold && (
            <div className="flex flex-col gap-3">
              <LeadFormModal
                origin="SITE"
                vehicleId={vehicle.id}
                title="Tenho interesse neste veículo"
                subtitle={title}
                defaultMessage={`Tenho interesse no ${title} ${vehicle.modelYear}.`}
                triggerLabel="Tenho interesse"
                triggerSize="lg"
                triggerClassName="w-full"
              />

              <Button href={`/venda-seu-carro?veiculo=${vehicle.slug}`} variant="outline">
                Usar meu carro na troca
              </Button>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button href={whatsappHref} target="_blank" rel="noopener noreferrer" variant="whatsapp">
                  <MessageCircle className="h-4.5 w-4.5" />
                  Falar pelo WhatsApp
                </Button>
                <LeadFormModal
                  origin="SITE"
                  vehicleId={vehicle.id}
                  title="Agendar visita / test-drive"
                  subtitle={title}
                  defaultMessage={`Gostaria de agendar uma visita/test-drive para o ${title} ${vehicle.modelYear}.`}
                  triggerLabel="Agendar visita / test-drive"
                  triggerVariant="ghost"
                  triggerClassName="border border-ink-200"
                />
              </div>

              <FavoriteButton vehicleId={vehicle.id} variant="inline" className="w-fit" />
            </div>
          )}
        </div>
      </div>

      {vehicle.features.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-accent-400">
            Principais equipamentos
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.features.map((feature) => (
              <span key={feature} className="inline-flex items-center gap-2 text-sm text-ink-700">
                <Check className="h-4 w-4 shrink-0 text-success-500" />
                {feature}
              </span>
            ))}
          </div>
        </section>
      )}

      {vehicle.description && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-accent-400">Sobre este veículo</h2>
          <p className="max-w-3xl text-base leading-relaxed text-ink-600">{vehicle.description}</p>
        </section>
      )}

      {similar.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold tracking-tight text-accent-400">
            Veículos semelhantes
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
