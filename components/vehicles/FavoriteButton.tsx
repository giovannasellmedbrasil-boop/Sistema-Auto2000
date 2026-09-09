"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  vehicleId,
  className,
  variant = "floating",
}: {
  vehicleId: string;
  className?: string;
  variant?: "floating" | "inline";
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(vehicleId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Favoritar veículo"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(vehicleId);
      }}
      className={cn(
        "inline-flex items-center justify-center transition-colors",
        variant === "floating" &&
          "h-9 w-9 rounded-full bg-black/60 backdrop-blur-sm shadow-sm hover:bg-black/80",
        variant === "inline" && "gap-2 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-medium hover:border-ink-400",
        className
      )}
    >
      <Heart
        className={cn("h-4.5 w-4.5", active ? "fill-danger-500 text-danger-500" : "text-white/70")}
      />
      {variant === "inline" && <span>{active ? "Favoritado" : "Favoritar"}</span>}
    </button>
  );
}
