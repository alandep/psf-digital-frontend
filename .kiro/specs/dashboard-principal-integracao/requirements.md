# Requirements Document

## Introduction

Esta spec cobre a **integração completa da tela "Dashboard Principal"** do EIP (Export Intelligence Platform) com serviços reais do backend, **removendo TODO o mock** hoje consumido pela tela. O frontend é Angular 20; o backend é Spring Boot hexagonal (Spring Modulith, Java 21), com Postgres via Flyway e RLS por tenant.

A tela do Dashboard Principal (rota `/home-logged/dashboards/principal`, `DashboardPrincipalComponent`) hoje injeta **diretamente** o `DashboardMockService` e consome dois métodos: `getDashboardData(filtros?)` e `getOptionsFilters()`. Não existe ainda token de injeção `DASHBOARD_SERVICE` nem flag `environment.realApis.dashboard`; a tela não segue, portanto, o padrão de integração adotado no resto do produto (adapter real por token DI, resolvido por flag `realApis`, com interceptors anexando sessão + CSRF `X-XSRF-TOKEN`).

**Princípio norteador (Escopo A — dados derivados do real):** todos os números do dashboard devem ser **derivados das exportações reais** já existentes no backend (módulo `export`), cruzando com os módulos de contratos e `compliance` existentes. Nenhum valor pode ser inventado. Quando não houver dados no período, a tela mostra zeros/estado vazio honesto; quando o backend falhar, o erro é exibido sem fallback para mock.

**Decisão de escopo autorizada (Escopo C — evoluir o backend para os KPIs sem fonte):** alguns KPIs **não possuem fonte** hoje e o usuário autorizou **evoluir o backend** para alimentá-los de verdade, com **novas migrations Flyway**:

- **Lucro Estimado** e **Margem Média**: exigem adicionar **custo/lucro** às exportações (e/ou itens), com margem = lucro / receita.
- **Total Embarcado** vs **Total Pendente**: exigem um **status/flag de embarque** nas exportações para separar o que já embarcou do que está pendente.
- **Alertas de Compliance**: integrar a contagem real do módulo `compliance` (screening pendente / alto risco).

Esta feature exige, portanto, **backend novo** (novo endpoint de analytics de dashboard, novas colunas e migrations, possível evolução de domínio e dos fluxos de criação/edição de exportação para capturar custo e embarque) e um **novo deploy no Cloud Run** (profile `cloud`), além da reconexão do frontend. Localmente o backend roda no profile `local`. Esta spec é explícita sobre o tamanho real do trabalho.

### Base factual (frontend — tela a reconectar)

- Rota `/home-logged/dashboards/principal` → `DashboardPrincipalComponent` (`src/app/components/dashboards/dashboard-principal/dashboard-principal.component.ts`).
- Hoje injeta `DashboardMockService` (`src/services/dashboardMockService.ts`) e consome: `getDashboardData(filtros?: FiltrosDashboard): Observable<DashboardCompleto>` e `getOptionsFilters(): Observable<OptionsFilters>`.
- Tipos em `src/types/dashboard.ts`:
  - `DashboardData` (KPIs): `total_exportacoes`, `total_embarcado`, `total_pendente`, `lucro_estimado`, `margem_media`, `contratos_ativos`, `alertas_compliance`.
  - `ExportacoesPorMes {mes, valor}`, `ExportacoesPorPais {pais, valor, percentual}`, `ExportacoesPorProduto {produto, valor}`.
  - `FiltrosDashboard { periodo{dataInicio, dataFim}, paises[], produtos[], clientes[] }`.
  - `OptionsFilters { paises[], produtos[], clientes[] }`.
  - `DashboardCompleto { kpis, exportacoesPorMes[], exportacoesPorPais[], exportacoesPorProduto[] }`.
- A tela possui: card de Filtros (data início/fim, países, produtos, clientes + "Limpar Filtros"), 7 KPIs, e 3 gráficos Chart.js (linha = por mês, pizza = por país, barras = por produto).
- Padrão de integração do projeto: serviços reais via token de injeção DI (ex.: `AI_SERVICE`, `EXPORTACAO_SERVICE`) com `useClass: environment.realApis?.X ? HttpService : MockAdapter`, controlado por flags `environment.realApis`. Interceptors anexam sessão + CSRF (`X-XSRF-TOKEN`).

### Base factual (backend — o que existe e o que falta)

- Módulo `export` (hexagonal). Tabela `export` (V3): `organization_id`, `customer_id`, `destination_country`, `incoterm`, `total_amount (numeric 18,2)`, `currency`, `status` (enum `ExportacaoStatus`: `RASCUNHO` / `CONFIRMADA` / `CANCELADA`), `created_at`, `updated_at`. Tabela `export_item`: `product_id`, `description`, `quantity (18,3)`, `unit_price (18,2)`. Tabela `customer`: `name`, `country`. Tabela `product`: `ncm`, `description`. Todas com RLS por tenant.
- Único endpoint de dashboard hoje: `GET /bff/exportacoes/dashboard` → `ExportacoesDashboard { total, rascunho, confirmadas, canceladas, valorTotal, porStatus[] }` (RBAC `exportacoes/gerenciar` view). **Não** cobre séries por mês/país/produto, nem os KPIs de embarcado/pendente/lucro/margem/contratos/compliance, nem catálogos de filtro.
- Módulo `compliance` possui `screening` (`GET /bff/compliance/screening`, RBAC `compliance/painel`) com `ScreeningView {status, riskLevel, resultSummary, ...}` — fonte para "Alertas de Compliance".
- `ExportacaoStatus` **não** tem estado de "embarcado" (só `RASCUNHO` / `CONFIRMADA` / `CANCELADA`); a entidade `export` **não** tem custo nem lucro.

### Mapeamento KPI → fonte (decidido com o usuário)

- **Total Exportações** = soma de `total_amount` (derivável hoje).
- **Contratos Ativos** = contagem de exportações `CONFIRMADA` (derivável hoje).
- **Exportações por Mês** = agregação por `created_at` (derivável hoje).
- **Exportações por País** = agregação por `destination_country` (derivável hoje).
- **Exportações por Produto** = agregação por `export_item.description` / `product_id` (derivável hoje).
- **Total Embarcado** vs **Total Pendente** = **requer** evoluir status/flag de embarque no backend (Escopo C — nova coluna/estado + migration).
- **Lucro Estimado** + **Margem Média** = **requer** adicionar custo (e/ou lucro) às exportações/itens no backend (Escopo C — novas colunas + migration; margem = lucro / receita).
- **Alertas de Compliance** = integrar contagem real do módulo `compliance` (screening pendente / alto risco).
- **Catálogos de filtro** (países/produtos/clientes) = derivados das tabelas reais (`export.destination_country`, `product` / `export_item`, `customer`).
- **Filtros** (período / países / produtos / clientes) = aplicados server-side nas agregações.

## Glossary

- **Dashboard_Tela**: A tela/componente Angular na rota `/home-logged/dashboards/principal` (`DashboardPrincipalComponent`, `src/app/components/dashboards/dashboard-principal/dashboard-principal.component.ts`), ponto único de visualização dos KPIs e gráficos do dashboard principal.
- **Dashboard_Service**: A dependência de dashboard injetada via token DI `DASHBOARD_SERVICE` (a ser criado), que resolve para o Dashboard_Http_Service quando `realApis.dashboard === true` e para o Dashboard_Mock_Adapter caso contrário.
- **Dashboard_Http_Service**: O adapter HTTP real (a ser criado) que chama o Analytics_Endpoint e o Catalogos_Endpoint sob `${environment.bffBaseUrl}`.
- **Dashboard_Mock_Adapter**: `DashboardMockService` (`src/services/dashboardMockService.ts`), adapter determinístico usado **apenas** quando `realApis.dashboard === false`.
- **IDashboardService**: A interface (a ser criada) que ambos os adapters implementam, com as operações `getDashboardData(filtros?)` e `getOptionsFilters()`.
- **Flag_RealApis_Dashboard**: A flag de ambiente `environment.realApis.dashboard` (a ser criada) que, quando `true`, roteia o Dashboard_Service para o Dashboard_Http_Service real; quando `false`, roteia para o Dashboard_Mock_Adapter.
- **Analytics_Endpoint**: O novo endpoint BFF de analytics de dashboard (a ser criado, ex.: `GET /bff/dashboards/principal`) que devolve KPIs + séries agregadas das exportações reais, respeitando RLS por tenant e os Filtros_Dashboard.
- **Catalogos_Endpoint**: O endpoint BFF (a ser criado, ex.: `GET /bff/dashboards/principal/filtros`) que devolve os catálogos de filtro (`OptionsFilters`) derivados de dados reais.
- **Dashboard_Completo**: O payload `DashboardCompleto { kpis, exportacoesPorMes[], exportacoesPorPais[], exportacoesPorProduto[] }` devolvido pelo Analytics_Endpoint.
- **KPIs_Dashboard**: O objeto `DashboardData` com os sete indicadores: `total_exportacoes`, `total_embarcado`, `total_pendente`, `lucro_estimado`, `margem_media`, `contratos_ativos`, `alertas_compliance`.
- **Series_Dashboard**: As três séries de gráficos: `exportacoesPorMes[]` (linha), `exportacoesPorPais[]` (pizza), `exportacoesPorProduto[]` (barras).
- **Filtros_Dashboard**: O objeto `FiltrosDashboard { periodo{dataInicio, dataFim}, paises[], produtos[], clientes[] }` enviado ao Analytics_Endpoint.
- **Options_Filters**: O objeto `OptionsFilters { paises[], produtos[], clientes[] }` com os valores disponíveis para seleção nos filtros da Dashboard_Tela.
- **Exportacao**: Registro do módulo `export` (tabela `export`) com `organization_id`, `customer_id`, `destination_country`, `incoterm`, `total_amount`, `currency`, `status`, `created_at`, `updated_at`, e itens em `export_item`.
- **Status_Exportacao**: O enum `ExportacaoStatus` do backend (`RASCUNHO` / `CONFIRMADA` / `CANCELADA`), hoje sem estado de embarque.
- **Flag_Embarque**: O novo status/flag de embarque das exportações (a ser criado no backend via migration Flyway) que distingue exportações já embarcadas das pendentes, alimentando Total Embarcado vs Total Pendente.
- **Custo_Exportacao**: O(s) novo(s) campo(s) de custo (e/ou lucro) das exportações/itens (a ser criado no backend via migration Flyway) que alimenta Lucro Estimado e Margem Média.
- **Screening_Compliance**: Resultado de `GET /bff/compliance/screening` (`ScreeningView {status, riskLevel, resultSummary, ...}`) do módulo `compliance`, fonte do KPI de Alertas de Compliance.
- **RLS_Tenant**: A segregação por tenant via Row-Level Security do Postgres aplicada a todas as tabelas do backend, que o Analytics_Endpoint e o Catalogos_Endpoint devem respeitar.
- **Migration_Flyway**: Uma migration versionada do Flyway necessária para evoluir o schema (Custo_Exportacao, Flag_Embarque).

## Requirements

### Requirement 1: Consumo exclusivo do Dashboard_Service via token DI (sem mock no caminho real)

**User Story:** Como mantenedor do EIP, quero que a Dashboard_Tela obtenha seus dados exclusivamente por um serviço real injetado por token DI, para que a tela reflita o backend real quando `realApis.dashboard === true` e nenhum mock permaneça no caminho real.

#### Acceptance Criteria

1. THE Dashboard_Tela SHALL obter os dados de KPIs, Series_Dashboard e Options_Filters exclusivamente através do Dashboard_Service injetado pelo token `DASHBOARD_SERVICE`.
2. THE Dashboard_Tela SHALL NOT injetar nem referenciar o Dashboard_Mock_Adapter diretamente.
3. WHERE `realApis.dashboard === true`, THE Dashboard_Service injetado SHALL ser o Dashboard_Http_Service que chama o Analytics_Endpoint e o Catalogos_Endpoint reais.
4. WHERE `realApis.dashboard === false`, THE Dashboard_Service injetado SHALL ser o Dashboard_Mock_Adapter.
5. THE Dashboard_Service SHALL expor as operações `getDashboardData(filtros?: FiltrosDashboard)` e `getOptionsFilters()` definidas pela IDashboardService.
6. THE Dashboard_Tela SHALL NOT conter dados de KPIs, Series_Dashboard ou Options_Filters hardcoded no componente.

### Requirement 2: Endpoint BFF de analytics com KPIs e séries derivados das exportações reais

**User Story:** Como operador do EIP, quero que o Dashboard Principal exiba KPIs e gráficos calculados a partir das exportações reais do meu tenant, para que os números representem a operação real e não dados fictícios.

#### Acceptance Criteria

1. WHEN a Dashboard_Tela solicita dados ao Dashboard_Http_Service, THE Dashboard_Http_Service SHALL invocar o Analytics_Endpoint e retornar um Dashboard_Completo.
2. WHEN o Analytics_Endpoint calcula o KPI `total_exportacoes`, THE Analytics_Endpoint SHALL derivá-lo da soma de `total_amount` das Exportacoes do tenant que satisfazem os Filtros_Dashboard.
3. WHEN o Analytics_Endpoint calcula o KPI `contratos_ativos`, THE Analytics_Endpoint SHALL derivá-lo da contagem de Exportacoes com Status_Exportacao igual a `CONFIRMADA` que satisfazem os Filtros_Dashboard.
4. WHEN o Analytics_Endpoint calcula a série `exportacoesPorMes`, THE Analytics_Endpoint SHALL agregar as Exportacoes por mês de `created_at` dentro do período filtrado.
5. WHEN o Analytics_Endpoint calcula a série `exportacoesPorPais`, THE Analytics_Endpoint SHALL agregar as Exportacoes por `destination_country` e incluir o valor e o percentual de cada país.
6. WHEN o Analytics_Endpoint calcula a série `exportacoesPorProduto`, THE Analytics_Endpoint SHALL agregar os `export_item` por `description` ou `product_id` dentro do escopo filtrado.
7. THE Analytics_Endpoint SHALL restringir todas as agregações aos dados do tenant corrente por meio de RLS_Tenant.
8. THE Analytics_Endpoint SHALL NOT retornar valores que não sejam derivados de Exportacoes, Screening_Compliance ou contratos reais do tenant.

### Requirement 3: Filtros reais aplicados server-side nas agregações

**User Story:** Como operador do EIP, quero que os filtros de período, países, produtos e clientes alterem os KPIs e gráficos conforme os dados reais, para que eu analise fatias específicas da operação.

#### Acceptance Criteria

1. WHEN a Dashboard_Tela solicita dados com Filtros_Dashboard preenchidos, THE Dashboard_Http_Service SHALL transmitir o período (`dataInicio`, `dataFim`), `paises`, `produtos` e `clientes` ao Analytics_Endpoint.
2. WHERE o período (`dataInicio`, `dataFim`) está presente nos Filtros_Dashboard, THE Analytics_Endpoint SHALL restringir as agregações às Exportacoes cujo `created_at` está dentro do período.
3. WHERE `paises` está presente nos Filtros_Dashboard, THE Analytics_Endpoint SHALL restringir as agregações às Exportacoes cujo `destination_country` pertence ao conjunto informado.
4. WHERE `produtos` está presente nos Filtros_Dashboard, THE Analytics_Endpoint SHALL restringir as agregações às Exportacoes com `export_item` correspondente ao conjunto de produtos informado.
5. WHERE `clientes` está presente nos Filtros_Dashboard, THE Analytics_Endpoint SHALL restringir as agregações às Exportacoes cujo `customer_id` pertence ao conjunto informado.
6. WHEN o usuário aciona "Limpar Filtros" na Dashboard_Tela, THE Dashboard_Tela SHALL solicitar os dados sem restrições de Filtros_Dashboard e exibir o resultado agregado completo do tenant.
7. WHEN os Filtros_Dashboard são alterados pelo usuário, THE Dashboard_Tela SHALL solicitar novamente o Dashboard_Completo ao Dashboard_Service com os filtros atualizados.

### Requirement 4: Catálogos de filtro derivados de dados reais

**User Story:** Como operador do EIP, quero que as opções de países, produtos e clientes nos filtros venham dos dados reais do meu tenant, para que eu só filtre por valores que de fato existem na operação.

#### Acceptance Criteria

1. WHEN a Dashboard_Tela é inicializada, THE Dashboard_Tela SHALL solicitar os Options_Filters ao Dashboard_Service via `getOptionsFilters()`.
2. WHEN o Dashboard_Http_Service solicita os Options_Filters, THE Dashboard_Http_Service SHALL invocar o Catalogos_Endpoint.
3. WHEN o Catalogos_Endpoint monta a lista `paises`, THE Catalogos_Endpoint SHALL derivá-la dos valores distintos de `destination_country` das Exportacoes do tenant.
4. WHEN o Catalogos_Endpoint monta a lista `produtos`, THE Catalogos_Endpoint SHALL derivá-la dos `product` / `export_item` reais do tenant.
5. WHEN o Catalogos_Endpoint monta a lista `clientes`, THE Catalogos_Endpoint SHALL derivá-la dos `customer` reais do tenant.
6. THE Catalogos_Endpoint SHALL restringir os catálogos aos dados do tenant corrente por meio de RLS_Tenant.

### Requirement 5: Evolução do backend para custo/lucro (Lucro Estimado e Margem Média reais)

**User Story:** Como gestor de comércio exterior, quero ver o Lucro Estimado e a Margem Média calculados a partir de custo e receita reais das exportações, para que esses indicadores sejam confiáveis para decisão.

#### Acceptance Criteria

1. THE backend SHALL introduzir o Custo_Exportacao nas Exportacoes (e/ou nos `export_item`) por meio de uma Migration_Flyway versionada.
2. WHEN o Analytics_Endpoint calcula o KPI `lucro_estimado`, THE Analytics_Endpoint SHALL derivá-lo da receita (`total_amount`) menos o Custo_Exportacao das Exportacoes que satisfazem os Filtros_Dashboard.
3. WHEN o Analytics_Endpoint calcula o KPI `margem_media`, THE Analytics_Endpoint SHALL derivá-lo da razão entre o `lucro_estimado` e a receita das Exportacoes que satisfazem os Filtros_Dashboard.
4. IF a receita agregada das Exportacoes filtradas é zero, THEN THE Analytics_Endpoint SHALL retornar `margem_media` igual a zero sem gerar erro de divisão.
5. THE backend SHALL evoluir a entidade/domínio de Exportacao e os fluxos de criação e edição de exportação para capturar o Custo_Exportacao.
6. WHERE uma Exportacao não possui Custo_Exportacao registrado, THE Analytics_Endpoint SHALL tratá-la de forma consistente e documentada (ex.: custo zero) sem inventar valores de lucro ou margem.

### Requirement 6: Evolução do backend para status/flag de embarque (Total Embarcado vs Total Pendente reais)

**User Story:** Como operador de logística, quero ver quanto já foi embarcado e quanto está pendente a partir do estado real de embarque das exportações, para que eu acompanhe a execução física da operação.

#### Acceptance Criteria

1. THE backend SHALL introduzir a Flag_Embarque nas Exportacoes por meio de uma Migration_Flyway versionada.
2. WHEN o Analytics_Endpoint calcula o KPI `total_embarcado`, THE Analytics_Endpoint SHALL derivá-lo da soma de `total_amount` das Exportacoes marcadas como embarcadas pela Flag_Embarque que satisfazem os Filtros_Dashboard.
3. WHEN o Analytics_Endpoint calcula o KPI `total_pendente`, THE Analytics_Endpoint SHALL derivá-lo da soma de `total_amount` das Exportacoes não embarcadas que satisfazem os Filtros_Dashboard.
4. THE backend SHALL evoluir a entidade/domínio de Exportacao e os fluxos de criação e edição de exportação para registrar e atualizar a Flag_Embarque.
5. THE Analytics_Endpoint SHALL assegurar que a soma de `total_embarcado` e `total_pendente` seja consistente com o `total_exportacoes` do mesmo conjunto filtrado.

### Requirement 7: KPI de Alertas de Compliance a partir do módulo compliance real

**User Story:** Como analista de compliance, quero que o KPI de Alertas de Compliance reflita os screenings reais do módulo de compliance, para que eu veja o risco real da operação no dashboard.

#### Acceptance Criteria

1. WHEN o Analytics_Endpoint calcula o KPI `alertas_compliance`, THE Analytics_Endpoint SHALL derivá-lo da contagem de Screening_Compliance do tenant em estado pendente ou de alto risco.
2. THE Analytics_Endpoint SHALL restringir a contagem de Screening_Compliance aos dados do tenant corrente por meio de RLS_Tenant.
3. WHERE os Filtros_Dashboard de período se aplicam ao Screening_Compliance, THE Analytics_Endpoint SHALL restringir a contagem ao período informado.
4. THE Analytics_Endpoint SHALL NOT exibir alertas de compliance que não correspondam a Screening_Compliance reais.

### Requirement 8: Estado vazio honesto e tratamento de erro sem fallback para mock

**User Story:** Como operador do EIP, quero que o dashboard mostre zeros/estado vazio quando não houver dados e exiba o erro quando o backend falhar, para que eu nunca veja números inventados.

#### Acceptance Criteria

1. WHEN o Analytics_Endpoint retorna um Dashboard_Completo sem dados para o período filtrado, THE Dashboard_Tela SHALL exibir os KPIs com valor zero e os gráficos em estado vazio.
2. IF o Dashboard_Service retorna um erro ao solicitar o Dashboard_Completo, THEN THE Dashboard_Tela SHALL exibir uma mensagem de erro ao usuário.
3. IF o Dashboard_Service retorna um erro ao solicitar os Options_Filters, THEN THE Dashboard_Tela SHALL indicar que os filtros estão indisponíveis sem bloquear a exibição dos demais dados já carregados.
4. THE Dashboard_Tela SHALL NOT substituir dados reais ou um erro do backend por dados do Dashboard_Mock_Adapter quando `realApis.dashboard === true`.
5. WHILE uma solicitação de dados do dashboard está em andamento, THE Dashboard_Tela SHALL exibir um indicador de carregamento.

### Requirement 9: Segurança, RBAC, sessão e CSRF (não-funcional)

**User Story:** Como responsável por segurança, quero que o acesso ao dashboard use sessão autenticada, CSRF e RBAC existentes e que nenhum segredo exista no front, para que a integração não introduza vazamento de credenciais nem acesso indevido.

#### Acceptance Criteria

1. WHEN o Dashboard_Http_Service realiza uma chamada ao Analytics_Endpoint ou ao Catalogos_Endpoint, THE Dashboard_Http_Service SHALL enviar a requisição com o cookie de sessão e o cabeçalho CSRF `X-XSRF-TOKEN` anexados pelos interceptors existentes.
2. THE Analytics_Endpoint SHALL exigir autorização RBAC apropriada (ex.: `dashboards/principal` view, ou a view `exportacoes/gerenciar` existente) antes de retornar dados.
3. IF o backend recusa uma chamada por falta de autorização RBAC, THEN THE Dashboard_Tela SHALL exibir uma mensagem de acesso negado sem expor detalhes internos do backend.
4. THE Dashboard_Tela SHALL NOT conter nenhuma credencial, chave de API ou segredo no código do frontend.

### Requirement 10: Acessibilidade e locale pt-BR (não-funcional)

**User Story:** Como usuário que depende de tecnologias assistivas e opera em português, quero que os gráficos e filtros do dashboard sejam acessíveis e que os valores monetários sigam o locale pt-BR, para que eu consiga interpretar os dados corretamente.

#### Acceptance Criteria

1. THE Dashboard_Tela SHALL fornecer alternativa textual acessível para cada um dos três gráficos (por mês, por país, por produto), descrevendo os dados representados.
2. THE Dashboard_Tela SHALL permitir operação dos controles de filtro por teclado e associá-los a rótulos acessíveis.
3. WHEN a Dashboard_Tela exibe valores monetários dos KPIs e séries, THE Dashboard_Tela SHALL formatá-los no locale pt-BR com a moeda apropriada.
4. WHEN novos dados do dashboard são carregados após alteração de filtros, THE Dashboard_Tela SHALL anunciar a atualização por meio de uma região `aria-live`.

### Requirement 11: Explicitação do trabalho de backend, migrations e deploy

**User Story:** Como responsável técnico, quero que a spec deixe claro que esta feature exige backend novo, migrations e novo deploy, para que o tamanho e os riscos do trabalho sejam compreendidos antes da implementação.

#### Acceptance Criteria

1. THE spec SHALL declarar explicitamente que esta feature exige a criação do Analytics_Endpoint e do Catalogos_Endpoint novos no backend.
2. THE spec SHALL declarar explicitamente que esta feature exige novas Migration_Flyway para o Custo_Exportacao e para a Flag_Embarque.
3. THE spec SHALL declarar explicitamente que esta feature exige evolução da entidade/domínio de Exportacao e dos fluxos de criação e edição de exportação.
4. THE spec SHALL declarar explicitamente que esta feature exige um novo deploy do backend no Cloud Run (profile `cloud`) e que o backend roda localmente no profile `local`.
5. THE spec SHALL declarar explicitamente que o frontend exige a criação do token `DASHBOARD_SERVICE`, da flag `environment.realApis.dashboard`, da interface IDashboardService e do Dashboard_Http_Service.
