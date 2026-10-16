# Implementation Plan: Dashboard Principal — Integração (Escopos A + C)

## Overview

Este plano implementa a feature completa: a tela **Dashboard Principal** (`DashboardPrincipalComponent`, rota `/home-logged/dashboards/principal`) passa a consumir dados reais do backend **sem mock no caminho real**, e o backend (módulo `export`, Spring Modulith hexagonal, Java 21 / Spring Boot) é **evoluído** para alimentar de verdade os KPIs que hoje não têm fonte (lucro/margem via custo, embarcado/pendente via flag de embarque) e para integrar a contagem de compliance pela **API pública do módulo** `compliance`.

A ordem é **incremental e testável**, backend → frontend, respeitando as dependências entre arquivos:

1. Toolchain (fixar build verde e runner de testes).
2. Backend — schema + domínio (migration `V25`, `Exportacao`, `ExportacaoEntity`, `ExportacaoMapper`, fluxos criar/editar/confirmar, `MarcarEmbarqueUseCase` + endpoint de embarque).
3. Backend — módulo `compliance` (porta pública de contagem de alertas).
4. Backend — analytics do dashboard (porta OUT + adapter JPA de agregação + `Margem` + porta IN + service + BFF; deprecação do dashboard legado).
5. Frontend — flag, interface/token/provider, HTTP service, mock adapter, reconexão da tela, e evolução do fluxo de exportação para custo/embarque.
6. Testes de propriedade/exemplo/arquitetura.
7. Checkpoints + deploy.

Linguagem de implementação: **Java 21 / Spring Boot** (backend) e **TypeScript / Angular 20** (frontend) — já definida no design, nenhuma seleção de linguagem necessária.

### Decisões definitivas fixadas no design (sempre visíveis)

- **Embarque = flag booleana `shipped` + `shipped_at`** (ortogonal ao enum `ExportacaoStatus`), não um novo estado do enum. Custo = `total_cost` no cabeçalho de `export` (nullable, ausente ⇒ zero).
- **Agregação pushdown no Postgres** (`GROUP BY`/`SUM`/`COUNT` + interface projections), espelhando `AiUsageAnalyticsAdapter` — **nunca** carregar linhas individuais como o legado `dashboard()` (até 10.000 linhas).
- **Compliance via API pública do módulo** (`ComplianceAlertCountPort`) — nunca query cross-módulo direta às tabelas do compliance (Spring Modulith).
- **Margem com guarda de divisão por zero** (`Margem.calcular`: receita 0 ⇒ 0, HALF_UP). Percentual por país derivado na aplicação.
- **Idempotência**: `marcarEmbarcado` é no-op quando já embarcado; optimistic locking (`@Version`) + `ConcurrentModificationConflictException` → 409; POST de embarque aceita `Idempotency-Key` (reuso de `IdempotencyService`).

### Convenções deste plano

- Tarefas marcadas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido; o agente NÃO as implementa automaticamente.
- Tarefas que editam código Java/SQL/TS DEVEM ser feitas via ferramentas de edição de arquivo / subagente de execução. **NUNCA** editar esses arquivos via PowerShell (risco de corrupção UTF-8).
- Raiz dos pacotes backend do módulo: `backend/src/main/java/com/eip/modules/export/`. Migrations: `backend/src/main/resources/db/migration/` (próxima `V25` — a última aplicada é `V24`).
- Serviços do front vivem em `src/app/services/dashboard/` (ou equivalente ao padrão de `ai`); tipos em `src/types/dashboard.ts` (reusados, sem mudança de shape).

### Restrições globais (sempre visíveis)

- **Mock é o padrão da demo.** O `DashboardMockAdapter` só é injetado quando `realApis.dashboard === false`; com a flag `true` **nenhum** fallback mock pode ocorrer, nem mesmo em erro (Req 8.4).
- **RLS por tenant.** Todas as agregações e catálogos ficam restritos ao tenant corrente via RLS; nenhum `organization_id` manual além do que a RLS já aplica.
- **Migrations aditivas e idempotentes.** `V25` usa `ADD COLUMN IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` (padrão do `V22`); não altera RLS.
- **GET sem efeito colateral.** `Analytics_Endpoint` e `Catalogos_Endpoint` são `GET` idempotentes (ETag opcional, não obrigatório).

## Tasks

- [ ] 0. Verificação do toolchain de build (pré-requisito)
  - [x] 0.1 Confirmar o comando canônico de build verde do backend e o runner de testes do front
    - Verificar ausência de Maven local; fixar o build verde do backend como `docker compose -f backend/docker-compose.yml build --no-cache app` (compila o módulo `export` e todos os call sites dentro da imagem).
    - Fixar o runner de testes do front em execução única: `npm test -- --watch=false --browsers=ChromeHeadless`.
    - Registrar que tarefas `*` (jqwik no backend, fast-check no front) são ESCRITAS mas podem não rodar localmente sem JDK 21/Maven; documentar o fallback nas notas.
    - _Requirements: 11.4_

- [ ] 1. Backend — schema de custo e embarque (migration `V25`)
  - [x] 1.1 Criar `V25__export_cost_and_shipment.sql` (aditiva, idempotente)
    - Arquivo: `backend/src/main/resources/db/migration/V25__export_cost_and_shipment.sql`.
    - `ALTER TABLE export ADD COLUMN IF NOT EXISTS total_cost numeric(18,2)`; `shipped boolean NOT NULL DEFAULT false`; `shipped_at timestamptz`.
    - `CREATE INDEX IF NOT EXISTS idx_export_org_country ON export (organization_id, destination_country)`; `idx_export_org_shipped ON export (organization_id, shipped)`; `idx_export_item_product ON export_item (product_id)`.
    - `total_cost` nullable (ausente ⇒ zero no analytics); `shipped` default `false` (exportações antigas contam como pendentes). Editar via ferramenta de arquivo (nunca PowerShell).
    - _Requirements: 5.1, 6.1, 2.5, 2.6, 6.2, 6.3_

- [ ] 2. Backend — evolução de domínio de `Exportacao` (custo + embarque)
  - [x] 2.1 Evoluir o POJO de domínio `Exportacao`
    - Arquivo: `domain/model/Exportacao.java`.
    - Adicionar `totalCost (BigDecimal, nullable)`, `shipped (boolean)`, `shippedAt (OffsetDateTime, nullable)`; método idempotente `marcarEmbarcado(OffsetDateTime quando)` (no-op se já `shipped`); `definirCusto(BigDecimal custo)` com validação de não-negativo. Manter o domínio livre de JPA.
    - _Requirements: 5.5, 6.4_

  - [x] 2.2 Evoluir a `ExportacaoEntity` com as colunas novas
    - Arquivo: `adapter/out/persistence/ExportacaoEntity.java`.
    - Mapear `total_cost`, `shipped`, `shipped_at` como colunas; preservar `@Version` existente.
    - _Requirements: 5.5, 6.4_

  - [x] 2.3 Propagar os campos no `ExportacaoMapper`
    - Arquivo: `adapter/out/persistence/ExportacaoMapper.java`.
    - `toEntity`/`toDomain` propagando `totalCost`/`shipped`/`shippedAt` em ambos os sentidos.
    - _Requirements: 5.5, 6.4_

- [ ] 3. Backend — capturar custo na criação/edição
  - [x] 3.1 Capturar `Custo_Exportacao` nos comandos/fluxos de criação
    - Arquivos: `domain/port/in/CriarExportacaoUseCase.java` (campo de custo no `CriarExportacaoCommand`), `adapter/in/bff/.../CriarExportacaoRequest.java` (BFF) e `application/ExportacaoService.java` (`criar`) + `ExportacaoView` para capturar/preservar o custo.
    - _Requirements: 5.5_

- [ ] 4. Backend — caso de uso de marcação de embarque (idempotente)
  - [x] 4.1 Criar `MarcarEmbarqueUseCase` (porta IN) + implementação
    - Arquivos: `domain/port/in/MarcarEmbarqueUseCase.java` (`marcarEmbarcado(UUID exportId, OffsetDateTime quando)` → `ExportacaoView`) e implementação no `application/ExportacaoService.java`: carregar via `repo.porId`, chamar `marcarEmbarcado(...)`, persistir; idempotência garantida por domínio (no-op) + optimistic locking.
    - _Requirements: 6.4_

  - [x] 4.2 Expor endpoint BFF de embarque com `Idempotency-Key`
    - Arquivo: `adapter/in/bff/ExportacaoBffController.java` — `POST /{id}/embarcar` aceitando `Idempotency-Key` (reusar `IdempotencyService`, mesmo padrão de `criar`); traduzir `ConcurrentModificationConflictException` → `409 Conflict`.
    - _Requirements: 6.4_

- [ ] 5. Backend — porta pública de contagem no módulo `compliance` (Modulith)
  - [x] 5.1 Adicionar/expor `ComplianceAlertCountPort` na API pública do compliance
    - Arquivo (módulo `compliance`): porta/caso de uso público `ComplianceAlertCountPort` com `long contarAlertas(OffsetDateTime from, OffsetDateTime to)` contando `Screening_Compliance` do tenant em estado pendente ou de alto risco, sob RLS. Se já existir contagem equivalente, reusar; senão adicionar à API pública (nunca acesso cross-schema).
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 6. Backend — porta de leitura/agregação do dashboard (ISP/DIP)
  - [x] 6.1 Criar a porta OUT `DashboardAnalyticsPort` e seus records
    - Arquivo: `domain/port/out/DashboardAnalyticsPort.java`.
    - Métodos `aggregateKpis`, `aggregateByMonth`, `aggregateByCountry`, `aggregateByProduct`, `distinctCountries`, `distinctProducts`, `distinctCustomers`; records `ExportFilter`, `KpiAggregate`, `MonthlyBucket`, `CountryBucket`, `ProductBucket`, `CatalogoRow`. Separada da porta de escrita `ExportacaoRepositoryPort` (ISP).
    - _Requirements: 2.1_

- [ ] 7. Backend — repositório e adapter JPA de agregação (pushdown)
  - [x] 7.1 Criar `ExportAnalyticsJpaRepository` com `@Query` JPQL + projections
    - Arquivo: `adapter/out/persistence/ExportAnalyticsJpaRepository.java`.
    - `aggregateKpis` (uma passada: `SUM(total_amount)`, `SUM(CASE WHEN shipped...)`, `SUM(CASE WHEN NOT shipped...)`, `SUM(total_amount - COALESCE(total_cost,0))`, `COUNT` condicional de `CONFIRMADA`), `aggregateByMonth` (`GROUP BY date_trunc('month', created_at)`), `aggregateByCountry` (`GROUP BY destination_country`), `aggregateByProduct` (join `export_item` + `GROUP BY product_id`/`description`, `SUM(quantity*unit_price)`), e `distinctCountries/Products/Customers`; interface projections (`KpiProjection`, `MonthlyProjection`, `CountryProjection`, `ProductProjection`). Filtros opcionais via `(:param is null or ...)`; agregação pushdown (sem carregar linhas).
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 5.2, 6.2, 6.3, 4.3, 4.4, 4.5_

  - [x] 7.2 Criar `DashboardAnalyticsJpaAdapter` implementando a porta
    - Arquivo: `adapter/out/persistence/DashboardAnalyticsJpaAdapter.java`.
    - `@Component` delegando ao repositório; mapear projections → records com `coalesce` de nulos; não materializar linhas individuais.
    - _Requirements: 2.7, 4.6_

- [ ] 8. Backend — lógica pura de margem
  - [x] 8.1 Criar `Margem` (cálculo puro, testável por propriedade)
    - Arquivo: `domain/model/Margem.java`.
    - `calcular(BigDecimal lucro, BigDecimal receita)`: receita nula/zero ⇒ `BigDecimal.ZERO`; senão `lucro.divide(receita, 6, HALF_UP)`; sem exceção de divisão.
    - _Requirements: 5.3, 5.4_

- [ ] 9. Backend — caso de uso e serviço de analytics do dashboard
  - [x] 9.1 Criar `DashboardAnalyticsUseCase` (porta IN) e seus records de view
    - Arquivo: `domain/port/in/DashboardAnalyticsUseCase.java`.
    - `analytics(DashboardQuery)` → `DashboardAnalyticsView` e `catalogos()` → `OptionsFiltersView`; records `DashboardQuery`, `DashboardAnalyticsView`, `KpisView`, `SerieMesView`/`SeriePaisView`/`SerieProdutoView`, `OptionsFiltersView`/`CatalogoItem`.
    - _Requirements: 2.1, 3.1_

  - [x] 9.2 Implementar `DashboardAnalyticsService` compondo KPIs + séries
    - Arquivo: `application/DashboardAnalyticsService.java`.
    - `@Service` + `@Transactional(readOnly = true)`: converter `DashboardQuery` → `ExportFilter`, agregar KPIs/mês/país/produto via `DashboardAnalyticsPort`, calcular lucro (`receita - custo`) e margem via `Margem`, derivar percentual por país na aplicação, e obter `alertas_compliance` via `ComplianceAlertCountPort`.
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.2, 3.3, 3.4, 3.5, 5.2, 5.3, 5.6, 6.2, 6.3, 6.5, 7.1_

- [ ] 10. Backend — endpoints BFF do dashboard
  - [x] 10.1 Criar `DashboardBffController` (analytics + catálogos)
    - Arquivo: `adapter/in/bff/DashboardBffController.java`.
    - `GET /bff/dashboards/principal` (params `dataInicio`/`dataFim`/`paises`/`produtos`/`clientes`) e `GET /bff/dashboards/principal/filtros`; RBAC `@rbac.can('dashboards/principal','view') or @rbac.can('exportacoes/gerenciar','view')`.
    - _Requirements: 2.1, 3.1, 4.1, 4.2, 9.1, 9.2_

  - [x] 10.2 Deprecar o dashboard legado para parar de carregar 10.000 linhas
    - Arquivo: `adapter/in/bff/.../ExportacaoBffController.java` (endpoint `GET /bff/exportacoes/dashboard`) + `application/ExportacaoService.java` (`dashboard()`).
    - Marcar `@Deprecated` e redirecionar/delegar a contagem à nova porta de agregação (parar de usar `repo.listar(org, null, 0, 10000)`); citar o gargalo corrigido. Tarefa normal (não `*`).
    - _Requirements: 2.1_

- [ ] 11. Checkpoint — backend completo em build verde
  - Build verde do backend via `docker compose -f backend/docker-compose.yml build --no-cache app`; confirmar migration `V25`, domínio evoluído, portas/adapter/serviço/BFF e porta pública do compliance compilando. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 11.4_

- [ ] 12. Frontend — flag de ambiente
  - [x] 12.1 Adicionar `realApis.dashboard` em dev e prod
    - Arquivos: `src/environments/environment.ts` e `src/environments/environment.prod.ts`.
    - Adicionar `realApis.dashboard` (`true` em dev/prod; `false` apenas para demo local com mock).
    - _Requirements: 1.3, 1.4, 11.5_

- [ ] 13. Frontend — interface, token DI e provider
  - [x] 13.1 Criar `IDashboardService` + `DASHBOARD_SERVICE`
    - Arquivo: `src/app/services/dashboard/dashboard-service.token.ts` (ou equivalente ao padrão `AI_SERVICE`).
    - Definir `IDashboardService` (`getDashboardData(filtros?)`, `getOptionsFilters()`) e `DASHBOARD_SERVICE = new InjectionToken<IDashboardService>(...)`.
    - _Requirements: 1.1, 1.5_

  - [x] 13.2 Registrar o provider resolvido por flag em `app.config.ts`
    - Arquivo: `src/app/app.config.ts`.
    - `provide: DASHBOARD_SERVICE, useClass: environment.realApis?.dashboard ? DashboardHttpService : DashboardMockAdapter` (mesmo padrão de `AI_SERVICE`/`EXPORTACAO_SERVICE`).
    - _Requirements: 1.3, 1.4_

- [ ] 14. Frontend — adapters de dados
  - [x] 14.1 Implementar `DashboardHttpService` (real, sem fallback mock)
    - Arquivo: `src/app/services/dashboard/dashboard-http.service.ts`.
    - `getDashboardData` → `GET ${bffBaseUrl}/bff/dashboards/principal` e `getOptionsFilters` → `.../filtros`; converter `FiltrosDashboard` → query params (período ISO, listas de países/produtos/clientes); mapear `DashboardAnalyticsView` → `DashboardCompleto`; erros sobem normalizados (`AiFriendlyError`), **nunca** fallback mock quando `realApis.dashboard === true`.
    - _Requirements: 1.3, 2.1, 3.1, 4.1, 4.2, 9.1_

  - [x] 14.2 Implementar `DashboardMockAdapter` (fallback demo-safe)
    - Arquivo: `src/app/services/dashboard/dashboard-mock.adapter.ts`.
    - `extends DashboardMockService implements IDashboardService` — reusar o mock determinístico existente; ativo apenas quando `realApis.dashboard === false`.
    - _Requirements: 1.4_

- [ ] 15. Frontend — reconexão da tela
  - [x] 15.1 Reconectar `DashboardPrincipalComponent` ao `DASHBOARD_SERVICE`
    - Arquivo: `src/app/components/dashboards/dashboard-principal/dashboard-principal.component.ts` (+ template).
    - Injetar `DASHBOARD_SERVICE` (remover injeção direta de `DashboardMockService` e quaisquer dados hardcoded de KPIs/séries/opções); solicitar `getOptionsFilters()` na init; re-solicitar `getDashboardData(filtros)` em mudança de filtro e em "Limpar Filtros" (sem restrições); estado vazio honesto (zeros + gráficos vazios), erro exibido **sem** fallback, indicador de carregamento; `aria-live` ao atualizar; alternativa textual acessível por gráfico; controles de filtro operáveis por teclado com rótulos; formatação pt-BR dos valores monetários.
    - _Requirements: 1.1, 1.2, 1.6, 3.6, 3.7, 8.1, 8.2, 8.3, 8.5, 9.3, 10.1, 10.2, 10.3, 10.4_

- [ ] 16. Frontend — captura de custo e embarque no fluxo de exportação
  - [ ] 16.1 Evoluir o formulário/fluxo de exportação para custo e embarque
    - Arquivos: tela/diálogo de cadastro/edição de exportação em `src/app/.../exportacoes/gerenciar/*`.
    - Adicionar campo de custo (`Custo_Exportacao`) ao form de criar/editar (enviado ao BFF) e ação de "marcar embarque" chamando o endpoint `POST /{id}/embarcar`; refletir estado embarcado/pendente na UI.
    - _Requirements: 5.5, 6.4_

- [ ] 17. Checkpoint — frontend em build verde
  - Build do front (`tsc`/`ng build`) e testes de exemplo se o runner permitir (`npm test -- --watch=false --browsers=ChromeHeadless`); confirmar a tela consumindo o `DASHBOARD_SERVICE` sem mock no caminho real. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 11.4_

- [ ] 18. Testes (opcionais) — propriedades, exemplo e arquitetura
  - [ ]* 18.1 Teste de propriedade — invariância da agregação (Property 1)
    - **Property 1: Invariância da agregação** — *para qualquer* conjunto de exportações e qualquer dimensão (mês/país/produto), `sum(grupos) == sum(total)` do mesmo conjunto filtrado; para país, `sum(percentual) ~= 100%` (ou 0% se vazio). Parametrizar por dimensão.
    - jqwik (backend), ≥100 iterações. Tag: `Feature: dashboard-principal-integracao, Property 1`.
    - **Validates: Requirements 2.2, 2.5, 2.6**

  - [ ]* 18.2 Teste de propriedade — margem e lucro (Property 2)
    - **Property 2: Cálculo de margem e lucro** — *para qualquer* receita e custo (incluindo receita=0 e custo null), `lucro == receita - coalesce(custo,0)` e `margem == lucro/receita` quando receita>0, exatamente 0 quando receita=0, sem exceção.
    - jqwik (backend; fast-check no front se o mapeamento for replicado em `DashboardHttpService`), ≥100 iterações. Tag: `Feature: dashboard-principal-integracao, Property 2`.
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.6**

  - [ ]* 18.3 Teste de propriedade — partição embarcado/pendente (Property 3)
    - **Property 3: Partição embarcado/pendente** — *para qualquer* conjunto filtrado, `sum(embarcado) + sum(pendente) == sum(total)` (`total_exportacoes`).
    - jqwik (backend), ≥100 iterações. Tag: `Feature: dashboard-principal-integracao, Property 3`.
    - **Validates: Requirements 6.2, 6.3, 6.5**

  - [ ]* 18.4 Teste de propriedade — idempotência da marcação de embarque (Property 4)
    - **Property 4: Idempotência da marcação de embarque** — *para qualquer* exportação, aplicar `marcarEmbarcado` 1× e 2× produz o mesmo estado final (`shipped=true`, `shipped_at` estável); mesma `Idempotency-Key` ⇒ sem efeito adicional.
    - jqwik (backend), ≥100 iterações. Tag: `Feature: dashboard-principal-integracao, Property 4`.
    - **Validates: Requirements 6.4**

  - [ ]* 18.5 Teste ArchUnit — fronteira do módulo compliance
    - Regra: nenhuma classe do módulo `export` depende de tabelas/entidades do módulo `compliance` diretamente; o acesso ocorre apenas via a porta pública `ComplianceAlertCountPort`. Incluir guarda de que o caminho de analytics não usa `repo.listar(...)` com limite grande (regressão do gargalo).
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 18.6 Testes de exemplo do dashboard (DI/sem-mock, filtros, estados, pt-BR/aria)
    - Cobrir: provider resolve `DashboardHttpService` com `realApis.dashboard=true` sem instanciar o mock; propagação de filtros e "Limpar Filtros"; zeros/vazio, erro sem fallback, filtros indisponíveis sem bloquear, loading; formatação pt-BR, alternativa textual por gráfico e `aria-live`; contagem de compliance via porta pública mockada (1–3 exemplos).
    - _Requirements: 1.1, 1.2, 1.4, 3.6, 3.7, 7.1, 8.1, 8.2, 8.3, 8.4, 8.5, 10.1, 10.3, 10.4_

- [ ] 19. Checkpoint — ecossistema completo em build verde
  - Build verde do backend (Docker) e build/testes do front se possível; confirmar tela consumindo serviços reais via token DI, nenhum mock no caminho real, e os 7 KPIs + 3 séries derivados do backend real. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 11.4_

- [ ] 20. Deploy e validação (exige credenciais/ambiente cloud)
  - [ ] 20.1 Build da nova imagem do backend
    - Executar `docker compose -f backend/docker-compose.yml build --no-cache app` para gerar a imagem contendo o domínio evoluído, as portas/adapter/serviço/BFF e a migration `V25`.
    - _Requirements: 11.4_

  - [ ] 20.2 Publicar nova revisão no Cloud Run via o CD existente
    - **Exige ambiente/credenciais cloud (não executável pelo agente sem credenciais).** Disparar o fluxo normal de release de `.github/workflows/cd.yml` (nova imagem → nova revisão Cloud Run, profile `cloud`). A migration `V25` é aplicada no startup pelo Flyway (aditiva/idempotente).
    - _Requirements: 11.4_

  - [ ] 20.3 Confirmar `realApis.dashboard === true` e validação E2E sem mock
    - **Exige ambiente cloud + ADC.** Garantir `realApis.dashboard === true` no ambiente alvo; validar E2E (automatizada quando possível) a Dashboard_Tela consumindo o backend real, sem dados mockados, com os erros reais subindo à tela.
    - _Requirements: 11.4_

- [ ] 21. Checkpoint final
  - Confirmar deploy, migration `V25` aplicada (colunas/índices presentes) e validação E2E da tela sem mock. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 11.4_

## Notes

- Tarefas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido; o agente NÃO as implementa automaticamente.
- **Mock-default / demo-safety:** o `DashboardMockAdapter` só é injetado quando `realApis.dashboard === false`; com a flag `true` nenhum fallback mock ocorre, nem em erro (Req 8.4).
- **RLS por tenant:** todas as agregações/catálogos ficam restritos ao tenant corrente; nenhum `organization_id` manual além do que a RLS aplica.
- **Performance:** o novo `Analytics_Endpoint` usa agregação pushdown (`GROUP BY`/`SUM`/`COUNT` + projections), nunca materializando linhas individuais; o legado `dashboard()` é deprecado (tarefa 10.2) para parar de carregar 10.000 linhas.
- **Modularidade (Modulith):** a contagem de compliance passa pela porta pública `ComplianceAlertCountPort` (tarefa 5.1), verificada por ArchUnit (tarefa 18.5); nunca query cross-schema.
- **Edição segura:** arquivos Java/SQL/TS são editados apenas por ferramentas de edição / subagente; nunca via PowerShell (corrupção UTF-8).
- **Toolchain:** sem Maven local — build verde do backend via `docker compose -f backend/docker-compose.yml build --no-cache app`; runner do front via `npm test -- --watch=false --browsers=ChromeHeadless`. Testes `*` (jqwik/fast-check) são ESCRITOS mas podem não rodar localmente sem JDK 21/Maven.
- **Etapas que exigem credenciais/ambiente cloud:** 20.2 (deploy Cloud Run via CD) e 20.3 (flags + validação E2E com ADC). O agente NÃO as executa sem credenciais.
- **Testes de propriedade (4):** Property 1 (invariância de agregação, 18.1), Property 2 (margem/lucro, 18.2), Property 3 (partição embarcado/pendente, 18.3), Property 4 (idempotência de embarque, 18.4). jqwik no backend e fast-check no front, ≥100 iterações.
- **Serialização de edições no mesmo arquivo:** `ExportacaoService.java` é tocado por 3.1 → 4.1 → 10.2 (waves distintas); `ExportacaoBffController.java` por 4.2 → 10.2 (waves distintas); `app.config.ts` (13.2) e `environment*.ts` (12.1) em waves próprias; cada arquivo de domínio/adapter novo é escrito uma única vez.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["0.1"] },
    { "id": 1, "tasks": ["1.1", "5.1", "12.1"] },
    { "id": 2, "tasks": ["2.1", "6.1", "8.1", "13.1"] },
    { "id": 3, "tasks": ["2.2", "7.1", "9.1", "14.2"] },
    { "id": 4, "tasks": ["2.3", "7.2"] },
    { "id": 5, "tasks": ["3.1", "9.2"] },
    { "id": 6, "tasks": ["4.1", "10.1", "14.1"] },
    { "id": 7, "tasks": ["4.2", "13.2"] },
    { "id": 8, "tasks": ["10.2", "15.1"] },
    { "id": 9, "tasks": ["16.1", "18.1", "18.2", "18.3", "18.4", "18.5", "18.6"] },
    { "id": 10, "tasks": ["20.1"] },
    { "id": 11, "tasks": ["20.2"] },
    { "id": 12, "tasks": ["20.3"] }
  ]
}
```
