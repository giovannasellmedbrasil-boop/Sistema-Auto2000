import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/auth";
import { getNegotiationById, listSalespeople, listVehiclesAdmin } from "@/lib/server/db";
import { NewNegotiationForm } from "@/components/documentacao/NewNegotiationForm";

export const metadata: Metadata = { title: "Editar venda", robots: { index: false } };

export default async function EditarVendaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return null;

  const { id } = await params;
  const negotiation = await getNegotiationById(id);
  if (!negotiation) notFound();
  if (session.role === "SALES" && negotiation.sellerId !== session.id) redirect("/admin/documentacao");

  const [allVehicles, allSellers] = await Promise.all([listVehiclesAdmin(), listSalespeople()]);
  // O veículo já vinculado à venda continua na lista mesmo se, por algum
  // outro motivo, tiver sido marcado como vendido — senão o formulário não
  // teria como manter a seleção atual.
  const vehicles = allVehicles.filter((v) => v.status !== "SOLD" || v.id === negotiation.vehicleId);
  const sellers = allSellers
    .filter((s) => s.active || s.id === negotiation.sellerId)
    .map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Editar venda {negotiation.code}</h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Altere os dados da negociação — o checklist de documentos já gerado não muda ao salvar.
        </p>
      </div>
      <div className="max-w-3xl">
        <NewNegotiationForm vehicles={vehicles} sellers={sellers} negotiation={negotiation} />
      </div>
    </div>
  );
}
