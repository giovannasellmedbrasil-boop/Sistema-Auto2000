import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { getVehicleById, getSalespersonById } from "@/lib/server/db";
import { getDrilldownSales, parseDashboardFilters } from "@/lib/server/dashboard";
import { LEAD_CHANNEL_LABELS } from "@/lib/types";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filters = parseDashboardFilters(searchParams);

  const sales = getDrilldownSales(filters).map((sale) => {
    const vehicle = getVehicleById(sale.vehicleId);
    const owner = getSalespersonById(sale.ownerId);
    return {
      id: sale.id,
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.version}` : sale.vehicleId,
      owner: owner?.name ?? sale.ownerId,
      channel: LEAD_CHANNEL_LABELS[sale.channel],
      finalPrice: sale.finalPrice,
      paymentMethod: sale.paymentMethod,
      soldAt: sale.soldAt,
    };
  });

  return NextResponse.json({ sales });
}
