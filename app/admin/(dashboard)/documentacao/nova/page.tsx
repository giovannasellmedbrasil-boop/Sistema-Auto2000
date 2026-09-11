import type { Metadata } from "next";
import { listSalespeople, listVehiclesAdmin } from "@/lib/server/db";
import { NewNegotiationForm } from "@/components/documentacao/NewNegotiationForm";

export const metadata: Metadata = { title: "Nova venda — Documentação", robots: { index: false } };

export default async function NovaVendaDocumentacaoPage() {
  const [allVehicles, allSellers] = await Promise.all([listVehiclesAdmin(), listSalespeople()]);
  const vehicles = allVehicles.filter((v) => v.status !== "SOLD");
  const sellers = allSellers
    .filter((s) => s.active)
    .map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-accent-400">Nova venda</h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Cadastre os dados da negociação — o checklist de documentos é gerado automaticamente de
          acordo com o tipo de cliente, forma de pagamento, entrada de usado e necessidade de
          transferência.
        </p>
      </div>
      <div className="max-w-3xl">
        <NewNegotiationForm vehicles={vehicles} sellers={sellers} />
      </div>
    </div>
  );
}
