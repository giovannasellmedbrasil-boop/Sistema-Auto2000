// Configuração dos 3 modelos de contrato da loja (fornecidos como PDF em
// 2026-09-13). Cada campo aqui vira um input no formulário de geração
// (dirigido por essa mesma lista) e é injetado no texto fixo do contrato em
// components/contratos/templates/*.tsx — o texto legal em si nunca muda,
// só os dados variáveis de cada negociação.

export type ContractType = "CONSIGNACAO" | "VENDA_TROCA" | "RECIBO_COMPRA";

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CONSIGNACAO: "Consignação de Veículo",
  VENDA_TROCA: "Venda e Troca",
  RECIBO_COMPRA: "Recibo de Compra",
};

export interface ContractFieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "money" | "date" | "time" | "textarea" | "checkbox";
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export const CONTRACT_FIELDS: Record<ContractType, ContractFieldConfig[]> = {
  CONSIGNACAO: [
    { key: "consignanteName", label: "Nome do proprietário (consignante)", type: "text", required: true },
    { key: "consignanteCpf", label: "CPF", type: "text", required: true },
    { key: "consignanteAddress", label: "Endereço completo", type: "text", required: true },
    { key: "consignantePhone", label: "Telefone", type: "text", required: true },
    { key: "vehicleBrandModel", label: "Marca/Modelo", type: "text", required: true, placeholder: "Ex: CHEV/Spin 1.8L AT LTZ5" },
    { key: "vehicleYear", label: "Ano/Modelo", type: "text", required: true, placeholder: "Ex: 2023/2024" },
    { key: "vehicleColor", label: "Cor", type: "text", required: true },
    { key: "plate", label: "Placa", type: "text", required: true },
    { key: "chassi", label: "Chassi", type: "text", required: true },
    { key: "renavam", label: "Renavam", type: "text", required: true },
    { key: "mileageEntry", label: "Quilometragem de entrada", type: "number", required: true },
    { key: "fuel", label: "Combustível", type: "text", required: true, placeholder: "Ex: Flex e GNV" },
    { key: "extraItems", label: "Itens que ficaram com o carro (opcional)", type: "textarea" },
    { key: "netValue", label: "Valor líquido a repassar ao proprietário", type: "money", required: true },
    { key: "termDays", label: "Prazo (dias)", type: "number", required: true, defaultValue: "60" },
    { key: "contractDate", label: "Data do contrato", type: "date", required: true },
    { key: "contractTime", label: "Hora (opcional)", type: "time" },
  ],
  VENDA_TROCA: [
    { key: "buyerName", label: "Nome completo do comprador", type: "text", required: true },
    { key: "buyerCpf", label: "CPF", type: "text", required: true },
    { key: "buyerRg", label: "RG", type: "text", required: true },
    { key: "buyerAddress", label: "Endereço", type: "text", required: true },
    { key: "buyerCep", label: "CEP", type: "text", required: true },
    { key: "buyerNeighborhood", label: "Bairro", type: "text", required: true },
    { key: "buyerPhone", label: "Telefone", type: "text", required: true },
    { key: "buyerEmail", label: "E-mail (opcional)", type: "text" },
    { key: "vehicleBrandModel", label: "Veículo — Marca/Modelo", type: "text", required: true, placeholder: "Ex: RENAULT/DUSTER 1.6 E CVT" },
    { key: "vehicleYear", label: "Ano", type: "text", required: true, placeholder: "Ex: 2019/2020" },
    { key: "chassi", label: "Chassi", type: "text", required: true },
    { key: "plate", label: "Placa", type: "text", required: true },
    { key: "saleValue", label: "Valor da venda", type: "money", required: true },
    { key: "paymentDescription", label: "Pago com (forma de pagamento completa)", type: "textarea", required: true, placeholder: "Ex: Um auto FIAT UNO... no valor de R$ 23.000,00 mais financiamento pelo banco Itaú no valor de R$ 49.990,00 em 60 parcelas de R$ 1.459,52." },
    { key: "hasTradeIn", label: "Houve veículo dado como parte de pagamento (troca)?", type: "checkbox" },
    { key: "testDriveObs", label: "Observação sobre test-drive/garantia/km de entrega (opcional)", type: "textarea" },
    { key: "transferObs", label: "Observação sobre transferência/IPVA (opcional)", type: "textarea" },
    { key: "saleDate", label: "Data da venda", type: "date", required: true },
    { key: "saleTime", label: "Hora (opcional)", type: "time" },
  ],
  RECIBO_COMPRA: [
    { key: "ownerName", label: "Nome do comprador (responsável pela loja)", type: "text", required: true, defaultValue: "Walter Praglioli Junior" },
    { key: "ownerCpf", label: "CPF do responsável", type: "text", required: true, defaultValue: "141.845.608-06" },
    { key: "sellerName", label: "Nome do vendedor (dono do carro)", type: "text", required: true },
    { key: "sellerCpf", label: "CPF do vendedor", type: "text", required: true },
    { key: "sellerRg", label: "RG do vendedor", type: "text", required: true },
    { key: "sellerAddress", label: "Endereço do vendedor", type: "text", required: true },
    { key: "sellerCep", label: "CEP", type: "text", required: true },
    { key: "sellerPhone", label: "Telefone", type: "text", required: true },
    { key: "vehicleBrandModel", label: "Veículo — Marca/Modelo", type: "text", required: true, placeholder: "Ex: FIAT PUNTO ELX 1.4" },
    { key: "vehicleYear", label: "Ano", type: "text", required: true, placeholder: "Ex: 2008/2008" },
    { key: "chassi", label: "Chassi", type: "text", required: true },
    { key: "mileage", label: "Quilometragem", type: "number", required: true },
    { key: "plate", label: "Placa", type: "text", required: true },
    { key: "value", label: "Valor pago", type: "money", required: true },
    { key: "paymentDescription", label: "Negociação (forma de pagamento)", type: "text", required: true, placeholder: "Ex: foi pago o valor de R$ 15.500,00 à vista" },
    { key: "purchaseDate", label: "Data da compra", type: "date", required: true },
    { key: "purchaseTime", label: "Hora (opcional)", type: "time" },
  ],
};
