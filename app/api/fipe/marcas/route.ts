import { NextResponse } from "next/server";
import { listFipeBrands } from "@/lib/server/fipe";
import { getAdminSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!checkRateLimit(`fipe:${session.id}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas consultas à FIPE em pouco tempo." }, { status: 429 });
  }

  const result = await listFipeBrands();
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ brands: result.data });
}
