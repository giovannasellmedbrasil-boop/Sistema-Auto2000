import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/server/auth";
import { createLeadManual, getVehicleById, getSalespersonById } from "@/lib/server/db";
import { getDrilldownLeads, parseDashboardFilters, type DrillMetric } from "@/lib/server/dashboard";
import { LEAD_CHANNEL_LABELS, LEAD_STATUS_LABELS } from "@/lib/types";

const leadManualSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do lead"),
  phone: z.string().trim().min(8, "Informe um telefone válido"),
  email: z.string().trim().email().optional().or(z.literal("")),
  vehicleId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  campaignId: z.string().optional().nullable(),
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
  message: z.string().trim().optional(),
});

const VALID_METRICS: DrillMetric[] = ["leads", "contacted", "visits", "testDrives", "proposals", "sold", "pending"];

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const metricParam = searchParams.get("metric");
  const metric: DrillMetric = VALID_METRICS.includes(metricParam as DrillMetric) ? (metricParam as DrillMetric) : "leads";
  const filters = parseDashboardFilters(searchParams);

  const leads = getDrilldownLeads(filters, metric).map((lead) => {
    const vehicle = lead.vehicleId ? getVehicleById(lead.vehicleId) : undefined;
    const owner = lead.ownerId ? getSalespersonById(lead.ownerId) : undefined;
    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email ?? null,
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.version}` : null,
      owner: owner?.name ?? null,
      channel: lead.channel ? LEAD_CHANNEL_LABELS[lead.channel] : null,
      status: lead.status ? LEAD_STATUS_LABELS[lead.status] : null,
      createdAt: lead.createdAt,
    };
  });

  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = leadManualSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { email, ...rest } = parsed.data;
  const lead = createLeadManual({ ...rest, email: email || null });
  return NextResponse.json({ lead }, { status: 201 });
}
