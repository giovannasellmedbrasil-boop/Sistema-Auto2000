import Link from "next/link";
import { Gauge, Fuel, Settings2 } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/types";
import { formatCurrency, formatKm, daysInStock } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { FavoriteButton } from "@/components/vehicles/FavoriteButton";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const isSold = vehicle.status === "SOLD";
  const isNew = daysInStock(vehicle.enteredStockAt) <= 7;
  const isLowMileage = vehicle.mileageKm < 20000;
  const cover = vehicle.photos.find((p) => p.isCover) ?? vehicle.photos[0];

  return (
    <Card className="group overflow-hidden hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300">
      <Link href={`/veiculos/${vehicle.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full">
          <VehicleImage
            seed={vehicle.id}
            src={cover?.url}
            label={!cover?.url ? `${vehicle.brand} ${vehicle.model}` : undefined}
            className={`h-full w-full ${isSold ? "grayscale" : ""}`}
          />
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-ink-950 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-black">
                Vendido
              </span>
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {vehicle.status === "RESERVED" && <Badge tone="warning">Reservado</Badge>}
            {isNew && vehicle.status === "AVAILABLE" && <Badge tone="accent">Recém-chegado</Badge>}
            {isLowMileage && vehicle.status === "AVAILABLE" && !isNew && (
              <Badge tone="ink">Baixa km</Badge>
            )}
          </div>
          {!isSold && <FavoriteButton vehicleId={vehicle.id} className="absolute right-3 top-3" />}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div>
            <h3 className="text-base font-semibold text-accent-400 leading-tight">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-ink-500">{vehicle.version}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
            <span>{vehicle.manufactureYear}/{vehicle.modelYear}</span>
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" /> {formatKm(vehicle.mileageKm)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Settings2 className="h-3.5 w-3.5" /> {TRANSMISSION_LABELS[vehicle.transmission]}
            </span>
            <span className="inline-flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" /> {FUEL_LABELS[vehicle.fuel]}
            </span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <span className={`text-xl font-semibold tracking-tight ${isSold ? "text-ink-500 line-through" : "text-white"}`}>
              {formatCurrency(vehicle.price)}
            </span>
            <span className="text-sm font-medium text-accent-700 group-hover:text-accent-800">
              {isSold ? "Ver detalhes →" : "Ver veículo →"}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
