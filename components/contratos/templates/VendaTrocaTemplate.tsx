import { formatCurrency } from "@/lib/utils";
import { formatDateSlash } from "@/lib/contracts/format";
import { SignatureLine } from "@/components/contratos/SignatureLine";

// Transcrição fiel do modelo "CONTRATO DE VENDA E TROCA" enviado pela loja
// em 2026-09-13 — só os dados variáveis mudam por contrato; as cláusulas
// fixas (declarações, responsabilidades) são reproduzidas integralmente.
export function VendaTrocaTemplate({ fields }: { fields: Record<string, string> }) {
  const saleValue = Number(fields.saleValue) || 0;
  const hasTradeIn = fields.hasTradeIn === "true";

  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-black">
      <div className="text-center">
        <h1 className="text-xl font-semibold">AUTO 2000 VEÍCULOS LTDA ME.</h1>
        <p>CNPJ 03.703.264/0001-08</p>
        <p>AV. Professor Luís Ignácio de Anhaia Mello, 8.201 – São Paulo – SP CEP 03270-000</p>
      </div>

      <div className="flex flex-col gap-1.5 pt-2">
        <p>Nome Completo: {fields.buyerName}</p>
        <p>CPF: {fields.buyerCpf} / RG: {fields.buyerRg}</p>
        <p>Endereço: {fields.buyerAddress} / CEP: {fields.buyerCep}</p>
        <p>Bairro: {fields.buyerNeighborhood}</p>
        <p>Telefone: {fields.buyerPhone}</p>
        {fields.buyerEmail && <p>e-mail: {fields.buyerEmail}</p>}
        <p>Veículo – Marca/Modelo: {fields.vehicleBrandModel} - Ano : {fields.vehicleYear}</p>
        <p>Chassi: {fields.chassi}</p>
        <p>Placa: {fields.plate}</p>
        <p>Valor Venda: {formatCurrency(saleValue)}</p>
        <p>Pago com: {fields.paymentDescription}</p>
      </div>

      {fields.testDriveObs && <p>OBS. {fields.testDriveObs}</p>}
      {fields.transferObs && <p>OBS. {fields.transferObs}</p>}

      {hasTradeIn && (
        <p>
          Caso o comprador(a) dê seu veículo como parte de pagamento da compra acima especificada ficará
          responsável por multas, débitos de qualquer natureza, inclusive IPVA ou por restrições junto aos
          órgãos competentes até a presente data. Débitos estes que se compromete a paga-los, neste ato e
          neste instrumento, autorizando a Auto 2000 veículos, promover a cobrança com emissão de boletos ou
          letra de câmbio de valor correspondente. Ficará responsável também por qualquer ocorrência de
          trânsito, inclusive contra terceiros onde esteja envolvido o veículo dado como parte de pagamento
          até o dia e hora de entrada do veículo.
        </p>
      )}

      <p>
        Declaro ao comprador(a), sob pena de sofrer sanções penais, que o veículo dado como parte de
        pagamento da compra acima especificada não possui queixa de roubo, furto, busca e apreensão, avarias
        no chassi, nem qualquer outra que venha impedir sua imediata venda e transferência de propriedade.
      </p>
      <p>
        Caso o comprador(a) não efetuar o pagamento tratado até a data, ou desistir do negócio o mesmo
        perderá o direito do sinal ora dado.
      </p>
      <p>
        É também de total responsabilidade do comprador o reconhecimento de firma por autenticidade do CRV
        do veículo ora comprado ou dado como parte de pagamento.
      </p>
      <p>
        É recomendável que faça toda parte de transferência do veículo pelo despachante credenciado pela
        Auto 2000 do veículo que está sendo negociado no valor de R$ 780,00 pago pelo cliente.
      </p>
      <p>
        Declaro ter examinado o veículo, estando ciente de que se trata de um veículo usado e que a garantia
        é para motor e câmbio, e quanto à manutenção de troca de óleo e filtro é de responsabilidade do
        comprador(a).
      </p>
      <p>
        Declaro ter ciência que peças como freio, pneus, suspensão, bateria, injeção eletrônica, embreagem,
        velas e cabos entre outros itens do veículo foram avaliadas no ato da compra e no ato do test dive
        realizado pelo consumidor e que o mesmo tem a total liberdade de trazer seu mecânico para avaliar as
        condições dessas peças antes do momento da compra, pois reclamações referentes à esses itens não
        serão atendidos.
      </p>
      <p>
        Declaro ter ciência que estou adquirindo um veículo no estado em que se encontra assumindo assim a
        responsabilidade por eventuais manutenções requerentes ao tempo de uso do mesmo.
      </p>
      <p>
        Declaro para os devidos fins que li atentamente o presente documento, não tenho quaisquer dúvidas
        sobre o mesmo, aceitando-o integralmente.
      </p>

      <p>
        Data da venda {formatDateSlash(fields.saleDate)}
        {fields.saleTime ? ` ${fields.saleTime}h` : ""}
      </p>

      <div className="flex gap-16 pt-4">
        <SignatureLine label="Auto 2000 Veículos." />
        <SignatureLine label="Comprador." />
      </div>
    </div>
  );
}
