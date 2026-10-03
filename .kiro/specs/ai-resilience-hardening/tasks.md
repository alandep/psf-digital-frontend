# Implementation Plan: AI Resilience Hardening

## Overview

Plano de implementação para endurecer a integração de IA do EIP (Vertex AI / Gemini) **sobre o código existente** — sem reescrever o que já funciona. O caminho feliz (UI → BFF → Vertex → ledger) já está validado; estas tarefas fecham as lacunas de borda em 5 fases, cada uma terminando com um checkpoint build-green.

Linguagem de implementação: Java 21 / Spring Boot 3.5.6 (backend hexagonal com Spring Modulith + Resilience4j) e Angular 20 (frontend).

Peças existentes reutilizadas (NÃO reescrever): `VertexAiCaller` (Resilience4j `@Retry`/`@CircuitBreaker`/`@Bulkhead` + timeout de `RestClient`), `GlobalExceptionHandler` (`ApiError` + `correlationId`), `AiExceptionHandler` (`@RestControllerAdvice` em `com.eip.modules.ai`, mapeia `AiQuotaExceededException`→402), `AiTelemetryMapper`, `ReconciliationUseCaseService` + `ExtractionResultValidator`, `AiUsageLedgerPort`, `VertexAiGatewayAdapter`, `MockAiGatewayAdapter`, `errorInterceptor` + `AiHubComponent` no front.

> **Leia a seção `## Notes` antes de executar qualquer tarefa.** Ela define as restrições obrigatórias (sem edição de Java/SQL/TS via PowerShell, comando de build-green via docker, testes de stub executados só em CI, sem fallback silencioso para mock, redação).

## Tasks

- [x] 1. Fase 1 — Taxonomia de erro (fundação)
  - [x] 1.1 Criar o pacote de taxonomia de erro de domínio
    - Criar o pacote `com.eip.modules.ai.domain.error`.
    - Criar a classe base abstrata `AiProviderException` com campos `code` (String) e `transientFailure` (boolean), construtor `(code, message, transientFailure, cause)` e acessores `code()` e `isTransient()`.
    - Criar os subtipos finais: `AiTimeoutException` (transient=true), `AiProviderUnavailableException` (transient=true), `AiRateLimitedException` (transient=true, campo opcional `Duration retryAfter`), `AiTransientProviderException` (transient=true), `AiDefinitiveProviderException` (transient=false).
    - Criar `AiResponseException` (nunca transiente) com enum `Kind { MALFORMED_JSON, SCHEMA_INVALID, MISSING_FIELDS, WRONG_TYPES, EMPTY_OUTPUT, TRUNCATED, BLOCKED_SAFETY }` e campo `kind`.
    - As exceções NÃO conhecem HTTP (o mapeamento vive no handler).
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 6.1_

  - [x] 1.2 Criar o `AiProviderExceptionTranslator` no limite do `VertexAiGatewayAdapter`
    - Criar a interface/implementação `AiProviderExceptionTranslator` (profile `cloud`) com `RuntimeException translate(RuntimeException raw)`.
    - Mapeamento determinístico: `CallNotPermittedException`→`AiProviderUnavailableException`; `ResourceAccessException` (read/connect timeout)→`AiTimeoutException`; `HttpClientErrorException.TooManyRequests` (429)→`AiRateLimitedException` (lendo header `Retry-After` quando presente); `HttpServerErrorException` (5xx)→`AiTransientProviderException`; `IOException`→`AiTimeoutException`/`AiTransientProviderException` conforme a natureza.
    - Demais `HttpClientErrorException` (4xx não-429) NÃO são traduzidas — permanecem como falha funcional (seguem a regra de negócio/validação → 422/400).
    - Integrar o translator no `VertexAiGatewayAdapter` no ponto onde a exceção crua do `VertexAiCaller` é capturada, sem alterar o caminho feliz existente.
    - _Requirements: 1.2, 4.3, 5.1, 6.1, 6.2_

  - [x] 1.3 Estender o `AiExceptionHandler` com o mapeamento HTTP da taxonomia
    - Adicionar handlers no `@RestControllerAdvice` existente de `com.eip.modules.ai`, reutilizando `ApiError(code, message, correlationId, errors)` e o `correlationId` do MDC: `AiTimeoutException`→504 `AI_TIMEOUT`; `AiProviderUnavailableException`→503 `AI_UNAVAILABLE`; `AiRateLimitedException`→429 `AI_RATE_LIMITED` (propagando header `Retry-After` quando presente); `AiTransientProviderException`→503 `AI_PROVIDER_ERROR`; `AiDefinitiveProviderException`→502 `AI_PROVIDER_ERROR`; `AiResponseException`→422 `AI_RESPONSE_INVALID`.
    - Preservar o handler existente de `AiQuotaExceededException`→402 e não interferir no `GlobalExceptionHandler` (falhas funcionais seguem 400/422/403/404/500).
    - Mensagens pt-BR específicas por status.
    - _Requirements: 1.3, 1.5, 2.6, 2.7, 4.4, 5.2, 5.3, 6.2, 6.3, 6.4_

  - [ ]* 1.4 Testes unitários da taxonomia (executar em CI — sem Maven local)
    - Teste de `AiProviderExceptionTranslator`: cada exceção crua → exceção de domínio correta + flag `transient` + `Retry-After` quando aplicável.
    - Teste de `AiExceptionHandler`: cada exceção da taxonomia → status HTTP + `code` + `correlationId` corretos; 4xx não-429 permanece funcional.
    - **Property 5: Mapeamento transient → status é determinístico** (jqwik) — status é função apenas do tipo da exceção.
    - **Validates: Requirements 1.3, 2.7, 4.4, 5.2, 6.2, 6.3 (Property 5)**

  - [x] 1.5 Checkpoint build-green (Fase 1)
    - Executar o build-green do backend: `docker compose -f backend/docker-compose.yml build --no-cache app`.
    - Garantir que compila. Os testes unitários/property da 1.4 rodam em CI. Em caso de dúvida, perguntar ao usuário.

- [x] 2. Fase 2 — Endurecimento da validação de resposta
  - [x] 2.1 Criar o `AiResponseValidator` e integrá-lo antes do parse de negócio
    - Criar `@Component AiResponseValidator` com `void validateCompleteness(JsonNode response)`.
    - Regras: `candidates` ausente/vazio → `AiResponseException(EMPTY_OUTPUT)`; `finishReason == MAX_TOKENS` → `TRUNCATED`; `finishReason == SAFETY | RECITATION` → `BLOCKED_SAFETY`; qualquer `finishReason != STOP` (e distinto dos acima) → `TRUNCATED`; `output` concatenado vazio → `EMPTY_OUTPUT`.
    - NÃO validar schema de negócio (isso continua no `ExtractionResultValidator`/Bean Validation → 422).
    - Invocar `validateCompleteness` no `VertexAiGatewayAdapter` **antes** do `AiTelemetryMapper` e do parse de negócio.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.2 Garantir o invariante "nunca persistir inválido"
    - Confirmar/ajustar o fluxo do `VertexAiGatewayAdapter`/`ReconciliationUseCaseService` para que, ao lançar `AiResponseException` (ou `BusinessRuleException` de parse/schema), nenhum DTO de negócio nem resultado de reconciliação seja persistido e a resposta seja 422.
    - _Requirements: 2.6, 2.8_

  - [x] 2.3 Config-driven de timeouts, retry (backoff + jitter) e actuator
    - Em `backend/.../application-cloud.yml`, adicionar `eip.ai.vertex.timeout.connect`/`eip.ai.vertex.timeout.read` (via env vars) e fazer o `VertexAiCaller` ler esses valores em vez de constantes hardcoded.
    - Adicionar backoff exponencial com jitter config-driven ao `resilience4j.retry.instances.vertex` (`enable-exponential-backoff`, `exponential-backoff-multiplier`), mantendo `max-attempts=2` e as `retry-exceptions` atuais (IOException/ResourceAccessException/HttpServerErrorException) — 4xx permanece fora da allow-list.
    - Expor actuator: `management.endpoints.web.exposure.include` com `health,metrics,circuitbreakers` e `management.health.circuitbreakers.enabled=true`.
    - _Requirements: 1.1, 3.2, 3.3, 3.4, 4.5, 4.6, 11.3_

  - [ ]* 2.4 Property tests da validação de resposta (stub provider — executar em CI)
    - **Property 1: Nenhum resultado inválido é persistido** — para toda resposta inválida (JSON malformado, schema inválido, campos ausentes/tipos errados, output vazio, `finishReason != STOP`), não grava DTO/reconciliação e responde 422.
    - **Property 2: 4xx funcional nunca é retentado** — para toda resposta 4xx (incl. 429), exatamente 1 chamada ao provedor.
    - **Property 5: Mapeamento transient → status é determinístico** (reforço com stub).
    - Usar o provedor FAKE/STUB (`AiGatewayPort`) em profile de teste para disparar os cenários deterministicamente.
    - **Validates: Requirements 2.1-2.8, 3.1, 3.5, 5.1 (Properties 1, 2, 5)**

  - [x] 2.5 Checkpoint build-green (Fase 2)
    - Executar `docker compose -f backend/docker-compose.yml build --no-cache app`. Garantir compilação. Property tests da 2.4 rodam em CI.

- [x] 3. Fase 3 — Desfecho de revisão + reconciliação parcial
  - [x] 3.1 Criar os modelos de domínio de revisão e resultado por documento
    - Criar `ReviewReason` enum `{ FINISH_REASON_NOT_STOP, REVALIDATION_FAILED, RECONCILIATION_DIVERGENCE, PARTIAL_EXTRACTION }`.
    - Criar `ReviewOutcome` record `(boolean needsReview, List<ReviewReason> reasons, String signalSource)` com fábrica `none()`; invariante: `needsReview == true` ⟺ `reasons` não-vazio; nenhum campo numérico de confiança.
    - Criar `DocExtractionStatus { OK, FAILED }` e `DocKind { PEDIDO, PACKING, INVOICE }`.
    - Criar `DocumentExtractionResult<T>` record `(DocKind kind, DocExtractionStatus status, T dto, AiResponseException.Kind failureKind, String failureDetail)` com fábricas `ok(kind, dto)` e `failed(kind, ex)`; invariantes: `OK ⟹ dto != null`, `FAILED ⟹ failureKind != null`, `failureDetail` redigido.
    - Criar `ReconciliationResponse` record `(DocumentExtractionResult<PedidoDto> pedido, DocumentExtractionResult<PackingListDto> packing, DocumentExtractionResult<CommercialInvoiceDto> invoice, boolean allExtracted, ReconciliationView reconciliation, ReviewOutcome review)`; invariantes: `allExtracted == true` ⟺ os três `OK`; `reconciliation != null ⟹ allExtracted == true`.
    - _Requirements: 7.1, 7.6, 7.7, 8.1, 8.3, 8.4_

  - [x] 3.2 Capturar falha por documento no `ReconciliationUseCaseService`
    - Alterar o fluxo sequencial de extração (pedido → packing → invoice) para capturar `AiResponseException`/`BusinessRuleException` de cada documento em um `DocumentExtractionResult.failed(...)` em vez de abortar a requisição inteira; extrações OK viram `DocumentExtractionResult.ok(...)`.
    - Falhas de **transporte** (`AiProviderException`: timeout/503/429) continuam propagando (a requisição inteira falha com status transiente) — a captura por documento cobre apenas falhas de **conteúdo/validação**.
    - Rodar a reconciliação determinística somente quando os três documentos estiverem OK; preservar as extrações OK na resposta para retry controlado dos FAILED.
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_

  - [x] 3.3 Computar o `ReviewOutcome` por sinais determinísticos
    - No `ReconciliationUseCaseService`, montar `reasons` a partir de sinais determinísticos: `finishReason != STOP` → `FINISH_REASON_NOT_STOP`; DTO schema-ok mas regra de negócio determinística falha → `REVALIDATION_FAILED`; `ReconciliationResult.ok() == false` → `RECONCILIATION_DIVERGENCE`; ao menos um documento `FAILED` → `PARTIAL_EXTRACTION`.
    - Definir `needsReview = !reasons.isEmpty()` e `signalSource = "deterministic"`. NÃO fabricar score de confiança.
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 3.4 Expor `ReconciliationResponse` no `ReconciliationBffController`
    - Atualizar o controller BFF da reconciliação para retornar `ReconciliationResponse` (contrato explícito por documento + review), preservando o caminho feliz existente.
    - _Requirements: 8.1, 8.5, 8.7_

  - [x] 3.5 Atualizar o contrato e a renderização no frontend
    - Atualizar o type `AiReconciliationResult` (front) para refletir `ReconciliationResponse` (status por documento OK/FAILED, `allExtracted`, `reconciliation` opcional, `review`).
    - Atualizar o `AiHubComponent` para renderizar o status por documento (OK/FAILED) e os motivos de revisão, preservando a renderização do caminho feliz existente.
    - _Requirements: 8.5, 8.7, 10.1_

  - [ ]* 3.6 Property tests de reconciliação parcial e review (executar em CI)
    - **Property 4: Falha parcial nunca reporta ok** — para todo conjunto com ao menos um `FAILED`, `allExtracted=false`, `reconciliation=null`, `review.needsReview=true`.
    - **Property 9: `needsReview` ⟺ sinais determinísticos** — `needsReview==true` sse `reasons` não-vazio; nenhum campo numérico de confiança.
    - **Property 10: Round-trip da resposta explícita por documento** — serializar/desserializar `ReconciliationResponse` preserva status por documento e campos de review (fast-check no front para o contrato, se aplicável).
    - **Validates: Requirements 7.5, 7.6, 8.3, 8.4, 8.5, 8.7, 10.1 (Properties 4, 9, 10)**

  - [x] 3.7 Checkpoint build-green (Fase 3)
    - Backend: `docker compose -f backend/docker-compose.yml build --no-cache app`.
    - Frontend: `node_modules\.bin\ng.cmd build --configuration=development`.
    - Garantir compilação de ambos. Property tests da 3.6 rodam em CI.

- [x] 4. Fase 4 — Observabilidade
  - [x] 4.1 Propagar `traceId` da UI ao backend
    - Criar `AiTraceContextFilter` que lê o header `X-Trace-Id` da requisição e o popula no MDC (ao lado do `correlationId` já existente).
    - Garantir que o front envia `X-Trace-Id` (coordenado com a tarefa 5.4).
    - _Requirements: 9.1_

  - [x] 4.2 Estender `AiUsageLedgerPort` com desfecho + migração aditiva
    - Adicionar `void recordOutcome(AiLedgerEntry entry)` à porta (mantendo o `record(...)` existente), com `AiLedgerEntry(org, userId, task, requestId, traceId, AiOutcome outcome [ATTEMPT|SUCCESS|FAILURE|RETRY], String failureCategory, AiResult result, BigDecimal providerCost)`.
    - Criar a migração `V23` adicionando colunas aditivas `outcome`, `failure_category`, `trace_id` à tabela `ai_usage_event` — sem alterar RLS.
    - Implementar `recordOutcome` no adapter de ledger existente.
    - _Requirements: 9.1, 9.2_

  - [x] 4.3 Registrar desfechos FAILURE e log estruturado com redação
    - Instrumentar o caminho de IA para gravar outcomes de FAILURE (não só SUCCESS) via `recordOutcome`, com `failureCategory` (ex.: TIMEOUT, RATE_LIMITED, PROVIDER_5XX, RESPONSE_INVALID).
    - Emitir log estruturado por chamada: operação, modelo, tokens, latência, resultado, categoria de falha, `correlationId`, `traceId`.
    - Aplicar redação: NUNCA logar/gravar bearer token nem conteúdo integral do documento; trechos para debug são truncados/mascarados. Confirmar que `AiResult.output` NÃO é persistido no ledger (apenas telemetria agregada).
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 11.4_

  - [ ]* 4.4 Testes de redação e registro de desfecho (executar em CI)
    - **Property 6: Idempotência de efeito sob retry** — para toda chamada com ≤1 retry transiente antes do sucesso, exatamente um evento de ledger `SUCCESS`.
    - **Property 8: Redação de dados sensíveis** — para todo log/ledger do caminho de IA, o conteúdo não contém bearer token nem texto integral do documento.
    - Teste de `recordOutcome` gravando `outcome`/`failureCategory`/`traceId`.
    - **Validates: Requirements 3.6, 9.2, 9.4, 9.5, 9.6, 11.4 (Properties 6, 8)**

  - [x] 4.5 Checkpoint build-green (Fase 4)
    - Executar `docker compose -f backend/docker-compose.yml build --no-cache app`. Garantir compilação e que a migração V23 aplica. Property tests da 4.4 rodam em CI.

- [x] 5. Fase 5 — Endurecimento da UX no frontend
  - [x] 5.1 Guarda contra double-submit no `AiHubComponent`
    - Adicionar signal `submitting` que desabilita os botões de envio enquanto a requisição está in-flight e é liberado ao concluir (sucesso ou erro).
    - _Requirements: 10.2_

  - [x] 5.2 Retry manual honrando `Retry-After` e preservação de input
    - Modelar um `AiFriendlyError` (`status`, `code?`, `message` pt-BR, `correlationId?`, `retryAfterSeconds?`, `retryable`).
    - Oferecer afordância de "Tentar novamente" para erros retentáveis (503/504/429), honrando `retryAfterSeconds` quando presente.
    - Preservar o input do usuário após erro (não limpar os textos digitados).
    - _Requirements: 10.3, 10.4, 10.5_

  - [x] 5.3 Mapa completo de mensagens pt-BR + exibição de correlationId
    - Completar o mapa status → mensagem pt-BR no `AiHubComponent` incluindo 504, 503 e 401 (além dos 429/422/400/403 já existentes).
    - Exibir o `correlationId` ao usuário quando um erro de IA é mostrado, para suporte.
    - _Requirements: 10.1, 10.6, 5.4_

  - [x] 5.4 Enviar `X-Trace-Id` do front
    - Enviar o header `X-Trace-Id` nas chamadas de IA (via interceptor dedicado ou o serviço `ai-http`), gerando um identificador por requisição.
    - _Requirements: 9.1_

  - [ ]* 5.5 Testes de componente/serviço do front (executar em CI, se viável)
    - Testar guarda de double-submit, exibição de retry para 503/504/429, preservação de input e mapa de mensagens.
    - **Property 7: Sem fallback silencioso para mock** — para toda falha real no profile `cloud`, a resposta é um erro apropriado (nunca resultado do mock) e é surfada como erro no front.
    - **Validates: Requirements 10.1-10.6, 11.1, 11.2 (Property 7)**

  - [x] 5.6 Checkpoint build-green final (Fase 5)
    - Frontend: `node_modules\.bin\ng.cmd build --configuration=development`.
    - Smoke do caminho feliz (manual/orchestrator) com Vertex real — único teste com provedor real.
    - Garantir compilação. Testes da 5.5 rodam em CI. Em caso de dúvida, perguntar ao usuário.

## Notes

### Restrições obrigatórias (ler antes de executar)
- **Construir SOBRE o código existente.** Não reescrever `VertexAiCaller`, `GlobalExceptionHandler`, `AiExceptionHandler`, `AiTelemetryMapper`, `ReconciliationUseCaseService`, `ExtractionResultValidator`, `AiUsageLedgerPort`, `VertexAiGatewayAdapter` ou o `AiHubComponent`/interceptors — apenas estendê-los/fechar lacunas, preservando o caminho feliz validado.
- **NUNCA editar arquivos Java/SQL/TS via PowerShell** (risco de corromper UTF-8). Edições apenas via ferramentas de arquivo / subagente `spec-task-execution`.
- **Build-green backend é SOMENTE via Docker:** `docker compose -f backend/docker-compose.yml build --no-cache app`. NÃO há Maven local no ambiente do agente.
- **Build-green frontend:** `node_modules\.bin\ng.cmd build --configuration=development`.
- **Testes de stub/property são ESCRITOS mas executam em CI** (ambiente com Maven). O único check com Vertex real é o smoke do caminho feliz (manual/orchestrator).
- **Sem fallback silencioso para mock.** No profile `cloud`, toda falha real é surfada como erro (4xx/5xx apropriado). O mock é modo explícito/selecionável (`!cloud`/flag), nunca o default do caminho real.
- **Config-driven por ambiente.** Timeouts, retry, breaker e rate-limit vêm de `application-*.yml`/env vars — nada hardcoded.
- **Redação obrigatória.** Nunca logar/persistir bearer token nem conteúdo integral de documento; `AiResult.output` não é persistido no ledger.

### Convenções do plano
- Tarefas marcadas com `*` são testes opcionais que **rodam em CI** (sem Maven local); não devem ser implementadas/executadas localmente pelo agente de execução.
- Cada tarefa referencia requisitos específicos (`_Requirements: X.Y_`) e, quando aplicável, as propriedades de corretude do design.
- Cada fase termina com um checkpoint build-green explícito.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4"] },
    { "id": 3, "tasks": ["2.1", "2.3"] },
    { "id": 4, "tasks": ["2.2", "2.4"] },
    { "id": 5, "tasks": ["3.1"] },
    { "id": 6, "tasks": ["3.2"] },
    { "id": 7, "tasks": ["3.3"] },
    { "id": 8, "tasks": ["3.4", "3.5"] },
    { "id": 9, "tasks": ["3.6", "4.1", "4.2"] },
    { "id": 10, "tasks": ["4.3"] },
    { "id": 11, "tasks": ["4.4", "5.1", "5.4"] },
    { "id": 12, "tasks": ["5.2"] },
    { "id": 13, "tasks": ["5.3"] },
    { "id": 14, "tasks": ["5.5"] }
  ]
}
```
