import { formatCurrency } from "@/lib/utils";
import { formatDateExtended } from "@/lib/contracts/format";
import { SignatureLine } from "@/components/contratos/SignatureLine";

// Transcrição fiel do modelo "Recibo de compra de veículo" enviado pela
// loja em 2026-09-13 — usado quando a loja COMPRA um carro de um particular.
export function ReciboCompraTemplate({ fields }: { fields: Record<string, string> }) {
  const value = Number(fields.value) || 0;

  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-black">
      <div className="text-center">
        <h1 className="text-xl font-semibold">AUTO 2000 VEÍCULOS LTDA ME.</h1>
        <p>CNPJ 03.703.264/0001-08</p>
        <p>AV. Professor Luis Ignácio de Anhaia Mello, 8.201 – São Paulo – SP CEP 03270-000</p>
      </div>

      <p className="text-center font-medium">Recibo de compra de veículo.</p>

      <p>
        Eu, {fields.ownerName} CPF {fields.ownerCpf}, proprietário da empresa Auto 2000 Veículos LTDA ME
        CNPJ 03.703.264/0001-08 estou efetuando a compra do veículo abaixo.
      </p>

      <div className="flex flex-col gap-1.5">
        <p>Nome do Vendedor: {fields.sellerName}</p>
        <p>CPF: {fields.sellerCpf} / RG: {fields.sellerRg}</p>
        <p>Endereço: {fields.sellerAddress} / CEP: {fields.sellerCep}</p>
        <p>Telefone: {fields.sellerPhone}</p>
        <p>Veículo: Marca/Modelo: {fields.vehicleBrandModel} / Ano: {fields.vehicleYear}</p>
        <p>Chassi: {fields.chassi}</p>
        <p>Km: {fields.mileage}</p>
        <p>Placa: {fields.plate}</p>
        <p className="font-medium">{formatCurrency(value)}</p>
        <p>Negociação: {fields.paymentDescription}</p>
      </div>

      <p>
        São Paulo {formatDateExtended(fields.purchaseDate)}
        {fields.purchaseTime ? ` - ${fields.purchaseTime}h` : ""}
      </p>

      <div className="flex gap-16 pt-4">
        <SignatureLine label="Vendedor" />
        <SignatureLine label="Auto 2000 Veículos LTDA." />
      </div>
    </div>
  );
}
