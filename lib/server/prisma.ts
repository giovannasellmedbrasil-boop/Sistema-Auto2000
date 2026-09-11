import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton padrão para Next.js — evita criar uma nova conexão a cada
// hot-reload em desenvolvimento (que esgotaria o pool de conexões do
// Postgres rapidinho).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma 7 exige um driver adapter explícito em vez de ler DATABASE_URL
// sozinho (ver prisma.config.ts para a mesma mudança do lado do Migrate).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
