import path from "node:path";

// Armazenamento local dos arquivos anexados às negociações (mock — ver
// lib/server/db.ts para os metadados). Em hospedagem serverless o
// diretório do projeto é somente leitura, então os arquivos vão para /tmp
// (não persistem entre deploys/instâncias), mesma ressalva do data/db.json.
// Nunca expostos como URL pública — sempre servidos por uma rota
// autenticada (ver app/api/negotiations/[id]/documents/[docId]/file).
export const UPLOADS_DIR = process.env.VERCEL
  ? path.join("/tmp", "auto2000-uploads")
  : path.join(process.cwd(), "data", "uploads");

export function absoluteDocumentPath(storagePath: string): string {
  return path.join(UPLOADS_DIR, storagePath);
}
