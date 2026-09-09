import Image from "next/image";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

// Quando o veículo tem uma foto real (upload manual ou importada do
// Mercado Livre — ver lib/server/seed-mercadolivre.ts), ela é exibida via
// `src`. Só recorremos à ilustração de fundo abaixo quando NÃO há foto
// real, para deixar claro que aquilo é um placeholder e nunca fingir uma
// fotografia que não existe.

const GRADIENTS = [
  "from-ink-200 via-ink-100 to-accent-900",
  "from-accent-950 via-ink-200 to-ink-50",
  "from-ink-100 via-accent-950 to-ink-200",
  "from-ink-200 via-ink-100 to-accent-800",
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function VehicleImage({
  seed,
  src,
  alt,
  label,
  angle,
  className,
  priority,
  sizes,
}: {
  seed: string;
  src?: string | null;
  alt?: string;
  label?: string;
  angle?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-ink-100", className)}>
        <Image
          src={src}
          alt={alt || label || "Foto do veículo"}
          fill
          className="object-cover"
          sizes={sizes ?? "(min-width: 1024px) 25vw, 100vw"}
          priority={priority}
        />
        {label && (
          <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/80 backdrop-blur-sm">
            {label}
          </span>
        )}
        {angle && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
            {angle}
          </span>
        )}
      </div>
    );
  }

  const gradient = GRADIENTS[hashSeed(seed) % GRADIENTS.length];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className
      )}
    >
      <Car
        className="absolute -bottom-4 -right-4 h-2/3 w-2/3 text-white/10"
        strokeWidth={1}
      />
      <Car className="h-10 w-10 text-white/90" strokeWidth={1.25} />
      {label && (
        <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/80 backdrop-blur-sm">
          {label}
        </span>
      )}
      {angle && (
        <span className="absolute bottom-3 right-3 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
          {angle}
        </span>
      )}
    </div>
  );
}
