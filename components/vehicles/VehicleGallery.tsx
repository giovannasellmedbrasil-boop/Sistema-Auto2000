"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { cn } from "@/lib/utils";

const ANGLES = ["Frente", "Traseira", "Lateral", "Interior"];

export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const [active, setActive] = useState(0);
  const hasRealPhotos = vehicle.photos.some((p) => p.url);
  const count = vehicle.photos.length || ANGLES.length;
  const activePhoto = vehicle.photos[active];

  return (
    <div className="flex flex-col gap-3">
      <VehicleImage
        seed={`${vehicle.id}-${active}`}
        src={activePhoto?.url}
        alt={`${vehicle.brand} ${vehicle.model} — foto ${active + 1}`}
        angle={hasRealPhotos ? undefined : ANGLES[active % ANGLES.length]}
        className="aspect-[4/3] w-full rounded-card sm:aspect-[16/10]"
        priority={active === 0}
        sizes="(min-width: 1024px) 60vw, 100vw"
      />
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "overflow-hidden rounded-xl ring-2 ring-offset-2 transition-all",
              active === i ? "ring-accent-500" : "ring-transparent hover:ring-ink-200"
            )}
          >
            <VehicleImage
              seed={`${vehicle.id}-${i}`}
              src={vehicle.photos[i]?.url}
              alt={`${vehicle.brand} ${vehicle.model} — miniatura ${i + 1}`}
              angle={hasRealPhotos ? undefined : ANGLES[i % ANGLES.length]}
              className="aspect-square w-full"
              sizes="15vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
