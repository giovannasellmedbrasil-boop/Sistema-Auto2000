import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, hasRole } from "@/lib/server/auth";
import { deleteMarketingCampaign, updateMarketingCampaign } from "@/lib/server/db";

const campaignPatchSchema = z.object({
  name: z.string().trim().min(2).optional(),
  channel: z
    .enum([
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
    ])
    .optional(),
  platform: z.string().trim().min(1).optional(),
  cost: z.coerce.number().min(0).optional(),
  impressions: z.coerce.number().int().min(0).optional().nullable(),
  clicks: z.coerce.number().int().min(0).optional().nullable(),
  startDate: z.string().trim().min(1).optional(),
  endDate: z.string().trim().optional().nullable(),
  active: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = campaignPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = updateMarketingCampaign(id, parsed.data);
  if (!campaign) return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
  return NextResponse.json({ campaign });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasRole(session.role, ["MANAGER", "ADMIN"])) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const ok = deleteMarketingCampaign(id);
  if (!ok) return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
