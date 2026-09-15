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

      <div className="flex flex-col gap-2 text-justify">
        <p className="font-semibold">
          CLÁUSULA – DA RESPONSABILIDADE DO VENDEDOR, DÉBITOS E PROCEDÊNCIA DO VEÍCULO
        </p>
        <p>
          O VENDEDOR declara, sob sua inteira responsabilidade, que o veículo objeto deste contrato é
          de sua legítima propriedade e possui procedência lícita, não sendo produto de furto, roubo,
          fraude, apropriação indébita, adulteração de sinais identificadores ou qualquer outra origem
          ilícita.
        </p>
        <p>
          O VENDEDOR declara, ainda, que, salvo as situações expressamente informadas neste contrato, o
          veículo encontra-se livre e desembaraçado de quaisquer ônus, gravames, restrições judiciais ou
          administrativas, bloqueios, débitos, multas, tributos, taxas, encargos, financiamentos ou
          obrigações perante terceiros.
        </p>
        <p>
          Todos os débitos, multas, impostos, taxas, encargos e demais obrigações cujo fato gerador
          tenha ocorrido antes da data e horário da efetiva entrega do veículo à COMPRADORA serão de
          exclusiva responsabilidade do VENDEDOR, ainda que venham a ser lançados, identificados,
          cobrados ou comunicados após a conclusão da compra e transferência do veículo.
        </p>
        <p>
          Caso a COMPRADORA seja obrigada a efetuar qualquer pagamento referente a obrigação de
          responsabilidade do VENDEDOR, este deverá realizar o reembolso integral dos valores pagos,
          incluindo eventuais multas, juros, despesas administrativas e demais custos decorrentes da
          regularização.
        </p>
        <p>
          O VENDEDOR declara também que prestou informações verdadeiras e completas acerca do estado do
          veículo, de seu histórico e de eventuais avarias, sinistros, reparos relevantes, restrições ou
          ocorrências de que tenha conhecimento, responsabilizando-se pela veracidade das informações
          fornecidas.
        </p>
        <p>
          O VENDEDOR responsabiliza-se pela regularidade documental, identificação e procedência do
          veículo, inclusive quanto à autenticidade de seus sinais identificadores, numeração de chassi,
          motor, etiquetas, vidros e demais elementos de identificação, declarando desconhecer qualquer
          adulteração ou irregularidade.
        </p>
        <p>
          Na hipótese de ser posteriormente constatada irregularidade preexistente à compra, relacionada
          à procedência, propriedade, documentação, identificação, débitos ou qualquer fato omitido pelo
          VENDEDOR, este ficará responsável pelos prejuízos comprovadamente suportados pela COMPRADORA,
          sem prejuízo das demais medidas legais cabíveis.
        </p>
        <p>
          As responsabilidades previstas nesta cláusula permanecem válidas mesmo após a transferência do
          veículo para a COMPRADORA.
        </p>
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
