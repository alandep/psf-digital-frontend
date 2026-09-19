# Integração com o backend (BFF)

Este documento descreve como o frontend Angular se conecta ao backend Spring Boot
(BFF) usando o padrão de _gateway_, mantendo o modo mockado como padrão.

## 1. Padrão de gateway e as flags `realApis`

Cada módulo tem uma interface (`I...Service`), um adaptador de mock e um serviço
HTTP real, selecionados por um `InjectionToken` conforme as flags em
`src/environments/environment.ts`:

```ts
realApis: {
  auth: false,         // fluxo de identificação (login/MFA/organização)
  export: false,       // CRUD de exportações
  subscription: false, // assinatura/faturas/uso e exportação de dados
  documents: false,    // gateway genérico de documentos (/bff/documentos)
  logistics: false,    // embarques (/bff/logistica)
  finance: false,      // pagamentos, câmbio e hedge (/bff/financeiro)
}
```

Por padrão todas as flags são `false`, então o app continua 100% mockado.
Para ativar um módulo contra o backend, mude a flag correspondente para `true`
e reinicie o `ng serve`. A migração é feita módulo a módulo.

Módulos com gateway HTTP hoje: **auth**, **export**, **subscription**,
**documents**, **logistics** e **finance** (pagamentos/câmbio/hedge).

| Módulo | Token | Flag `realApis` | Endpoints BFF |
| --- | --- | --- | --- |
| logistics | `LOGISTICS_SERVICE` | `logistics` | `/bff/logistica/embarques` |
| pagamentos | `PAGAMENTOS_SERVICE` | `finance` | `/bff/financeiro/pagamentos` |
| câmbio | `CAMBIO_SERVICE` | `finance` | `/bff/financeiro/cambio` |
| hedge | `HEDGE_SERVICE` | `finance` | `/bff/financeiro/hedge` |

Observação honesta sobre a cobertura de cada módulo:

- **export**: o backend cobre listar/criar/confirmar; os demais métodos
  (dashboard, IA, OCR, Siscomex, documentos, update, delete) continuam
  delegando ao mock até o backend expô-los.
- **subscription** (`/bff/assinatura`): o gateway HTTP cobre a assinatura atual,
  uso, faturas, troca de plano, cancelamento e reativação. O catálogo de planos
  e add-ons, a compra de add-ons, a exportação de dados (LGPD) e as métricas de
  SaaS/tenants/funil/trial/eventos **permanecem no mock** — o backend não expõe
  (ou expõe apenas parcialmente, como `GET /bff/assinatura/planos`) esses
  recursos. Esses métodos estão marcados como `// PARTIAL` no
  `subscription-http.service.ts`. Apenas os consumidores in-app
  (`assinatura` e `exportar-dados`) usam o token `SUBSCRIPTION_SERVICE`; as
  telas comerciais (preços/landing/checkout/legal/trial-banner/onboarding/
  command-center/product-events) seguem usando o `SaasBillingMockService`
  diretamente.
- **documents** (`/bff/documentos`): novo gateway genérico
  (`DOCUMENTS_SERVICE`), pronto para integração e para sustentar uma futura
  tela genérica de documentos. As **4 telas ricas de documentos** (invoice,
  packing-list, bill-of-lading, certificados) **não foram religadas**: elas têm
  serviços de mock próprios e modelos de domínio detalhados que não mapeiam para
  o modelo genérico de documento do backend. O gateway novo funciona offline
  via `DocumentsMockService` (mesmo com a flag `false`).
- **logistics** (`/bff/logistica`, flag `logistics`, token `LOGISTICS_SERVICE`):
  o gateway HTTP cobre o núcleo do ciclo de vida do embarque — listar
  (`GET /embarques?status=`), buscar por id, criar e o mapeamento de status
  (`PLANEJADO`/`EM_TRANSITO`/`ENTREGUE`/`CANCELADO`) para o enum do front. O
  mock do front é **muito mais rico** que o backend, então `updateEmbarque` e
  `deleteEmbarque` (o backend só tem transições `/transito`, `/concluir`,
  `/cancelar`, sem update/delete genéricos), além de rotas, sugestão de rota por
  IA, timeline de tracking e geração de documentos **permanecem no mock**
  (`// PARTIAL` no `logistics-http.service.ts`). As telas de
  **transportadoras, containers, portos e navios** usam mocks próprios sem
  equivalente direto no backend e **não foram religadas** — seguem no mock.
- **finance** — três gateways separados, espelhando a divisão do backend em três
  serviços, todos sob a mesma flag `finance`:
  - **pagamentos** (`PAGAMENTOS_SERVICE`, `/bff/financeiro/pagamentos`): HTTP
    cobre listar (`?status=`), buscar por id e criar, com mapeamento
    `PENDENTE`/`PAGO`/`ATRASADO`/`CANCELADO` para o `PaymentStatus` do front. Os
    extras ricos (conciliações, notificações, timeline, insights de IA,
    métricas, projeção de fluxo de caixa) e os catálogos síncronos de dropdown
    (beneficiários/categorias/bancos/moedas/status) **permanecem no mock**
    (`// PARTIAL`).
  - **câmbio** (`CAMBIO_SERVICE`, `/bff/financeiro/cambio`): HTTP cobre listar,
    buscar por id e criar. Simulação, comparação de bancos, cotações, timeline,
    insights de IA, métricas e KPIs financeiros **permanecem no mock**
    (`// PARTIAL`).
  - **hedge** (`HEDGE_SERVICE`, `/bff/financeiro/hedge`): HTTP cobre a listagem
    de contratos. KPIs, resumo de exposição e catálogos de dropdown
    **permanecem no mock** (`// PARTIAL`).

Em resumo: os gateways HTTP wireiam apenas o núcleo do ciclo de vida que o
backend expõe hoje; todo o conteúdo mais rico do mock (IA, métricas, fluxo de
caixa, conciliações, timelines, sugestões de rota e as telas de
transportadoras/containers/portos/navios) continua no mock justamente porque o
backend ainda não o cobre.

Por padrão todas as flags são `false`, então a UI continua 100% mockada até que
o backend correspondente seja ativado.

## 2. Subindo o backend

No diretório `/backend`:

```bash
docker compose up
```

O BFF sobe em `http://localhost:8080`. Usuário de demonstração:

- login: `alan@eip.exemplo`
- senha: `senha123`

O `bffBaseUrl` em dev aponta para `http://localhost:8080`; em produção é `''`
(mesma origem). Os caminhos do BFF já incluem o prefixo `/bff`.

## 3. Geração do cliente OpenAPI (caminho oficial futuro)

O backend expõe o contrato OpenAPI via springdoc em `/v3/api-docs`. O caminho
recomendado a longo prazo é gerar um cliente TypeScript tipado a partir dele:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/v3/api-docs \
  -g typescript-angular \
  -o src/app/api-client
```

O cliente gerado passaria a alimentar os serviços `*-http` (por exemplo
`auth-flow-http.service.ts` e `exportacao-real.service.ts`), substituindo as
chamadas `HttpClient` manuais e mantendo os tipos sincronizados com o backend.

## 4. Sessão e CSRF

- A autenticação usa **cookie de sessão httpOnly**, estabelecido por
  `POST /bff/auth/**`. O interceptor `credentials.interceptor.ts` adiciona
  `withCredentials: true` a toda chamada `/bff/**`.
- Escritas não-auth em `/bff/**` (POST/PUT/PATCH/DELETE) usam **CSRF baseado em
  cookie**: o cookie `XSRF-TOKEN` é lido e enviado no header `X-XSRF-TOKEN`
  pelo `csrf.interceptor.ts`. As rotas `/bff/auth/**` são isentas de CSRF.
- O `error.interceptor.ts` normaliza o envelope de erro do backend
  (`{ code, message, correlationId }`) em um `Error` com a mensagem em pt-BR,
  pronto para exibição em snackbars.

A API pública `/api/v1` (OAuth2) não é usada pela SPA.
