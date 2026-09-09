import { cn } from "@/lib/utils";

// Avatar-placeholder determinístico (iniciais sobre gradiente) — nunca uma
// foto real. Mesmo princípio de honestidade usado em VehicleImage.tsx para
// os veículos: quando não há uma foto real disponível, mostramos algo
// claramente ilustrativo em vez de simular uma fotografia.

const GRADIENTS = [
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-pink-600",
  "from-violet-500 to-indigo-600",
  "from-rose-500 to-red-600",
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export function Avatar({
  name,
  seed,
  size = "md",
  className,
}: {
  name: string;
  seed?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const gradient = GRADIENTS[hashSeed(seed ?? name) % GRADIENTS.length];
  const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg" }[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
        gradient,
        sizeClasses,
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
