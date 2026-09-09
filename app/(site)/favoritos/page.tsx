"use client";

import { useEffect, useState } from "react";
import { HeartOff, Loader2 } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

export default function FavoritosPage() {
  const { favoriteIds } = useFavorites();
  const [fetched, setFetched] = useState<Vehicle[] | null>(null);

  const hasFavorites = favoriteIds.length > 0;

  useEffect(() => {
    if (!hasFavorites) return;
    let cancelled = false;
    fetch(`/api/vehicles?ids=${favoriteIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setFetched(data.vehicles ?? []);
      })
      .catch(() => {
        if (!cancelled) setFetched([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteIds.join(",")]);

  const vehicles = hasFavorites ? fetched : [];
  const loading = hasFavorites && fetched === null;

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-accent-400 sm:text-4xl">
          Meus favoritos
        </h1>
        <p className="text-ink-500">Veículos que você salvou para comparar depois.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : !vehicles || vehicles.length === 0 ? (
        <EmptyState
          icon={HeartOff}
          title="Nenhum favorito ainda"
          description="Toque no coração em qualquer veículo para salvá-lo aqui."
          action={<Button href="/estoque">Ver estoque</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </Container>
  );
}
