import { NextResponse } from "next/server";
import fs from "node:fs";
import { deleteNegotiationDocument, getNegotiationById, getNegotiationDocumentById } from "@/lib/server/db";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { absoluteDocumentPath } from "@/lib/server/documentStorage";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Apenas gerência pode excluir documentos." }, { status: 403 });
  }

  const { id, docId } = await params;
  const negotiation = getNegotiationById(id);
  if (!negotiation) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });

  const document = getNegotiationDocumentById(docId);
  if (!document || document.negotiationId !== id) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  // Exclusão segura (seção 22): remove o arquivo do disco antes do registro,
  // nunca deixando um documento pessoal órfão acessível.
  const absolutePath = absoluteDocumentPath(document.storagePath);
  fs.rmSync(absolutePath, { force: true });

  deleteNegotiationDocument(docId, session.name);
  return NextResponse.json({ ok: true });
}
