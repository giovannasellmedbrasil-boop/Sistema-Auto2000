# Auto2000

Plataforma web para uma loja de veículos seminovos/usados: estoque, busca e
comparação, geração e qualificação de leads, simulação de financiamento,
avaliação de veículos para troca, um assistente de recomendação e um painel
administrativo/CRM. Esta entrega cobre a **Fase 1** do roadmap descrito no
briefing do projeto, com arquitetura e banco de dados já preparados para as
Fases 2 e 3.

## Stack

- **Frontend/Backend:** Next.js 16 (App Router) + TypeScript, API Routes
- **UI:** Tailwind CSS v4 + componentes próprios (`components/ui`)
- **Banco de dados (alvo):** PostgreSQL via Prisma — schema completo em
  [`prisma/schema.prisma`](prisma/schema.prisma), cobrindo todas as entidades
  das três fases (usuários/funcionários, clientes, veículos, leads, CRM,
  financiamento, pré-análise de crédito, avaliação de usados, marketing e
  recomendações de IA).
- **Autenticação do admin:** sessão assinada por cookie (mock) — ver
  [`lib/server/auth.ts`](lib/server/auth.ts).

## Ambiente de demonstração (importante)

Este projeto **não está conectado a um Postgres real**. Como nenhuma API de
banco/financeira/bureau de crédito foi integrada neste momento, o app roda em
modo demonstração:

- **Persistência:** um mock store baseado em arquivo JSON
  (`data/db.json`, git-ignorado) implementado em
  [`lib/server/db.ts`](lib/server/db.ts). As assinaturas de função foram
  desenhadas para serem substituídas por chamadas ao Prisma Client sem
  precisar remodelar as telas.
- **Fotos de veículos:** não há fotos reais de estoque. Em vez de simular
  fotografias (o que enganaria o usuário), o app gera uma ilustração
  consistente por veículo, claramente identificada como placeholder — ver
  [`components/vehicles/VehicleImage.tsx`](components/vehicles/VehicleImage.tsx).
  O upload de fotos reais entra quando o armazenamento de arquivos for
  integrado.
- **Financiamento:** o simulador usa uma taxa referencial fixa só para fins
  de estimativa (`lib/finance.ts`) e deixa explícito que não é uma aprovação
  de crédito real.
- **Análise Inteligente de Crédito:** módulo completo em `/admin` (Nova
  Análise, Consultas, Clientes, relatório) com integração modular e
  autorizada à Serasa Experian (`lib/server/serasa.ts`). Enquanto as
  credenciais (`SERASA_API_URL`/`CLIENT_ID`/`CLIENT_SECRET`/`API_KEY`) não
  estiverem configuradas, roda em **MODO DEMO**: os indicadores são
  gerados de forma determinística (mesmo CPF = mesmo resultado) e sempre
  identificados na tela como "DADOS SIMULADOS — NÃO REPRESENTAM CONSULTA
  REAL". Nunca faz scraping do site da Serasa. A "IA" que interpreta os
  indicadores (`lib/creditAI.ts`) é uma camada de regras sobre os dados
  retornados — mesmo espírito não-generativo do `lib/matching.ts` — e nunca
  escreve "financiamento aprovado" (decisão sempre do banco/financeira).
- **"Encontre seu carro com IA":** versão inicial por correspondência de
  palavras-chave (`lib/matching.ts`), comparando exclusivamente com o
  estoque real — nunca inventa veículos. A recomendação com IA
  generativa completa é Fase 3.
- **Assistente de Documentação (`/admin/documentacao`):** checklist de
  documentos gerado automaticamente por venda (ver
  [`lib/server/documentChecklist.ts`](lib/server/documentChecklist.ts)) —
  100% lógica determinística sobre os dados da negociação, sem chamada a
  nenhum modelo de IA/LLM. A "análise da documentação" compara o checklist
  com o que já foi marcado/anexado; **não há OCR real** (nenhuma leitura de
  nome/CPF/RENAVAM a partir do conteúdo do arquivo) — isso é uma evolução
  futura, quando um provedor de visão computacional for integrado. Os
  arquivos enviados ficam em `data/uploads/` (local, git-ignorado, mesma
  ressalva de `/tmp` em hospedagem serverless) e só são servidos por uma
  rota autenticada, nunca por URL pública. O botão de WhatsApp gera um link
  `wa.me` com a mensagem pronta (mesmo padrão de
  `components/layout/WhatsAppFloatButton.tsx`) — não há envio automático
  via API do WhatsApp Business.
- **Precificação (`/admin/precificacao`):** consulta **real** à tabela FIPE
  via API pública (Parallelum — `lib/server/fipe.ts`), sem scraping e sem
  chave obrigatória (cotas do serviço público se aplicam; por isso há cache
  em memória e um limite de requisições por usuário). "Preço praticado no
  mercado" **não é coletado automaticamente**: o sistema gera links de
  busca prontos para Google/Mercado Livre/OLX/Webmotors/iCarros e a equipe
  registra manualmente os preços de anúncios comparáveis que encontrar — a
  média/estatísticas exibidas são calculadas de verdade sobre esses
  registros, nunca fabricadas.
- **Autenticação do admin:** um usuário único de demonstração (não é o
  sistema de RBAC final descrito na seção 23 do briefing).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Não é necessário configurar banco de dados —
o mock store é criado automaticamente na primeira requisição.

### Painel administrativo

`/admin/login` — três usuários fixos de demonstração, um por nível de
acesso (seção 14 do briefing):

| Perfil        | E-mail                       | Senha               |
| ------------- | ----------------------------- | -------------------- |
| Administrador | `admin@auto2000.com.br`       | `auto2000admin`      |
| Gerente       | `gerente@auto2000.com.br`     | `auto2000gerente`    |
| Vendedor      | `vendedor@auto2000.com.br`    | `auto2000vendedor`   |

Vendedor vê apenas seus próprios clientes/consultas; Gerente vê tudo, sem
gerenciar usuários/integrações; Administrador tem acesso completo,
incluindo o status da integração Serasa e os logs em Configurações. E-mail
e senha do Administrador são personalizáveis via `ADMIN_EMAIL` /
`ADMIN_PASSWORD` em `.env.local` (veja `.env.example`); Gerente e Vendedor
são fixos neste ambiente de demonstração.

## O que está implementado (Fase 1)

- Home com busca, categorias rápidas e destaques
- Estoque com filtros, ordenação e contagem de resultados
- Página de veículo com galeria, ficha técnica, equipamentos e CTAs de
  conversão (interesse, financiamento, troca, WhatsApp, agendar visita)
- Captação de leads (formulário modal) integrada a um mock de CRM
- Botão flutuante de WhatsApp com mensagem contextual por veículo
- Cadastro administrativo de veículos (criar/editar/excluir, com status e
  cálculo automático de dias em estoque)

Também adiantado, por serem extensões de baixo custo sobre o que já existia
na Fase 1 (não fazem parte do escopo obrigatório, mas foram incluídos):
favoritos (`/favoritos`), simulador de financiamento, avaliação/troca de
usados, comparador básico via página de veículo, e a versão inicial (não-IA)
do "encontre seu carro".

### Fase 2 (não implementada nesta entrega)

Pipeline de CRM em Kanban, dashboard de vendas completo, comparador
dedicado de até 3 veículos lado a lado.
Hoje: `/admin` tem métricas básicas e `/admin/leads` lista os leads
capturados em tabela simples (sem drag-and-drop de funil).

### Fase 3 (não implementada nesta entrega)

Recomendação por IA generativa real, Lead Score comercial, copiloto de IA
para vendedores, pré-análise de crédito via bureau autorizado, inteligência
de estoque preditiva.

## Estrutura

```
app/
  (site)/          rotas públicas (Header/Footer/WhatsApp)
  admin/
    login/         fora do grupo protegido
    (dashboard)/   rotas protegidas por sessão (layout com getAdminSession)
  api/              API routes (leads, vehicles, trade-in, match, admin auth)
components/
  ui/               componentes base (Button, Card, Field, Badge...)
  layout/ vehicles/ leads/ admin/ home/ ia/ financiamento/ trade-in/
lib/
  server/           acesso a dados (db.ts, auth.ts) — só roda no servidor
  types.ts          tipos de domínio (espelham prisma/schema.prisma)
  matching.ts finance.ts utils.ts
prisma/schema.prisma  schema completo (todas as fases)
```

## Segurança e LGPD

- Nenhuma chave de API fica no frontend; segredos só via variáveis de
  ambiente (`.env.example`).
- CPF e dados financeiros não são coletados nesta fase (os formulários
  atuais pedem apenas nome, telefone, e-mail e dados do veículo).
- `costPrice` (preço de custo) do veículo nunca é exposto nas rotas/páginas
  públicas — só nas APIs autenticadas do admin.
- `prisma/schema.prisma` já modela `ConsentRecord` para quando a pré-análise
  de crédito for implementada, com texto do consentimento e auditoria de
  quando/como foi concedido.
- Rotas `/admin` e `/api` estão bloqueadas no `robots.txt`.
