import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { addNegotiationDocument, getNegotiationById, isAcceptedDocumentFile } from "@/lib/server/db";
import { getAdminSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { UPLOADS_DIR } from "@/lib/server/documentStorage";

const CATEGORIES = ["CLIENTE", "VEICULO_ENTRADA", "VEICULO_VENDIDO", "FINANCIAMENTO", "TRANSFERENCIA", "ENTREGA"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (!checkRateLimit(`doc-upload:${session.id}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitos envios em pouco tempo. Aguarde e tente novamente." }, { status: 429 });
  }

  const { id } = await params;
  const negotiation = getNegotiationById(id);
  if (!negotiation) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  if (session.role === "SALES" && negotiation.sellerId !== session.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const file = formData.get("file");
  const category = formData.get("category");
  const itemKey = formData.get("itemKey");

  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  if (typeof category !== "string" || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  }

  const validation = isAcceptedDocumentFile(file.type, file.size);
  if (!validation.ok) return NextResponse.json({ error: validation.reason }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  const negotiationDir = path.join(UPLOADS_DIR, id);
  fs.mkdirSync(negotiationDir, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedFileName = `${Date.now()}_${sha256.slice(0, 8)}_${safeName}`;
  const absolutePath = path.join(negotiationDir, storedFileName);
  fs.writeFileSync(absolutePath, buffer);

  const { document, duplicate } = addNegotiationDocument({
    negotiationId: id,
    category: category as (typeof CATEGORIES)[number],
    itemKey: typeof itemKey === "string" && itemKey ? itemKey : null,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    storagePath: path.join(id, storedFileName),
    sha256,
    uploadedBy: session.name,
  });

  return NextResponse.json({ document, duplicate }, { status: 201 });
}
