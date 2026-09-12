import Image from "next/image";

// Marca d'água do logo — apenas textura de fundo, nunca sobre o conteúdo.
// Mesmo tratamento visual usado no Hero da página inicial.
export function LogoWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-[-6%] top-[58%] hidden h-[70%] w-[42%] -translate-y-1/2 sm:right-[-4%] sm:block sm:h-[85%] sm:w-[40%] lg:right-[-2%] lg:h-[95%] lg:w-[44%]"
      style={{
        opacity: 0.08,
        filter: "blur(3px)",
        WebkitMaskImage:
          "radial-gradient(ellipse 62% 72% at 62% 50%, black 25%, transparent 85%)",
        maskImage:
          "radial-gradient(ellipse 62% 72% at 62% 50%, black 25%, transparent 85%)",
      }}
    >
      <Image src="/logo.png" alt="" fill priority={false} className="object-contain" sizes="45vw" />
    </div>
  );
}
