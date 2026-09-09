import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/server/db";
import { VehicleForm } from "@/components/admin/VehicleForm";

export const metadata: Metadata = { title: "Editar veículo", robots: { index: false } };

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">
          Editar {vehicle.brand} {vehicle.model}
        </h1>
        <p className="text-sm text-ink-500">Atualize as informações do veículo.</p>
      </div>
      <div className="max-w-3xl">
        <VehicleForm vehicle={vehicle} />
      </div>
    </div>
  );
}
