// Rate limiter simples em memória, por processo (seção 13 — proteção contra
// consultas em massa). Suficiente para este ambiente de demonstração de
// instância única; em produção com múltiplas instâncias, trocar por um
// store compartilhado (ex: Redis).

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
