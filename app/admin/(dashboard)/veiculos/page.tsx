import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { listVehiclesAdmin } from "@/lib/server/db";
import { Button } from "@/components/ui/Button";
import { VehicleTable } from "@/components/admin/VehicleTable";

export const metadata: Metadata = { title: "Veículos", robots: { index: false } };

export default async function AdminVehiclesPage() {
  const vehicles = await listVehiclesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Veículos</h1>
          <p className="text-sm text-ink-500">{vehicles.length} veículo(s) cadastrado(s).</p>
        </div>
        <Button href="/admin/veiculos/novo">
          <Plus className="h-4 w-4" />
          Novo veículo
        </Button>
      </div>
      <VehicleTable vehicles={vehicles} />
    </div>
  );
}
