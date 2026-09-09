import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { createMarketingCampaign, listMarketingCampaigns } from "@/lib/server/db";

const campaignSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da campanha"),
  channel: z.enum([
    "META_ADS",
    "GOOGLE_ADS",
    "INSTAGRAM",
    "FACEBOOK",
    "WHATSAPP",
    "SITE",
    "WEBMOTORS",
    "ICARROS",
    "OLX",
    "REFERRAL",
    "ORGANIC",
    "RETURNING_CUSTOMER",
    "PHONE_CALL",
    "WALK_IN",
    "OTHER",
  ]),
  platform: z.string().trim().min(1, "Informe a plataforma"),
  cost: z.coerce.number().min(0, "Investimento não pode ser negativo"),
  impressions: z.coerce.number().int().min(0).optional().nullable(),
  clicks: z.coerce.number().int().min(0).optional().nullable(),
  startDate: z.string().trim().min(1, "Informe a data de início"),
  endDate: z.string().trim().optional().nullable(),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({ campaigns: listMarketingCampaigns() });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = createMarketingCampaign(parsed.data);
  return NextResponse.json({ campaign }, { status: 201 });
}
