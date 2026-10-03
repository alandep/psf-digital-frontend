# Requirements Document

## Introduction

Esta spec adiciona o "braço real" do provedor de IA ao AI Hub do backend EIP (Java 21 / Spring Boot, monólito modular hexagonal com Spring Modulith). Hoje existe apenas o `MockAiGatewayAdapter` determinístico (`@Profile("!cloud")`), que permanece o padrão da demo. Os requisitos abaixo são derivados do design aprovado (`design.md`, workflow design-first) e descrevem: um `VertexAiGatewayAdapter` (`@Profile("cloud")`) que chama o Gemini via REST `generateContent` da Vertex AI usando ADC (sem `key.json`); metering real de tokens em `AiResult`/`ai_usage_event`; nível de thinking de primeira classe; `AiExecutionPolicy` resolvida fora dos controllers e do adapter; `AiPromptRegistry`; extração estruturada e reconciliação determinística de documentos; resiliência; cache de idempotência; FinOps com preço versionado; segurança multi-tenant preservada; compatibilidade retroativa; e segurança ADC.

**Princípio norteador:** o mock permanece o padrão (a demo roda em mock), toda mudança de contrato é refletida em TODOS os call sites para manter o build verde, e tudo que é específico de ambiente (project, location, model id, thinking level, preço) é **configuração** — nunca hardcoded em Java.

## Glossary

- **AI_Hub**: Conjunto de componentes de aplicação/domínio do módulo `ai` (serviço, portas, modelos) que orquestram requisições de IA.
- **Vertex_Adapter**: `VertexAiGatewayAdapter`, adapter OUT ativo no profile `cloud` que chama o Gemini via REST `generateContent`.
- **Mock_Adapter**: `MockAiGatewayAdapter`, adapter OUT determinístico ativo em qualquer profile diferente de `cloud` (`!cloud`).
- **Policy_Resolver**: `AiExecutionPolicyResolver`, componente de aplicação que resolve `AiExecutionPolicy`.
- **Prompt_Registry**: `AiPromptRegistry`, componente que constrói `AiPromptSpec` (system instruction, user prompt, response schema) por tarefa.
- **Reconciliation_Service**: `DocumentReconciliationService`, componente determinístico que compara Pedido × Packing List × Commercial Invoice em Java puro.
- **Idempotency_Service**: `ExtractionIdempotencyService`, componente que aplica cache de idempotência à extração.
- **Price_Catalog**: Implementação de `AiPriceCatalogPort` que calcula `provider_cost` a partir de preço versionado em config/tabela.
- **Ledger**: `AiUsageLedgerAdapter` que grava em `ai_usage_event`.
- **AiExecutionPolicy**: Registro que carrega `model`, `thinkingLevel`, `maxOutputTokens`, `timeout`, `maxRetries`.
- **AiThinkingLevel**: Enum `LOW`, `MEDIUM`, `HIGH`.
- **AiResult**: Registro de resultado de IA com telemetria (`output`, `provider`, `model`, `inputUnits`, `outputUnits`, `ocrPages`, `promptTokens`, `outputTokens`, `thinkingTokens`, `totalTokens`, `finishReason`, `latencyMs`).
- **ADC**: Application Default Credentials (google-auth-library) — autenticação sem `key.json`.
- **Transient_Failure**: Falha claramente transitória allow-listed (timeout, 5xx, connection reset).
- **ai_model_config**: Tabela de catálogo GLOBAL (sem RLS) que resolve `(task, priority) → modelo`.
- **ai_usage_event**: Tabela de ledger de uso (com `FORCE ROW LEVEL SECURITY`).

## Requirements

### Requirement 1: Vertex AI Gateway Adapter no profile cloud (mock padrão fora de cloud)

**User Story:** Como engenheiro de plataforma, quero que o adapter real do Vertex AI fique ativo apenas no profile `cloud` e o mock permaneça padrão fora dele, para que a demo continue funcionando sem GCP e a integração real seja habilitada apenas quando o ambiente for `cloud`.

#### Acceptance Criteria

1. WHERE o profile ativo é `cloud`, THE AI_Hub SHALL resolver o bean de `AiGatewayPort` para o Vertex_Adapter.
2. WHERE o profile ativo não é `cloud` (`!cloud`), THE AI_Hub SHALL resolver o bean de `AiGatewayPort` para o Mock_Adapter.
3. WHEN o Vertex_Adapter chama o provedor, THE Vertex_Adapter SHALL invocar o Gemini via REST `generateContent` (API v1) da Vertex AI.
4. WHEN o Vertex_Adapter autentica uma chamada, THE Vertex_Adapter SHALL obter o bearer token via ADC.
5. THE Vertex_Adapter SHALL operar sem arquivo `key.json` e sem segredos embutidos em código ou YAML.

### Requirement 2: Configuração dirigida de project/location/model/thinking

**User Story:** Como operador, quero que project, location, model id e thinking level sejam valores de configuração (não hardcoded), para que trocar o alias do modelo ou a location não exija recompilação.

#### Acceptance Criteria

1. THE AI_Hub SHALL obter project, location e model id a partir de configuração (`ai_model_config` + `application-cloud.yml` + variáveis de ambiente).
2. THE AI_Hub SHALL usar `project=eip-ai-dev`, `location=global` e `model=gemini-3.8-flash` como valores de configuração, não como literais em código Java.
3. WHEN o alias/id do modelo é alterado na configuração, THE AI_Hub SHALL passar a usar o novo modelo sem recompilação do código.
4. THE AI_Hub SHALL derivar o thinking level a partir de configuração (com default derivado da prioridade), não de literais em código Java.

### Requirement 3: Metering real de tokens em AiResult e ai_usage_event

**User Story:** Como responsável por FinOps, quero que o resultado de IA carregue a telemetria real de tokens e seja gravada no ledger, para que o consumo registrado reflita os tokens reais e não `text.length()`.

#### Acceptance Criteria

1. WHEN o Vertex_Adapter recebe a resposta do Gemini, THE Vertex_Adapter SHALL mapear `usageMetadata` para `promptTokens`, `outputTokens`, `thinkingTokens`, `totalTokens`, `finishReason` e `latencyMs` em AiResult.
2. THE AiResult SHALL manter a invariante `inputUnits == promptTokens` e `outputUnits == outputTokens`.
3. THE AiResult SHALL manter a invariante `totalTokens >= promptTokens + outputTokens`.
4. WHEN o Ledger grava um uso, THE Ledger SHALL registrar `promptTokens`/`outputTokens` em `input_units`/`output_units` e `thinkingTokens`/`totalTokens`/`finishReason`/`latencyMs` nas colunas correspondentes de `ai_usage_event`.

### Requirement 4: Thinking level de primeira classe via AiExecutionPolicy

**User Story:** Como desenvolvedor do AI Hub, quero que o nível de thinking seja de primeira classe carregado pela `AiExecutionPolicy` (sem alterar o record `AiModel`), para que o thinking seja exposto ao adapter sem quebrar os construtores amplamente referenciados de `AiModel`.

#### Acceptance Criteria

1. THE AI_Hub SHALL representar o thinking level pelo enum AiThinkingLevel com os valores `LOW`, `MEDIUM` e `HIGH`.
2. THE AI_Hub SHALL carregar o thinking level dentro de AiExecutionPolicy, sem adicionar o thinking level ao record `AiModel`.
3. WHEN o Policy_Resolver resolve o thinking level, THE Policy_Resolver SHALL derivá-lo da `AiPriority` (`FAST → LOW`, `STANDARD → MEDIUM`, `DEEP → HIGH`) quando não houver override de configuração.
4. WHERE existe override de thinking level na configuração, THE Policy_Resolver SHALL usar o valor da configuração em vez do default derivado da prioridade.

### Requirement 5: Resolução de política na camada de aplicação

**User Story:** Como arquiteto, quero que a `AiExecutionPolicy` seja resolvida por um resolver da camada de aplicação (não em controllers, não no adapter Google), para que a seleção de modelo e limites de execução fique em um único lugar e as fronteiras hexagonais sejam respeitadas.

#### Acceptance Criteria

1. WHEN uma requisição de IA é processada, THE Policy_Resolver SHALL produzir uma AiExecutionPolicy contendo `model`, `thinkingLevel`, `maxOutputTokens`, `timeout` e `maxRetries`.
2. THE Policy_Resolver SHALL usar `ModelRouterPort.resolve(task)` para obter o `AiModel`.
3. THE AI_Hub SHALL resolver a AiExecutionPolicy na camada de aplicação, não em controllers nem no Vertex_Adapter.
4. WHEN o Policy_Resolver produz uma política, THE Policy_Resolver SHALL garantir `maxRetries <= 1`.

### Requirement 6: Construção de prompt no AiPromptRegistry

**User Story:** Como arquiteto, quero que a construção de prompt, system instruction e response schema fique em um registry (não no Vertex_Adapter), para que o adapter permaneça agnóstico ao domínio de negócio (não precise saber o que é NCM ou Invoice).

#### Acceptance Criteria

1. WHEN uma requisição de IA é processada, THE Prompt_Registry SHALL produzir um `AiPromptSpec` com system instruction, user prompt e response schema (quando aplicável) para a tarefa.
2. THE Prompt_Registry SHALL expor um `promptVersion` por tarefa para compor a chave de idempotência.
3. THE Vertex_Adapter SHALL receber o `AiPromptSpec` já construído e não construir prompts de negócio internamente.
4. THE Vertex_Adapter SHALL permanecer sem conhecimento de conceitos de negócio como NCM, Invoice ou Pedido.

### Requirement 7: Saída estruturada para DOCUMENT_EXTRACTION

**User Story:** Como integrador, quero que a extração de documentos produza JSON conforme schema mapeado para DTOs Java tipados validados por Bean Validation, para que Commercial Invoice, Packing List e Pedido sejam extraídos de forma tipada e verificável.

#### Acceptance Criteria

1. WHEN a tarefa é `DOCUMENT_EXTRACTION`, THE Prompt_Registry SHALL incluir no `AiPromptSpec` um `responseSchema` JSON que espelha os DTOs de extração.
2. WHEN a resposta JSON de extração é recebida, THE AI_Hub SHALL fazer o parse para o DTO Java tipado correspondente (Commercial Invoice, Packing List, Pedido).
3. WHEN um DTO de extração é obtido, THE AI_Hub SHALL aplicar Bean Validation antes de usar o resultado.
4. IF o JSON de extração falha no parse ou na Bean Validation, THEN THE AI_Hub SHALL retornar um erro de validação descritivo e não persistir o DTO inválido.

### Requirement 8: Reconciliação determinística de documentos

**User Story:** Como analista de comércio exterior, quero que a comparação entre Pedido, Packing List e Commercial Invoice seja feita deterministicamente em Java, para que a decisão de igualdade numérica não dependa da IA.

#### Acceptance Criteria

1. WHEN o Reconciliation_Service reconcilia os documentos, THE Reconciliation_Service SHALL comparar weight, qty, currency, SKU, total e Incoterm em Java puro.
2. THE Reconciliation_Service SHALL produzir o mesmo conjunto de divergências para as mesmas entradas em qualquer execução (função pura e determinística).
3. WHEN a reconciliação termina, THE Reconciliation_Service SHALL retornar `ok() == true` se e somente se não houver divergências.
4. THE AI_Hub SHALL usar a IA apenas para extrair os DTOs e, posteriormente, explicar as divergências já detectadas.
5. THE AI_Hub SHALL NOT delegar à IA a decisão de igualdade numérica da reconciliação.

### Requirement 9: Resiliência da chamada ao provedor

**User Story:** Como operador, quero resiliência com timeout, no máximo 1 retry em falhas transitórias, circuit breaker e bulkhead, para que falhas do provedor não causem retry storms nem derrubem o serviço.

#### Acceptance Criteria

1. WHEN o Vertex_Adapter chama o Gemini, THE Vertex_Adapter SHALL aplicar um limite de tempo (timeout) via Resilience4j.
2. IF ocorre uma Transient_Failure durante a chamada, THEN THE Vertex_Adapter SHALL tentar novamente no máximo 1 vez.
3. IF ocorre uma falha não transitória, THEN THE Vertex_Adapter SHALL propagar o erro sem retry.
4. THE Vertex_Adapter SHALL aplicar circuit breaker e bulkhead à chamada do provedor.
5. WHILE o circuito está aberto, THE Vertex_Adapter SHALL falhar rápido sem chamar o provedor.

### Requirement 10: Cache de idempotência de extração

**User Story:** Como responsável por FinOps, quero cache de idempotência para extração chaveado por tenant, hash do documento, tarefa, versão de prompt e versão de modelo, para que documentos idênticos não sejam reprocessados pelo Gemini.

#### Acceptance Criteria

1. WHEN uma extração é solicitada, THE Idempotency_Service SHALL compor a chave de cache a partir de `tenantId`, `documentHash`, `task`, `promptVersion` e `modelVersion`.
2. WHEN existe entrada de cache para a chave, THE Idempotency_Service SHALL retornar o AiResult em cache sem chamar o Gemini.
3. WHEN não existe entrada de cache para a chave, THE Idempotency_Service SHALL chamar o Gemini e armazenar o AiResult sob a chave.
4. WHEN a mesma chave é consultada em duas chamadas consecutivas, THE Idempotency_Service SHALL causar no máximo uma chamada ao Gemini.

### Requirement 11: FinOps com preço versionado fora do adapter

**User Story:** Como responsável por FinOps, quero que o `provider_cost` seja calculado a partir de uma tabela/config de preço versionada consultada via `AiPriceCatalogPort`, para que uma mudança de preço do Google não exija deploy.

#### Acceptance Criteria

1. WHEN um uso de IA é registrado, THE AI_Hub SHALL calcular o `provider_cost` consultando o Price_Catalog via `AiPriceCatalogPort`.
2. THE AI_Hub SHALL calcular o custo fora do Vertex_Adapter.
3. THE Price_Catalog SHALL obter o preço de uma fonte versionada (tabela ou config versionada).
4. WHEN o preço do provedor é alterado na fonte versionada, THE AI_Hub SHALL passar a usar o novo preço sem deploy do código.

### Requirement 12: Segurança multi-tenant e migração V19 aditiva

**User Story:** Como engenheiro de dados, quero que a segurança multi-tenant seja preservada e que a migração V19 apenas adicione colunas novas, para que o isolamento RLS continue correto e nada existente seja recriado.

#### Acceptance Criteria

1. THE AI_Hub SHALL NOT alterar o worker RLS-safe de `ai_job` (`AiJobWorker`/`AiJobProcessor`) nem seu `FORCE ROW LEVEL SECURITY`.
2. THE migração V19 SHALL adicionar apenas colunas novas em `ai_usage_event`: `thinking_tokens`, `total_tokens`, `finish_reason` e `latency_ms`.
3. THE migração V19 SHALL NOT recriar as colunas `idempotency_key` nem `provider_cost` em `ai_usage_event` (já existem desde V8).
4. WHERE for necessário configurar thinking por slot de router, THE migração V19 SHALL adicionar as colunas opcionais `thinking_level` e `max_output_tokens` em `ai_model_config`.
5. THE migração V19 SHALL NOT alterar nenhuma política RLS existente.

### Requirement 13: Compatibilidade retroativa e segurança da demo

**User Story:** Como responsável pela demo, quero que o fluxo atual em mock continue funcionando sem alterações, para que a demonstração não quebre enquanto a integração real evolui.

#### Acceptance Criteria

1. THE Mock_Adapter SHALL permanecer ativo em `@Profile("!cloud")` como bean padrão de `AiGatewayPort`.
2. THE AI_Hub SHALL manter a assinatura legada `AiGatewayPort.run(AiModel, AiRequest)` como default method que delega para a nova sobrecarga.
3. WHEN o fluxo de demo atual executa em mock, THE AI_Hub SHALL produzir os mesmos outputs determinísticos por tarefa que produz hoje.
4. THE AnalysisView SHALL continuar expondo `inputUnits`, `outputUnits` e `ocrPages`.

### Requirement 14: Segurança e autenticação ADC (não-funcional)

**User Story:** Como responsável por segurança, quero que a autenticação use ADC em todos os ambientes e que nenhum segredo seja versionado ou logado, para que não exista `key.json` e nenhuma credencial vaze.

#### Acceptance Criteria

1. WHERE o ambiente é desenvolvimento local, THE Vertex_Adapter SHALL autenticar via `gcloud auth application-default login` (ADC).
2. WHERE o ambiente é Cloud Run, THE Vertex_Adapter SHALL autenticar via Workload Identity / service account anexada.
3. THE AI_Hub SHALL operar sem nenhum arquivo `key.json` em qualquer ambiente.
4. THE AI_Hub SHALL NOT registrar em log nem ecoar segredos ou credenciais.
5. IF ADC não está disponível no ambiente `cloud`, THEN THE AI_Hub SHALL falhar explicitamente na inicialização em vez de subir sem credenciais.

### Requirement 15: Build verde — contrato AiResult propagado a todos os call sites (não-funcional)

**User Story:** Como mantenedor, quero que a evolução do contrato `AiResult` seja refletida em todos os call sites, para que o build permaneça verde após a mudança de contrato.

#### Acceptance Criteria

1. WHEN o record AiResult é evoluído, THE AI_Hub SHALL atualizar todos os call sites (`AiHubService.analyze`/`usagePayload`, `AiUsageLedgerAdapter.record`, `Mock_Adapter`) para compilar com o novo contrato.
2. THE AiResult SHALL oferecer um factory de compatibilidade (`AiResult.of(...)`) que deriva `inputUnits`/`outputUnits` a partir de `promptTokens`/`outputTokens`.
3. WHEN o código do módulo `ai` é compilado após a evolução de contrato, THE AI_Hub SHALL compilar sem erros (build verde).
