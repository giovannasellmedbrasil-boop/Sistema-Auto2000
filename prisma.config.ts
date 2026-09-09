import { defineConfig, env } from "prisma/config";

// A CLI do Prisma 7 não carrega mais o .env sozinha para o prisma.config.ts
// (era um efeito colateral do antigo `datasource { url = env(...) }` no
// schema). Carregamos aqui explicitamente antes de chamar env().
try {
  process.loadEnvFile(".env");
} catch {
  // .env ausente (ex: ambiente de build sem migração) — segue sem falhar.
}

// Prisma 7 exige que a URL de conexão usada pelo Migrate/introspecção fique
// aqui (não mais em `datasource { url = ... }` no schema.prisma). O
// PrismaClient em tempo de execução (quando existir) continua lendo
// DATABASE_URL via variável de ambiente normalmente.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
