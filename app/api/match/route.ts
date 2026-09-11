import { NextResponse } from "next/server";
import { z } from "zod";
import { listVehiclesPublic } from "@/lib/server/db";
import { parseQuery, matchVehicles } from "@/lib/matching";

const schema = z.object({ text: z.string().trim().min(3).max(500) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Descreva o que você procura em ao menos 3 caracteres." }, { status: 400 });
  }

  const query = parseQuery(parsed.data.text);
  const vehicles = await listVehiclesPublic();
  const matches = matchVehicles(vehicles, query).slice(0, 6);

  return NextResponse.json({ query, matches });
}
