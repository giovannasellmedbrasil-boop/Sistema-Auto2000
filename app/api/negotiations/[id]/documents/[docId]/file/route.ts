import { NextResponse } from "next/server";
import fs from "node:fs";
import { appendAuditLog, getNegotiationById, getNegotiationDocumentById } from "@/lib/server/db";
import { getAdminSession } from "@/lib/server/auth";
import { absoluteDocumentPath } from "@/lib/server/documentStorage";

// Único ponto de leitura de um documento pessoal — nunca uma URL pública
// (seção 22 do briefing). Exige sessão de admin válida e registra o acesso.
export async function GET(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, docId } = await params;
  const negotiation = getNegotiationById(id);
  if (!negotiation) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  if (session.role === "SALES" && negotiation.sellerId !== session.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const document = getNegotiationDocumentById(docId);
  if (!document || document.negotiationId !== id) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  const absolutePath = absoluteDocumentPath(document.storagePath);
  if (!fs.existsSync(absolutePath)) {
    return NextResponse.json({ error: "Arquivo não encontrado no armazenamento" }, { status: 404 });
  }

  appendAuditLog({
    type: "DOCUMENT_ACCESS",
    userEmail: session.email,
    detail: `${session.name} visualizou "${document.fileName}" (venda ${negotiation.code})`,
  });

  const buffer = fs.readFileSync(absolutePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `inline; filename="${document.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
