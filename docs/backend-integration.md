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

---

## Endpoints de dashboard adicionados (agregação/leitura)

Foram adicionados três endpoints BFF de agregação, de forma puramente aditiva
(novos métodos em use cases/services/controllers já existentes — nenhum código
existente foi alterado). Todos exigem sessão autenticada e passam pelo RBAC.

| Módulo | Endpoint | Retorno (resumo) |
|--------|----------|------------------|
| Export | `GET /bff/exportacoes/dashboard` | `total`, `rascunho`, `confirmadas`, `canceladas`, `valorTotal`, `porStatus[]` |
| CRM | `GET /bff/crm/oportunidades/dashboard` | `total`, `valorTotalEstimado`, `porEstagio[]` (estágio, quantidade, valor) |
| Logística | `GET /bff/logistica/embarques/dashboard` | `total`, `porStatus[]` (status, quantidade) |

O front do módulo Export já consome o seu dashboard: `ExportacaoRealService.getDashboardData()`
busca `GET /bff/exportacoes/dashboard` e mescla os contadores reais sobre o mock
(campos ricos — top países/produtos, alertas de risco, métricas de IA/compliance —
seguem vindo do mock). Em caso de erro, cai no mock. Isso só vale quando
`realApis.export = true`.

Os dashboards de CRM e Logística estão prontos no backend; o consumo no front
pode ser ligado quando desejado, seguindo o mesmo padrão híbrido do Export.

## Como confirmar que o backend está de pé

A partir de `backend/`:

```
docker compose up --build
```

Sinais de sucesso nos logs do container `app`:

- `Started EipBackendApplication` e `Tomcat started on port 8080`.
- Flyway aplica as migrações e 45+ repositórios JPA são carregados.

Verificações rápidas:

- Saúde: `GET http://localhost:8080/actuator/health` → `{"status":"UP"}`.
- API docs: `GET http://localhost:8080/v3/api-docs` (ou `/swagger-ui.html`).

Para o teste e2e com o front (mesma origem via proxy):

1. `realApis.auth = true` e `realApis.export = true` em `src/environments/environment.ts`.
2. `npx ng serve --configuration=development` (o `proxy.conf.json` encaminha `/bff` para `:8080`).
3. Login: identificador → senha `senha123` → MFA `123456` (qualquer 6 dígitos).
4. Tela de exportações (`/exportacoes/gerenciar`) chama `GET /bff/exportacoes` e o dashboard.

---

## Auditoria de consumo por token (rewire audit)

Verificação de que as telas realmente consomem os módulos via `InjectionToken`
(e não os mocks concretos), para que as flags `realApis.<módulo>` tenham efeito.

| Módulo | Token | Situação | Observação |
|--------|-------|----------|------------|
| CRM | `CRM_SERVICE` | Ligado | Tela `oportunidades` consome o token e `getDashboard()`. |
| Export | `EXPORTACAO_SERVICE` | Ligado | `exportacao-lista` e `acompanhar-status`. |
| Logística | `LOGISTICS_SERVICE` | Ligado | `embarque-lista` ("Resumo de Embarques"). |
| Subscription | `SUBSCRIPTION_SERVICE` | Ligado | `assinatura` e `exportar-dados` já injetam o token. |
| Finance | `PAGAMENTOS_SERVICE` / `CAMBIO_SERVICE` / `HEDGE_SERVICE` | Ligado | `pagamentos`, `cambio`, `hedge` (+ dialogs) já injetam os tokens. |
| Documents | `DOCUMENTS_SERVICE` | Sem consumidor | O gateway genérico `/bff/documentos` existe, mas as telas de documentos no app são por-tipo (invoice, packing-list, certificados) e permanecem mock por decisão de design. |

Usos remanescentes de mocks concretos que **não** devem ser religados (fora do
escopo dos gateways):

- `SaasBillingMockService` em páginas públicas/institucionais e super admin
  (landing, precos, checkout, termos, privacidade, trial-banner, onboarding,
  home-public, saas-command-center, product-events): catálogo de planos, textos
  legais, onboarding e métricas — conteúdo front-only/público, não é o contrato
  do gateway de subscription.
- `CambioService` (`src/app/services/cambio.service.ts`) em `home-logged`: é um
  ticker simples de câmbio, serviço distinto do gateway financeiro — mantido.
- Telas de documentos por-tipo (invoice/packing-list/certificados): ricas e
  mock-only; o gateway genérico de documentos será consumido se/quando uma tela
  genérica de documentos for introduzida.

Conclusão: os gateways já construídos estão corretamente ligados aos seus
consumidores pretendidos; a auditoria não exigiu mudanças de código.

---

## Follow-ups deferidos (fora do escopo deste spec)

Itens registrados para o futuro; **não implementados** nesta fase de integração.

### Stripe webhook — verificação de assinatura (deferido)

`StripeWebhookController` (`/webhooks/stripe`) aceita o header opcional
`Stripe-Signature`, mas ainda **não valida** a assinatura (HMAC-SHA256 sobre o
corpo bruto com o segredo do endpoint). O TODO permanece no controller:
`// TODO: verify signature against the raw body before processing.` A
autenticidade hoje se apoia em idempotência via inbox. Implementar a verificação
é **fora de escopo** deste spec, salvo se trivial; manter o TODO no código como
ponteiro para esta nota.

### RBAC — RbacEvaluator permissivo (deferido)

`RbacEvaluator` (exposto como `@rbac` para `@PreAuthorize("@rbac.can(...)")`)
atualmente retorna `true` para qualquer principal autenticado — um placeholder
permissivo. A substituição por uma matriz real de permissões por organização é
**fora de escopo** deste spec. Consequência de front a lembrar: quando o RBAC
real existir, endpoints protegidos poderão retornar **403**; nesse momento, o
`error.interceptor` deverá ganhar tratamento de `403` (hoje ele trata apenas
`401` → redirect para `/login`). Essa mudança no interceptor fica **deferida**
até o RBAC real entrar.

## Status atual da integração (matriz)

Resumo do estado por módulo após a construção do gateway de CRM e a auditoria de
consumo por token.

| Módulo | Gateway no front | Flag `realApis` | Consumo em tela | Dashboard backend |
|--------|------------------|-----------------|-----------------|-------------------|
| Auth | Sim | `auth` | Fluxo de login | — |
| Export | Sim | `export` | lista + acompanhar-status | `GET /bff/exportacoes/dashboard` |
| Logística | Sim | `logistics` | embarque-lista | `GET /bff/logistica/embarques/dashboard` |
| CRM | Sim | `crm` | oportunidades | `GET /bff/crm/oportunidades/dashboard` |
| Subscription | Sim | `subscription` | assinatura + exportar-dados | — |
| Finance | Sim (pagamentos/câmbio/hedge) | `finance` | pagamentos, cambio, hedge | — |
| Documents | Sim (genérico) | `documents` | sem consumidor (telas por-tipo são mock) | — |

Todas as flags têm default `false` (app 100% mock por padrão). Verificação
end-to-end por módulo (ligar a flag, subir o backend, logar e conferir as
chamadas `/bff`, depois reverter) é uma etapa manual pendente — ver o roteiro em
"Para o teste e2e com o front" acima.

---

## Verificação end-to-end dos módulos (tarefa 14)

Validação executada contra o backend em execução (`docker compose up`), via fluxo
de autenticação completo (identify → login `senha123` → MFA `123456`), reutilizando
a mesma sessão (cookie `JSESSIONID`). Confirmou-se que o `SecurityContext` passou a
ser persistido na `HttpSession` no login, de modo que os endpoints protegidos
`/bff/**` reconhecem a sessão (antes retornavam 401 mesmo com sessão válida).

Resultado — todos os endpoints protegidos responderam **HTTP 200** com sessão:

| Módulo | Endpoints verificados | Resultado |
|--------|-----------------------|-----------|
| Auth | `/bff/auth/me` | 200 |
| Export | `/bff/exportacoes`, `/bff/exportacoes/dashboard` | 200 |
| Logística | `/bff/logistica/embarques`, `/bff/logistica/embarques/dashboard` | 200 |
| CRM | `/bff/crm/oportunidades`, `/bff/crm/oportunidades/dashboard` | 200 |
| Finance | `/bff/financeiro/pagamentos`, `/bff/financeiro/cambio`, `/bff/financeiro/hedge` | 200 |
| Subscription | `/bff/assinatura` | 200 |
| Documents | `/bff/documentos` | 200 |

Exemplo de payload real retornado (CRM dashboard, com o seed do backend):
`{"total":1,"valorTotalEstimado":120000.00,"porEstagio":[{"estagio":"PROPOSTA","quantidade":1,"valorEstimado":120000.00}]}`

Correção-chave aplicada no backend: `AuthBffController.bindSession(...)` agora cria
um `UsernamePasswordAuthenticationToken` (principal = userId, authority `ROLE_USER`)
e o persiste via `HttpSessionSecurityContextRepository`, para o
`SecurityContextHolderFilter` padrão do Spring restaurar a autenticação em cada
requisição. Também foi necessário rebuild sem cache do backend
(`docker compose build --no-cache app`) para o container passar a rodar o código novo.

Observação sobre reversibilidade: as flags `realApis.*` permanecem controlando
mock vs. backend por módulo; com a flag em `false`, o módulo volta a 100% mock.

---

## Redução de lacuna PARTIAL — portos (tarefa 15.1)

O método `getPortos()` do gateway de logística (`logistics-http.service.ts`) deixou
de ser `// PARTIAL` e passou a consumir o endpoint **já existente**
`GET /bff/logistica/portos` (retorna `PortoView { id, code, name, country }`),
mapeando para o tipo rico `PortoInfo` do front:

- `code → codigo`, `name → nome`, `country → pais`;
- campos ricos não fornecidos pelo backend (`congestionamento_atual`,
  `tempo_medio_operacao`) recebem default `0`;
- em erro, faz fallback para o mock (`catchError`).

Nenhuma mudança no backend foi necessária (o endpoint já existia), portanto o
boot do backend permanece inalterado. Front build `ng build --configuration=development`
exit 0. Com `realApis.logistics = false`, o comportamento volta ao mock.
