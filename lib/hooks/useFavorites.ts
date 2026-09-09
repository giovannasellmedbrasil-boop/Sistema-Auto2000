"use client";

import { useCallback, useSyncExternalStore } from "react";

// Favoritos de visitante anônimo (sessionId implícito = este navegador),
// persistidos em localStorage — espelha o campo `sessionId` do model
// Favorite em prisma/schema.prisma. Quando houver login de cliente, o
// merge desses favoritos para o customerId correspondente fica a cargo
// da API (não implementada nesta fase).

const STORAGE_KEY = "auto2000:favorites";
const EVENT_NAME = "auto2000:favorites-changed";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot() {
  return "[]";
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ids: string[] = (() => {
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  })();

  const isFavorite = useCallback((vehicleId: string) => ids.includes(vehicleId), [ids]);

  const toggleFavorite = useCallback((vehicleId: string) => {
    const current = readFavorites();
    const next = current.includes(vehicleId)
      ? current.filter((id) => id !== vehicleId)
      : [...current, vehicleId];
    writeFavorites(next);
  }, []);

  return { favoriteIds: ids, isFavorite, toggleFavorite };
}
