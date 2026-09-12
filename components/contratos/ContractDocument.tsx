import type { ContractType } from "@/lib/contracts/config";
import { ConsignacaoTemplate } from "@/components/contratos/templates/ConsignacaoTemplate";
import { VendaTrocaTemplate } from "@/components/contratos/templates/VendaTrocaTemplate";
import { ReciboCompraTemplate } from "@/components/contratos/templates/ReciboCompraTemplate";

export function ContractDocument({ type, fields }: { type: ContractType; fields: Record<string, string> }) {
  if (type === "CONSIGNACAO") return <ConsignacaoTemplate fields={fields} />;
  if (type === "VENDA_TROCA") return <VendaTrocaTemplate fields={fields} />;
  return <ReciboCompraTemplate fields={fields} />;
}
