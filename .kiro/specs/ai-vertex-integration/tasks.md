# Implementation Plan: AI Vertex Integration

## Overview

Este plano implementa a integração real do Vertex AI (Gemini via `generateContent` REST v1 com ADC) no AI Hub do backend EIP (Java 21 / Spring Boot, monólito modular hexagonal com Spring Modulith), evoluindo o contrato `AiResult` para telemetria real de tokens, introduzindo thinking level de primeira classe, policy/prompt na camada de aplicação, extração estruturada, reconciliação determinística, resiliência, idempotência e FinOps versionado.

A entrega é fasada (Fase 0 → 5), com **checkpoints de build verde** entre fases. Cada mudança de contrato é propagada a TODOS os call sites para manter o build verde, o `MockAiGatewayAdapter` permanece o bean padrão (`@Profile("!cloud")`) e o RLS do worker `ai_job` NÃO é tocado.

Linguagem de implementação: **Java 21 / Spring Boot** (já definida no design — nenhuma seleção de linguagem necessária).

### Convenções deste plano

- Tarefas marcadas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido; o agente NÃO as implementa automaticamente.
- Tarefas que editam código Java/SQL/TS DEVEM ser feitas via ferramentas de edição de arquivo / subagente `spec-task-execution`. **NUNCA** editar esses arquivos via PowerShell (risco de corrupção UTF-8).
- Checkpoints de build verde preferem `./mvnw` (ou `mvn`) para compilar/testar; o efeito real no runtime do backend só ocorre após `docker compose build --no-cache app`.
- Raiz dos pacotes: `backend/src/main/java/com/eip/modules/ai/`.

### Restrições globais (sempre visíveis)

- **Mock é o padrão da demo.** `MockAiGatewayAdapter` continua `@Profile("!cloud")`. Nenhuma tarefa pode remover esse comportamento (Req 1.2, 13.1).
- **Não tocar no RLS do worker `ai_job`.** `AiJobWorker`/`AiJobProcessor` e seu `FORCE ROW LEVEL SECURITY` estão corretos (Req 12.1).
- **V19 é aditiva.** Não recriar `idempotency_key`/`provider_cost`; não alterar nenhuma política RLS (Req 12.2, 12.3, 12.5).

## Tasks

- [x] 0. Verificação do toolchain de build (pré-requisito)
  - [x] 0.1 Verificar disponibilidade de Maven e fixar o comando de build
    - Verificar se `backend/mvnw`/`mvnw.cmd` existe (CONFIRMADO AUSENTE no ambiente atual) e se `mvn` está no PATH (`mvn -v`).
    - Se nenhum estiver disponível, registrar que os checkpoints de "build verde" só poderão ser validados via `docker compose build --no-cache app` e que testes locais podem não rodar neste ambiente.
    - Definir o comando canônico de compile/test a ser usado nos checkpoints (`./mvnw -q -pl backend compile` / `mvn -q -f backend/pom.xml test`) e documentá-lo nas notas.
    - NÃO assumir que os testes podem rodar; registrar o fallback escolhido.
    - _Requirements: 15.3_

- [x] 1. Fase 0 — Fundação (evolução de contrato, sem mudança de comportamento)
  - [x] 1.1 Evoluir o record `AiResult` com telemetria + factory de compatibilidade
    - Arquivo: `domain/model/AiResult.java`.
    - Adicionar campos `promptTokens, outputTokens, thinkingTokens, totalTokens, finishReason, latencyMs`, mantendo `inputUnits`/`outputUnits`/`ocrPages`.
    - Adicionar factory estático `AiResult.of(...)` que deriva `inputUnits==promptTokens` e `outputUnits==outputTokens` (invariante de compatibilidade com o ledger).
    - Garantir conceitualmente a invariante `totalTokens >= promptTokens + outputTokens`.
    - _Requirements: 3.2, 3.3, 15.2_

  - [x] 1.2 Adicionar `AiThinkingLevel`, `AiExecutionPolicy` e `AiPromptSpec`
    - Arquivos novos em `domain/model/`: `AiThinkingLevel.java` (enum `LOW, MEDIUM, HIGH`), `AiExecutionPolicy.java` (record `model, thinkingLevel, maxOutputTokens, timeout, maxRetries` + `defaults(AiModel)`), `AiPromptSpec.java` (record `systemInstruction, userPrompt, responseSchemaJson, promptVersion` + `passthrough(AiRequest)`).
    - NÃO alterar o record `AiModel` (decisão de design: thinking vive na policy).
    - `defaults(...)` deve retornar `maxRetries <= 1`.
    - _Requirements: 4.1, 4.2, 5.1, 6.1_

  - [x] 1.3 Evoluir `AiGatewayPort` com a nova sobrecarga `run(...)` + default method legado
    - Arquivo: `domain/port/out/AiGatewayPort.java`.
    - Adicionar `AiResult run(AiModel, AiRequest, AiExecutionPolicy, AiPromptSpec)`.
    - Manter `run(AiModel, AiRequest)` como `default` que delega para a nova assinatura usando `AiExecutionPolicy.defaults(model)` e `AiPromptSpec.passthrough(request)`.
    - _Requirements: 1 (contrato de porta), 13.2_

  - [x] 1.4 Atualizar `MockAiGatewayAdapter` para o novo contrato (padrão da demo)
    - Arquivo: `adapter/out/ai/MockAiGatewayAdapter.java`.
    - Implementar a nova sobrecarga `run(model, request, policy, prompt)` mantendo `@Profile("!cloud")` e os MESMOS outputs determinísticos por tarefa.
    - Produzir telemetria coerente via `AiResult.of(...)` (ex.: `promptTokens = input.length()`, `finishReason = "STOP"`).
    - NOTA: este adapter é o bean padrão da demo — não alterar o profile nem os outputs observáveis (Req 13.3).
    - _Requirements: 13.1, 13.3, 15.1_

  - [x] 1.5 Atualizar `AiHubService` (analyze/usagePayload) para compilar com o novo contrato
    - Arquivo: `application/AiHubService.java`.
    - Ajustar `analyze` e `usagePayload` para o novo `AiResult`; `AnalysisView` continua expondo `inputUnits/outputUnits/ocrPages` (sem adicionar novos campos à view nesta fase).
    - Nesta fase o fluxo permanece funcionalmente idêntico (sem policy/prompt/preço reais ainda) — apenas compila com o contrato novo.
    - _Requirements: 13.4, 15.1_

  - [x] 1.6 Atualizar `AiUsageLedgerAdapter.record(...)` para o novo contrato
    - Arquivo: `adapter/out/persistence/AiUsageLedgerAdapter.java`.
    - Ajustar a assinatura/uso de `record` para aceitar o novo `AiResult` mantendo o mapeamento atual de `input_units`/`output_units` (telemetria nova entra na Fase 1).
    - _Requirements: 15.1_

  - [ ]* 1.7 Teste unitário do factory e invariantes de `AiResult`
    - Verificar `inputUnits==promptTokens`, `outputUnits==outputTokens`, `totalTokens >= promptTokens+outputTokens` para `AiResult.of(...)`.
    - _Requirements: 3.2, 3.3, 15.2_

  - [ ]* 1.8 Teste de propriedade — compatibilidade de metering (Property 1)
    - **Property 1: Compatibilidade de metering no ledger** — *para todo* `AiResult` criado via `of(...)`, as invariantes de compatibilidade valem.
    - Biblioteca: jqwik, mínimo 100 iterações. Tag: `Feature: ai-vertex-integration, Property 1`.
    - **Validates: Requirements 3.2, 3.3, 15.2**

- [x] 2. Checkpoint — Build verde Fase 0
  - Compilar o módulo `ai` (`./mvnw`/`mvn` conforme tarefa 0.1); rodar testes se o toolchain permitir.
  - Garantir que todos os call sites compilam após a evolução de `AiResult`. Ask the user if questions arise.
  - _Requirements: 15.3_

- [x] 3. Fase 1 — Metering real e migração V19
  - [x] 3.1 Criar migração `V19__ai_telemetry.sql` (aditiva)
    - Arquivo: `backend/src/main/resources/db/migration/V19__ai_telemetry.sql`.
    - `ALTER TABLE ai_usage_event ADD COLUMN thinking_tokens bigint NOT NULL DEFAULT 0; total_tokens bigint NOT NULL DEFAULT 0; finish_reason text; latency_ms bigint;`
    - Opcional por slot de router: `ALTER TABLE ai_model_config ADD COLUMN thinking_level text; max_output_tokens int;`
    - NÃO recriar `idempotency_key`/`provider_cost`; NÃO alterar RLS; manter `ai_model_config` GLOBAL e a `unique(task, priority)` de V8.
    - Editar via ferramenta de arquivo (nunca PowerShell — risco de corrupção UTF-8).
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

  - [x] 3.2 Mapear telemetria nova em `AiUsageEventEntity`
    - Arquivo: `adapter/out/persistence/AiUsageEventEntity.java`.
    - Adicionar campos/colunas `thinkingTokens`, `totalTokens`, `finishReason`, `latencyMs` mapeados para as colunas novas.
    - _Requirements: 3.4_

  - [x] 3.3 Gravar telemetria no `AiUsageLedgerAdapter`
    - Arquivo: `adapter/out/persistence/AiUsageLedgerAdapter.java`.
    - Persistir `promptTokens/outputTokens` em `input_units/output_units` e `thinkingTokens/totalTokens/finishReason/latencyMs` nas colunas correspondentes.
    - _Requirements: 3.4_

  - [ ]* 3.4 Teste unitário do mapeamento do ledger
    - Dado um `AiResult` com telemetria, verificar que a entidade gravada reflete tokens e `finish_reason`/`latency_ms`.
    - _Requirements: 3.4_

- [x] 4. Checkpoint — Build verde Fase 1
  - Compilar/testar conforme tarefa 0.1; validar que a V19 é aditiva e o mapeamento compila. Ask the user if questions arise.
  - _Requirements: 15.3_

- [x] 5. Fase 2 — Adapter Vertex (nova capacidade central)
  - [x] 5.1 Adicionar dependências no `pom.xml` (versões fixadas)
    - Arquivo: `backend/pom.xml`.
    - Adicionar `google-auth-library` (ADC) e `resilience4j` (TimeLimiter/Retry/CircuitBreaker/Bulkhead), fixando versões e verificando compatibilidade com o BOM/Spring Boot existente.
    - _Requirements: 1.4, 9.1, 14.1_

  - [x] 5.2 Criar `VertexAiProperties` + `application-cloud.yml`
    - Arquivos: `adapter/out/ai/VertexAiProperties.java` (`project`, `location`, `endpoint`, `apiVersion`) e `backend/src/main/resources/application-cloud.yml`.
    - project/location/model/thinking como CONFIG (env vars/YAML/`ai_model_config`), nunca literais Java. Valores alvo: `project=eip-ai-dev`, `location=global`, `model=gemini-3.8-flash` via config.
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 5.3 Implementar `AiExecutionPolicyResolver` (application)
    - Arquivos: `domain/port/.../AiExecutionPolicyResolver.java` (interface) + impl em `application/`.
    - Usar `ModelRouterPort.resolve(task)`; derivar thinking de `AiPriority` (`FAST→LOW`, `STANDARD→MEDIUM`, `DEEP→HIGH`) com override de config; `maxOutputTokens`/`timeout`/`maxRetries(<=1)` de config.
    - _Requirements: 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

  - [x] 5.4 Implementar `AiPromptRegistry` (application/domain)
    - Arquivos: interface `AiPromptRegistry` + impl; guardar system instruction, template de user prompt e `responseSchema` por tarefa; expor `promptVersion(task)`.
    - _Requirements: 6.1, 6.2_

  - [x] 5.5 Implementar `VertexAiGatewayAdapter` (`@Profile("cloud")`)
    - Arquivo: `adapter/out/ai/VertexAiGatewayAdapter.java`.
    - Montar `GenerateContentRequest` a partir de `AiPromptSpec` + `AiExecutionPolicy` (`thinkingConfig`, `generationConfig.maxOutputTokens`, `responseMimeType=application/json` + `responseSchema` quando presente).
    - Autenticar via ADC (bearer token), `POST .../models/{model}:generateContent` (REST v1).
    - Mapear `usageMetadata` → telemetria de `AiResult` (via um `AiTelemetryMapper`).
    - Adapter NÃO conhece NCM/Invoice/Pedido — recebe prompt pronto.
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 3.1, 6.3, 6.4_

  - [x] 5.6 Aplicar resiliência Resilience4j no adapter Vertex
    - Anotar a chamada com `@TimeLimiter`, `@Retry` (máx. 1 retry, apenas Transient_Failure allow-listed), `@CircuitBreaker`, `@Bulkhead`; configurar em `application-cloud.yml`.
    - Falhas não transitórias propagam sem retry; circuito aberto falha rápido.
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 5.7 Fail-fast quando ADC ausente no profile cloud
    - No profile `cloud`, se ADC/credenciais não estiverem disponíveis, falhar explicitamente na inicialização em vez de subir sem credenciais; nunca logar segredos.
    - _Requirements: 14.2, 14.3, 14.4, 14.5_

  - [x] 5.8 Fiar policy/prompt/preço no `AiHubService.analyze`
    - Arquivo: `application/AiHubService.java`.
    - Resolver `AiExecutionPolicy` via `AiExecutionPolicyResolver` e `AiPromptSpec` via `AiPromptRegistry` na camada de aplicação; chamar `gateway.run(model, request, policy, prompt)`.
    - Garantir que policy NÃO é resolvida em controller nem no adapter.
    - _Requirements: 5.3, 6.1_

  - [ ]* 5.9 Teste unitário do `AiExecutionPolicyResolver`
    - Mapeamento `AiPriority→AiThinkingLevel` e overrides de config; `maxRetries<=1`.
    - _Requirements: 4.3, 4.4, 5.4_

  - [ ]* 5.10 Teste unitário do `AiTelemetryMapper`
    - `usageMetadata` (prompt/candidates/thoughts tokens, finishReason) → campos de `AiResult`.
    - _Requirements: 3.1_

  - [ ]* 5.11 Teste de integração de seleção de bean por profile (Property 5)
    - **Property 5: Mock permanece default fora do profile cloud** — profile `cloud` resolve `VertexAiGatewayAdapter`; `!cloud` resolve `MockAiGatewayAdapter` (1-2 exemplos, INTEGRATION, não PBT).
    - **Validates: Requirements 1.1, 1.2, 13.1**

  - [ ]* 5.12 Teste de contrato REST do Gemini com stub HTTP
    - Stub HTTP (sem GCP real) valida montagem do request e mapeamento da resposta; cobre ausência de `key.json` (ADC) e não-decisão de equidade pela IA (Property 6).
    - **Validates: Requirements 1.4, 1.5, 14.3**

- [x] 6. Checkpoint — Build verde Fase 2
  - Compilar/testar conforme tarefa 0.1; validar seleção por profile e resiliência.
  - NOTA DE VERIFICAÇÃO MANUAL (USUÁRIO, não o agente): rodar uma chamada REAL end-to-end localmente com `SPRING_PROFILES_ACTIVE=cloud` + ADC (`gcloud auth application-default login`) contra `eip-ai-dev` e confirmar que o metering real aparece em `ai_usage_event` (ex.: ~19 tokens com thinking LOW). O agente NÃO executa esta etapa.
  - Lembrete: efeito no runtime do backend requer `docker compose build --no-cache app`. Ask the user if questions arise.
  - _Requirements: 2.2, 3.1, 15.3_

- [x] 7. Fase 3 — FinOps (preço versionado fora do adapter)
  - [x] 7.1 Criar `AiPriceCatalogPort` + fonte de preço versionada
    - Arquivos: `domain/port/out/AiPriceCatalogPort.java` + adapter `AiPriceCatalogAdapter` lendo de fonte versionada (tabela `ai_price_config` versionada OU properties versionadas).
    - _Requirements: 11.3, 11.4_

  - [x] 7.2 Calcular `provider_cost` no `AiHubService` (fora do adapter)
    - Arquivo: `application/AiHubService.java`.
    - Antes de `ledger.record(...)`, calcular `provider_cost` via `AiPriceCatalogPort.providerCost(provider, model, result)`; mudança de preço não exige deploy.
    - _Requirements: 11.1, 11.2, 11.4_

  - [ ]* 7.3 Teste unitário do cálculo de preço
    - Preço versionado → `provider_cost` esperado; troca de preço reflete sem recompile.
    - _Requirements: 11.1, 11.4_

- [x] 8. Checkpoint — Build verde Fase 3
  - Compilar/testar conforme tarefa 0.1; validar cálculo de custo fora do adapter. Ask the user if questions arise.
  - _Requirements: 15.3_

- [x] 9. Fase 4 — Extração estruturada e idempotência
  - [x] 9.1 Criar DTOs de extração com Bean Validation
    - Arquivos novos (ex.: `application/extraction/` ou `domain/model/extraction/`): `CommercialInvoiceDto`, `PackingListDto`, `PedidoDto`, `InvoiceLineDto` e demais DTOs de linha, com anotações Jakarta (`@NotBlank`, `@NotNull`, `@Positive`, `@NotEmpty`).
    - _Requirements: 7.2_

  - [x] 9.2 Wiring de `responseSchema` para `DOCUMENT_EXTRACTION`
    - No `AiPromptRegistry`, o `responseSchemaJson` para `DOCUMENT_EXTRACTION` espelha os DTOs.
    - No `AiHubService`: parse JSON → DTO tipado → Bean Validation antes de usar; em caso de parse/validação inválida, erro descritivo e não persistir DTO inválido (opcional: 1 reparse determinístico sem novo custo de IA).
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 9.3 Criar `ExtractionCachePort` + `ExtractionIdempotencyService`
    - Arquivos: `domain/port/out/ExtractionCachePort.java` + `ExtractionCacheAdapter` + `application/ExtractionIdempotencyService.java`.
    - Chave = `hash(tenantId + docHash + task + promptVersion + modelVersion)`; cache hit retorna `AiResult` sem chamar Gemini; cache miss chama e armazena.
    - Fiar no `AiHubService.analyze`: quando `task == DOCUMENT_EXTRACTION`, usar `idempotency.extract(...)`.
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 9.4 Teste de propriedade — round-trip de extração (Property 2)
    - **Property 2: Round-trip de extração estruturada** — *para todo* DTO válido, serializar conforme schema e re-parsear produz DTO equivalente.
    - jqwik, ≥100 iterações. Tag: `Feature: ai-vertex-integration, Property 2`.
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ]* 9.5 Teste de propriedade — idempotência de extração (Property 4)
    - **Property 4: Idempotência de extração** — *para toda* chave, duas chamadas consecutivas causam no máx. uma chamada ao Gemini (segunda é cache hit equivalente).
    - jqwik, ≥100 iterações. Tag: `Feature: ai-vertex-integration, Property 4`.
    - **Validates: Requirements 10.1, 10.2, 10.4**

  - [ ]* 9.6 Teste unitário do caminho de erro de extração inválida
    - JSON inválido / Bean Validation falha → erro descritivo, sem persistir DTO.
    - _Requirements: 7.4_

- [x] 10. Checkpoint — Build verde Fase 4
  - Compilar/testar conforme tarefa 0.1; validar extração tipada e idempotência. Ask the user if questions arise.
  - _Requirements: 15.3_

- [x] 11. Fase 5 — Reconciliação de documentos (determinística)
  - [x] 11.1 Criar modelos de reconciliação
    - Arquivos: `ReconciliationResult` (`ok()`, lista de `Divergence`) e `Divergence` (fábricas `currency/incoterm/qty/total/...`).
    - _Requirements: 8.1_

  - [x] 11.2 Implementar `DocumentReconciliationService` (Java puro, determinístico)
    - Arquivo: `application/DocumentReconciliationService.java` + impl.
    - Comparar weight/qty/currency/SKU/total/Incoterm deterministicamente; `ok() == divergências.isEmpty()`; a IA NÃO decide igualdade numérica.
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 11.3 Etapa opcional de IA para explicar divergências (thinking LOW)
    - Após detecção determinística, acionar a IA (thinking LOW) apenas para EXPLICAR divergências já detectadas; nunca para decidir igualdade.
    - _Requirements: 8.4, 8.5_

  - [ ]* 11.4 Teste de propriedade — reconciliação determinística e pura (Property 3)
    - **Property 3: Reconciliação é determinística e pura** — *para todo* trio (Pedido, Packing List, Invoice), `reconcile` produz o mesmo conjunto de divergências e `ok()` ⇔ sem divergências, sem IA na decisão numérica.
    - jqwik, ≥100 iterações. Tag: `Feature: ai-vertex-integration, Property 3`.
    - **Validates: Requirements 8.2, 8.3, 8.5**

  - [ ]* 11.5 Testes unitários de divergência/igualdade
    - Exemplos por tipo (qty, total, currency, Incoterm, SKU), incluindo tolerâncias.
    - _Requirements: 8.1_

- [x] 12. Checkpoint final — Build verde Fase 5
  - Compilar/testar conforme tarefa 0.1; validar reconciliação determinística e a etapa de explicação por IA.
  - Lembrete final: para efeito no runtime, `docker compose build --no-cache app`; a validação real end-to-end contra `eip-ai-dev` é feita pelo USUÁRIO (profile `cloud` + ADC). Ask the user if questions arise.
  - _Requirements: 15.3_

## Notes

- Tarefas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido.
- **Mock-default / demo-safety:** `MockAiGatewayAdapter` permanece `@Profile("!cloud")` e bean padrão em todas as fases (Req 1.2, 13.1).
- **Sem alteração de RLS:** o worker `ai_job` e todas as políticas RLS permanecem intactos; V19 é apenas aditiva (Req 12).
- **Config, não código:** project/location/model/thinking/preço são configuração; trocar o alias do modelo ou o preço não exige recompilação (Req 2, 11).
- **Edição segura:** arquivos Java/SQL/TS são editados apenas por ferramentas de edição / subagente; nunca via PowerShell (corrupção UTF-8).
- **Toolchain (CONFIRMADO na tarefa 0.1):** `backend/mvnw` e `backend/mvnw.cmd` estão AUSENTES e `mvn` NÃO está no PATH deste ambiente (`mvn -v` → "não é reconhecido", exit 1). Portanto NÃO existe Maven local. `backend/pom.xml` existe.
  - **Comando canônico de "build verde" (único disponível aqui):** `docker compose build --no-cache app` executado a partir de `backend/` (onde vive o `docker-compose.yml`). O serviço de build é `app`, com `build: .` → contexto = `backend/`; o `Dockerfile` usa a imagem `maven:3.9-eclipse-temurin-21` e roda `mvn -q -B -DskipTests package` DENTRO da imagem, compilando o backend. `docker compose` está disponível (v5.5.1).
  - **Comando (a partir da raiz do repo):** `docker compose -f backend/docker-compose.yml build --no-cache app`.
  - **Testes locais:** NÃO podem ser executados neste ambiente (sem Maven local; o `Dockerfile` roda `-DskipTests`). As tarefas marcadas com `*` (unitárias e de propriedade/jqwik) serão ESCRITAS mas NÃO executadas localmente — devem rodar em um ambiente com Maven/JDK 21 ou em um alvo de teste dedicado. Não assumir que `mvn ... test` roda aqui.
  - **Fallback de verificação de compilação:** `docker compose build --no-cache app` é a validação de "build verde" para todos os checkpoints (compila o módulo `ai` e todos os call sites dentro da imagem). O efeito no runtime do backend também vem desse mesmo build.
- **Verificação real:** a chamada end-to-end contra `eip-ai-dev` (profile `cloud` + ADC) é uma etapa manual do usuário (checkpoint da Fase 2).
- Testes de propriedade (jqwik) cobrem as invariantes de metering (P1), round-trip de extração (P2), determinismo de reconciliação (P3) e idempotência (P4); seleção por profile (P5) e não-uso de segredos (P6) são cobertos por testes de integração/contrato.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["0.1"] },
    { "id": 1, "tasks": ["1.1", "1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["1.4", "1.5", "1.6"] },
    { "id": 4, "tasks": ["1.7", "1.8"] },
    { "id": 5, "tasks": ["3.1", "3.2"] },
    { "id": 6, "tasks": ["3.3"] },
    { "id": 7, "tasks": ["3.4", "5.1", "5.2"] },
    { "id": 8, "tasks": ["5.3", "5.4"] },
    { "id": 9, "tasks": ["5.5"] },
    { "id": 10, "tasks": ["5.6", "5.7"] },
    { "id": 11, "tasks": ["5.8"] },
    { "id": 12, "tasks": ["5.9", "5.10", "5.11", "5.12"] },
    { "id": 13, "tasks": ["7.1"] },
    { "id": 14, "tasks": ["7.2"] },
    { "id": 15, "tasks": ["7.3", "9.1"] },
    { "id": 16, "tasks": ["9.2", "9.3"] },
    { "id": 17, "tasks": ["9.4", "9.5", "9.6", "11.1"] },
    { "id": 18, "tasks": ["11.2"] },
    { "id": 19, "tasks": ["11.3", "11.4", "11.5"] }
  ]
}
```
