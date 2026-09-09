import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // CDN de fotos dos anúncios importados do Mercado Livre (ver
    // lib/server/seed-mercadolivre.ts) — as fotos ficam hospedadas lá, não
    // são baixadas/re-hospedadas pelo site.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.mlstatic.com",
      },
    ],
  },
};

export default nextConfig;
