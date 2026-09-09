import type { Metadata } from "next";
import { VehicleForm } from "@/components/admin/VehicleForm";

export const metadata: Metadata = { title: "Novo veículo", robots: { index: false } };

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Novo veículo</h1>
        <p className="text-sm text-ink-500">Cadastre um veículo para o estoque.</p>
      </div>
      <div className="max-w-3xl">
        <VehicleForm />
      </div>
    </div>
  );
}
