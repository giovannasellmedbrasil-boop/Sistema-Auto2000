import { formatCurrency } from "@/lib/utils";
import { formatDateExtended } from "@/lib/contracts/format";
import { SignatureLine } from "@/components/contratos/SignatureLine";

// Transcrição fiel do modelo "CONTRATO DE CONSIGNAÇÃO DE VEÍCULO" enviado
// pela loja em 2026-09-13 — só os dados variáveis (entre {}) mudam por
// contrato; o texto das cláusulas é fixo.
export function ConsignacaoTemplate({ fields }: { fields: Record<string, string> }) {
  const netValue = Number(fields.netValue) || 0;

  return (
    <div className="flex flex-col gap-5 text-sm leading-relaxed text-black">
      <h1 className="text-2xl font-semibold">CONTRATO DE CONSIGNAÇÃO DE VEÍCULO</h1>

      <section>
        <h2 className="mb-1 font-semibold">1. AS PARTES</h2>
        <ul className="list-disc pl-5">
          <li>
            <b>CONSIGNANTE (Proprietário):</b> {fields.consignanteName}, CPF {fields.consignanteCpf},
            residente na {fields.consignanteAddress}, telefone {fields.consignantePhone}.
          </li>
          <li>
            <b>CONSIGNATÁRIO (Loja):</b> Auto 2000 Veículos LTDA, CNPJ 03.703.264/0001-08, localizada na
            Rua Manuel de Arruda Castanho, 430 CEP 03270-000.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-1 font-semibold">2. O VEÍCULO</h2>
        <ul className="list-disc pl-5">
          <li>
            <b>Marca/Modelo:</b> {fields.vehicleBrandModel} | <b>Ano/Mod:</b> {fields.vehicleYear} |{" "}
            <b>Cor:</b> {fields.vehicleColor}
          </li>
          <li>
            <b>Placa:</b> {fields.plate} | <b>Chassi:</b> {fields.chassi} | <b>Renavam:</b> {fields.renavam}
          </li>
          <li>
            <b>Quilometragem de Entrada:</b> {fields.mileageEntry} | <b>Combustível:</b> {fields.fuel}
            {fields.extraItems ? ` | ${fields.extraItems}` : ""}
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-1 font-semibold">3. PREÇO E COMISSÃO</h2>
        <ul className="list-disc pl-5">
          <li>O valor líquido a ser repassado ao Proprietário é de <b>{formatCurrency(netValue)}</b>.</li>
          <li>Qualquer valor obtido na venda acima deste preço ficará com a Loja a título de comissão e prestação de serviços.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-1 font-semibold">4. PRAZO</h2>
        <p>
          Este contrato tem validade de <b>{fields.termDays} dias</b> a partir desta data. Se o veículo não
          for vendido, poderá ser retirado pelo Proprietário sem custos, desde que não haja despesas
          pendentes autorizadas.
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-semibold">5. REGRAS E RESPONSABILIDADES (O mais importante para a Loja):</h2>
        <ul className="list-disc pl-5">
          <li>
            <b>Test-Drive e Divulgação:</b> O Proprietário autoriza expressamente a Loja a realizar anúncios,
            fotos, vídeos e testes de rodagem (test-drive) com potenciais compradores e funcionários.
          </li>
          <li>
            <b>Multas e Infrações:</b> Eventuais multas cometidas após a assinatura deste termo (comprovadas
            pela quilometragem e data de entrada) são de responsabilidade da Loja. Multas anteriores ou
            geradas antes deste momento são de responsabilidade do Proprietário.
          </li>
          <li>
            <b>Guarda e Danos:</b> A Loja se responsabiliza pela guarda do veículo em seu pátio. A Loja não
            responde por danos causados por casos fortuitos, força maior (como chuvas de granizo,
            enchentes) ou sinistros que fujam do seu controle direto, mantendo-se a recomendação de que o
            Proprietário mantenha o seguro do veículo ativo.
          </li>
          <li>
            <b>Manutenção:</b> O veículo deve ser entregue em perfeitas condições mecânicas e estéticas.
            Defeitos ocultos ou problemas mecânicos preexistentes são de responsabilidade do Proprietário.
          </li>
        </ul>
      </section>

      <p>
        São Paulo, {formatDateExtended(fields.contractDate)}
        {fields.contractTime ? ` – ${fields.contractTime}h` : ""}
      </p>

      <SignatureLine label="Auto 2000 Veículos LTDA (Consignatário)" />
      <SignatureLine label={`${fields.consignanteName} (Consignante)`} />
    </div>
  );
}
