import { NextResponse } from "next/server";
import { listFipeYears } from "@/lib/server/fipe";
import { getAdminSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandCode: string; modelCode: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!checkRateLimit(`fipe:${session.id}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas consultas à FIPE em pouco tempo." }, { status: 429 });
  }

  const { brandCode, modelCode } = await params;
  const result = await listFipeYears(brandCode, modelCode);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ years: result.data });
}
