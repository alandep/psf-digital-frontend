# Implementation Plan: Assistente IA — Integração (Escopo B)

## Overview

Este plano implementa o **Escopo B** completo: todas as telas de IA do EIP passam a funcionar **sem mock**, consumindo um backend real plugado no Vertex AI. A entrega estende o módulo `ai` (Java 21 / Spring Boot, hexagonal, Spring Modulith) com três novas `AiTask` estruturadas, endpoints BFF dedicados por capacidade, OCR multimodal de binário, observabilidade derivada do ledger e novas migrations Flyway (`V24+`); e reconecta o frontend (Angular 20) via tokens de injeção (`AI_SERVICE` estendido e novo `AI_OPERATIONS_SERVICE`), eliminando mocks do caminho real.

A ordem é **incremental e testável**, capacidade por capacidade, sempre backend → front:

1. Fundação da tela do Assistente (Req 1-12): infra base de serviço do front que destrava as demais telas.
2. NCM estruturado (Req 14).
3. Simulação de transporte (Req 15).
4. Criação por linguagem natural (Req 16).
5. OCR Upload multimodal (Req 17).
6. Observabilidade do AI Operations Center (Req 13).
7. Consistência transversal + ArchUnit (Req 18) e deploy/validação (Req 18.8).

Dentro de cada capacidade de backend: domínio → aplicação → adapter → BFF → migration; depois no front: tipos → serviço (HTTP + mock) → token → tela.

Linguagem de implementação: **Java 21 / Spring Boot** (backend) e **TypeScript / Angular 20** (frontend) — já definida no design, nenhuma seleção de linguagem necessária.

### Decisões definitivas fixadas no design (sempre visíveis)

- **OCR = Gemini multimodal via Vertex** (sem habilitar nova API GCP), lendo o binário do object storage por `fileUri`/`gs://`. `DocumentAiGatewayAdapter` é extensão futura opcional (NÃO implementar neste escopo).
- **Contrato NCM/transporte/NL = endpoints BFF dedicados** com DTO tipado (`NcmClassificationView`, `TransportSimulationView`, `ExportDraftView`). O **BFF** faz o parse/validação do JSON estruturado; o front **nunca** faz `JSON.parse` de string.
- **Acurácia** derivada só onde há sinal real (confiança média de `NCM_CLASSIFICATION` e `OCR_DOCUMENT`); demais capacidades retornam `null` e a UI renderiza **"n/a"**.

### Convenções deste plano

- Tarefas marcadas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido; o agente NÃO as implementa automaticamente.
- Tarefas que editam código Java/SQL/TS DEVEM ser feitas via ferramentas de edição de arquivo / subagente de execução. **NUNCA** editar esses arquivos via PowerShell (risco de corrupção UTF-8).
- Raiz dos pacotes backend: `backend/src/main/java/com/eip/modules/ai/`. Migrations: `backend/src/main/resources/db/migration/` (próximas `V24+`).
- Serviços de IA do front vivem em `src/app/services/ai/`; tipos em `src/app/services/ai/types/`.

### Restrições globais (sempre visíveis)

- **Mock é o padrão da demo.** Adapters mock permanecem `@Profile("!cloud")` (backend) e são injetados quando `realApis.ai === false` (front). Nenhuma tarefa pode remover esse comportamento (Req 18.6).
- **Zero chamada Vertex paralela.** Toda capacidade passa por `AiGatewayPort`, `DefaultAiPromptRegistry`, `ModelRouterPort`, `AiPriceCatalogPort`, `QuotaPort` e `AiUsageLedgerPort` (Req 18.1). Verificado por ArchUnit.
- **Migrations aditivas.** `V24+` seguem o padrão `ON CONFLICT DO NOTHING`; não alterar RLS nem a estrutura de `ai_usage_event`.
- **Humano no circuito.** Nenhuma tela confirma ação de negócio automaticamente a partir de saída de IA (Req 14.8, 15.7, 16.5, 17.10).

## Tasks

- [ ] 0. Verificação do toolchain de build (pré-requisito)
  - [x] 0.1 Confirmar o comando canônico de build verde do backend e o runner de testes do front
    - Verificar ausência de Maven local; fixar o build verde do backend como `docker compose -f backend/docker-compose.yml build --no-cache app` (compila o módulo `ai` e todos os call sites dentro da imagem).
    - Verificar o runner de testes do front (`npm test` / `ng test` / Jest) e fixar o comando de execução única (sem watch).
    - Registrar que tarefas `*` (jqwik/fast-check) são ESCRITAS mas podem não rodar localmente sem JDK 21/Maven; documentar o fallback nas notas.
    - _Requirements: 18.8_

- [ ] 1. Fundação da tela do Assistente — serviço de IA do front (Req 1-12)
  - [x] 1.1 Estender os tipos de IA do front com as operações e capacidades do Escopo B
    - Arquivo: `src/app/services/ai/types/ai-hub.ts`.
    - Adicionar `AiJobView`, `AiUsageView`, `AiModelRouteView`; e os contratos tipados `NcmClassifyRequest`/`NcmClassificationResult`, `TransportSimRequest`/`TransportSimResult`, `NlCreateRequest`/`ExportDraft`, `OcrRequest`/`OcrExtractionResult` conforme o design (Data Models — Frontend).
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 1.2 Expandir a interface `IAiService` com análise assíncrona, job, uso, router e as capacidades estruturadas
    - Arquivo: `src/app/services/ai/ai-service.interface.ts`.
    - Adicionar `analisarAsync`, `jobStatus`, `uso`, `router`, `classificarNcm`, `simularTransporte`, `criarPorLinguagemNatural`, `ocr` (retornos tipados; sem `JSON.parse` no front).
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 7.5_

  - [x] 1.3 Implementar as operações base no `AiHttpService`
    - Arquivo: `src/app/services/ai/ai-http.service.ts`.
    - Implementar `analisarAsync` → `POST /bff/ai/analisar/async`, `jobStatus` → `GET /bff/ai/jobs/{id}`, `uso` → `GET /bff/ai/uso`, `router` → `GET /bff/ai/router`, todos sob `${environment.bffBaseUrl}/bff/ai` (cookie + CSRF via interceptors existentes).
    - _Requirements: 8.5, 4.1, 4.2, 5.1, 10.1_

  - [x] 1.4 Implementar as mesmas operações base no `AiMockAdapter` (demo-safe)
    - Arquivo: `src/app/services/ai/ai-mock.service.ts`.
    - Implementar `analisarAsync`/`jobStatus`/`uso`/`router` com respostas determinísticas, para o build e a demo com `realApis.ai === false`.
    - _Requirements: 8.6, 7.4_

  - [x] 1.5 Reconectar o `AiCopilotSimpleComponent` ao `AI_SERVICE` e remover respostas hardcoded
    - Arquivo: `src/app/.../assistente-ia/ai-copilot-simple.component.ts` (+ template).
    - Remover texto de resposta hardcoded e lógica de `setTimeout` simulando latência; obter respostas exclusivamente via `AI_SERVICE` (chat `CHAT`, agentes `NCM_CLASSIFICATION`/`DOCUMENT_SUMMARY`/`TRANSLATION`/`RISK_ANALYSIS`/`DOCUMENT_EXTRACTION`).
    - Exibir `output`, `provider`, `model`, `inputUnits`, `outputUnits` e `ocrPages` (quando `DOCUMENT_EXTRACTION` e `> 0`); indicador de carregamento por mensagem; validação de entrada obrigatória.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.3, 9.1, 9.2_

  - [x] 1.6 Implementar o fluxo assíncrono (job polling) e a exibição de uso/quota no Assistente
    - Mesmo componente: ao optar por assíncrono, chamar `analisarAsync`, fazer polling de `jobStatus` em intervalo definido enquanto não terminal, encerrar em sucesso/falha; carregar `uso()` na init e atualizar após operação bem-sucedida; indicação de indisponibilidade sem bloquear a tela.
    - _Requirements: 4.3, 4.4, 4.5, 5.2, 5.3, 5.4_

  - [x] 1.7 Mapear quick actions para agentes reais e marcar roadmap/indisponível
    - Mesmo componente: cada quick action mantida mapeia para uma invocação real via `AI_SERVICE`; remover quick actions sem agente real; marcar `Export`/`Compliance`/`Logistics`/`Finance`/`Analytics`/`Forecast` como "roadmap/indisponível" (não acionáveis), sem produzir resposta mockada.
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_

  - [x] 1.8 Tratamento e exibição explícita dos erros de IA + acessibilidade do chat
    - Mesmo componente: mapear `AI_QUOTA_EXCEEDED` (ação "Comprar créditos"), `AI_RATE_LIMITED` (usar `Retry-After`), `AI_TIMEOUT`/`AI_UNAVAILABLE`/`AI_PROVIDER_ERROR` (indisponibilidade + "tentar novamente"), `AI_RESPONSE_INVALID` (resposta inválida), `403` RBAC (acesso negado genérico); sem fallback mock. Adicionar `aria-live` para novas mensagens, navegação por teclado, retorno de foco ao campo e `aria-label` nos controles.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 10.3, 11.1, 11.2, 11.3, 11.4_

  - [ ]* 1.9 Testes de exemplo da tela do Assistente
    - Cobrir: envio de chat, acionamento de cada agente, validação de obrigatório, polling de job, atualização de uso, cada erro de IA mapeado e ausência de mock quando `realApis.ai === true`.
    - _Requirements: 1.1, 2.6, 4.3, 5.3, 6.1, 7.1, 12.1_

- [ ] 2. Checkpoint — Assistente integrado
  - Build verde do backend (tarefa 0.1); build/testes do front se o runner permitir. Garantir que o Assistente consome o `AI_SERVICE` sem mock. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 18.8_

- [ ] 3. Capacidade NCM estruturado — backend (Req 14)
  - [x] 3.1 Adicionar os records de domínio e o `StructuredOutputParser`
    - Arquivos: `domain/model/NcmClassification.java` (+ `NcmAlternative`) e `application/StructuredOutputParser.java` (parse + validação de campos obrigatórios; JSON inválido → erro mapeado para `AI_RESPONSE_INVALID`).
    - _Requirements: 14.2, 14.3_

  - [x] 3.2 Evoluir o prompt/schema de `NCM_CLASSIFICATION` no `DefaultAiPromptRegistry`
    - Arquivo: `application/.../DefaultAiPromptRegistry.java`.
    - Definir `responseSchemaJson` `{ ncm, confidence, rationale, alternatives:[{ncm,confidence,reason}] }`; bump de `promptVersion` (ex.: `v2-ncm_classification`) para invalidar cache antigo.
    - _Requirements: 14.2, 14.3_

  - [x] 3.3 Criar o `NcmBffController` dedicado (`POST /bff/ai/ncm/classificar`)
    - Arquivo: `adapter/in/bff/NcmBffController.java` + request `NcmClassifyRequest` (descrição obrigatória) + view `NcmClassificationView`.
    - Invoca `AiHubService.analyze(NCM_CLASSIFICATION, ...)`, faz o parse via `StructuredOutputParser` e devolve o DTO tipado; RBAC `ai-operations/painel` (create).
    - _Requirements: 14.1, 14.2, 14.4, 14.5, 18.3, 18.5_

  - [ ]* 3.4 Teste de propriedade — round-trip de saída estruturada (NCM) (Property 1)
    - **Property 1: Round-trip de saída estruturada** — *para todo* `NcmClassificationView` válido, `parse(serialize(x)) ≡ x`; JSON inválido → erro.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 1`.
    - **Validates: Requirements 14.2, 14.3**

  - [ ]* 3.5 Teste de propriedade — invariante de registro no ledger (NCM) (Property 4)
    - **Property 4: Invariante de registro no ledger** — execução sucesso → exatamente 1 registro `SUCCESS` com `operation=NCM_CLASSIFICATION` e telemetria; falha → exatamente 1 `FAILURE` com `failure_category`.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 4`.
    - **Validates: Requirements 18.2**

- [ ] 4. Capacidade NCM estruturado — frontend (Req 14)
  - [x] 4.1 Implementar `classificarNcm` no `AiHttpService` e no `AiMockAdapter`
    - `AiHttpService`: `POST /bff/ai/ncm/classificar` retornando `NcmClassificationResult` tipado (sem `JSON.parse`). `AiMockAdapter`: resultado determinístico.
    - _Requirements: 14.1, 14.4, 14.9_

  - [x] 4.2 Reconectar `NCMClassificacaoComponent` + `classificacao-form-dialog` ao `AI_SERVICE`
    - Arquivos: `src/app/.../produtos/ncm/*` e o diálogo de formulário.
    - Injetar `AI_SERVICE` e usar `classificarNcm`; exibir `ncm`/`confidence`/`rationale` e alternativas; bloquear envio sem descrição; sinalizar revisão humana abaixo do limiar; preservar humano no circuito (não aplicar automaticamente); remover `NCMClassificationMockService` do caminho real; mapear erros de IA sem fallback.
    - _Requirements: 14.1, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10, 14.11_

  - [x] 4.3 Fazer o Assistente consumir `classificarNcm` tipado para NCM (Req 2)
    - Arquivo: `AiCopilotSimpleComponent`.
    - Para o agente `NCM_CLASSIFICATION`, consumir `AI_SERVICE.classificarNcm` tipado e exibir `ncm`/`confidence`/`rationale`/alternativas, sem fazer `JSON.parse` de string.
    - _Requirements: 2.7, 2.8, 2.9, 2.10_

  - [ ]* 4.4 Testes de exemplo do fluxo NCM (tela + diálogo)
    - Cobrir exibição de score/justificativa/alternativas, bloqueio sem descrição, sinalização de revisão e ausência de mock com `realApis.ai === true`.
    - _Requirements: 14.4, 14.6, 14.7, 14.10_

- [ ] 5. Capacidade Simulação de Transporte — backend (Req 15)
  - [x] 5.1 Adicionar a `AiTask.TRANSPORT_SIMULATION` e o record de domínio
    - Arquivos: `domain/model/AiTask.java` (novo valor) e `domain/model/TransportSimulation.java`.
    - _Requirements: 15.2, 15.3_

  - [x] 5.2 Adicionar o prompt/schema de `TRANSPORT_SIMULATION` no `DefaultAiPromptRegistry`
    - `responseSchemaJson` `{ carrier, modal, route, rationale, estimatedTransitDays?, estimatedCost? }`.
    - _Requirements: 15.2, 15.3_

  - [x] 5.3 Criar o `TransportBffController` dedicado (`POST /bff/ai/transporte/simular`)
    - Arquivo: `adapter/in/bff/TransportBffController.java` + request `TransportSimRequest` (origem/destino/produto/quantidade/modal/incoterm/data) + view `TransportSimulationView`.
    - Invoca `AiHubService.analyze(TRANSPORT_SIMULATION, ...)`, parse via `StructuredOutputParser`, devolve DTO tipado; RBAC `ai-operations/painel` (create); registra no ledger via o pipeline existente.
    - _Requirements: 15.1, 15.3, 15.4, 15.6, 18.3, 18.5_

  - [ ]* 5.4 Teste de propriedade — round-trip de saída estruturada (transporte) (Property 1)
    - **Property 1: Round-trip de saída estruturada** — *para todo* `TransportSimulationView` válido, `parse(serialize(x)) ≡ x`; JSON inválido → erro.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 1`.
    - **Validates: Requirements 15.3**

  - [ ]* 5.5 Teste de propriedade — invariante de registro no ledger (transporte) (Property 4)
    - **Property 4: Invariante de registro no ledger** — sucesso → 1 registro `SUCCESS` com `operation=TRANSPORT_SIMULATION`; falha → 1 `FAILURE`.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 4`.
    - **Validates: Requirements 15.6**

- [ ] 6. Capacidade Simulação de Transporte — frontend (Req 15)
  - [x] 6.1 Implementar `simularTransporte` no `AiHttpService` e no `AiMockAdapter`
    - `AiHttpService`: `POST /bff/ai/transporte/simular` → `TransportSimResult` tipado. `AiMockAdapter`: determinístico.
    - _Requirements: 15.1, 15.4, 15.8_

  - [x] 6.2 Reconectar `transportadoras.component.ts` + diálogo de simulação ao `AI_SERVICE`
    - Arquivos: `src/app/.../logistica/transportadoras/*` e o diálogo de simulação.
    - Validar campos obrigatórios da `Entrada_Transporte`; chamar `simularTransporte`; exibir transportadora/modal/rota + justificativa; humano no circuito (não contratar automaticamente); sem mock; mapear erros de IA.
    - _Requirements: 15.1, 15.4, 15.5, 15.7, 15.8, 15.9_

  - [ ]* 6.3 Testes de exemplo do fluxo de transporte
    - Validação de obrigatórios, exibição de recomendação/justificativa e ausência de mock com flag real.
    - _Requirements: 15.4, 15.5, 15.8_

- [ ] 7. Capacidade Criação por Linguagem Natural — backend (Req 16)
  - [x] 7.1 Adicionar a `AiTask.EXPORT_NL_CREATION` e o record `ExportDraft`
    - Arquivos: `domain/model/AiTask.java` (novo valor) e `domain/model/ExportDraft.java`.
    - _Requirements: 16.2, 16.3_

  - [x] 7.2 Adicionar o prompt/schema de `EXPORT_NL_CREATION` no `DefaultAiPromptRegistry`
    - `responseSchemaJson` `{ incoterm, origin, destination, product, ncm?, quantity, unit, notes }`.
    - _Requirements: 16.2, 16.3_

  - [x] 7.3 Criar o `ExportNlBffController` dedicado (`POST /bff/ai/exportacao/criar-nl`)
    - Arquivo: `adapter/in/bff/ExportNlBffController.java` + request `NlCreateRequest` (comando obrigatório) + view `ExportDraftView`.
    - Invoca `AiHubService.analyze(EXPORT_NL_CREATION, command)`, parse via `StructuredOutputParser`, devolve DTO tipado; RBAC `ai-operations/painel` (create); ledger.
    - _Requirements: 16.1, 16.3, 16.4, 16.7, 18.3, 18.5_

  - [ ]* 7.4 Teste de propriedade — round-trip de saída estruturada (NL) (Property 1)
    - **Property 1: Round-trip de saída estruturada** — *para todo* `ExportDraftView` válido, `parse(serialize(x)) ≡ x`; JSON inválido → erro.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 1`.
    - **Validates: Requirements 16.3**

  - [ ]* 7.5 Teste de propriedade — invariante de registro no ledger (NL) (Property 4)
    - **Property 4: Invariante de registro no ledger** — sucesso → 1 registro `SUCCESS` com `operation=EXPORT_NL_CREATION`; falha → 1 `FAILURE`.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 4`.
    - **Validates: Requirements 16.7**

- [ ] 8. Capacidade Criação por Linguagem Natural — frontend (Req 16)
  - [x] 8.1 Implementar `criarPorLinguagemNatural` no `AiHttpService` e no `AiMockAdapter`
    - `AiHttpService`: `POST /bff/ai/exportacao/criar-nl` → `ExportDraft` tipado. `AiMockAdapter`: determinístico.
    - _Requirements: 16.1, 16.4, 16.8_

  - [x] 8.2 Reconectar `AiCreateDialogComponent` + fluxo "Criar com IA" em `/exportacoes/gerenciar`
    - Arquivos: `src/app/.../exportacoes/gerenciar/*` e `AiCreateDialogComponent`.
    - Bloquear comando vazio; chamar `criarPorLinguagemNatural`; exibir rascunho para revisão; criar exportação **somente** após confirmação explícita (humano no circuito); sem mock; mapear erros de IA.
    - _Requirements: 16.1, 16.4, 16.5, 16.6, 16.8, 16.9_

  - [ ]* 8.3 Testes de exemplo do fluxo de criação por NL
    - Comando vazio bloqueado; rascunho exibido; exportação criada só após confirmar; ausência de mock com flag real.
    - _Requirements: 16.4, 16.5, 16.6_

- [ ] 9. Checkpoint — capacidades estruturadas (NCM/transporte/NL)
  - Build verde do backend (tarefa 0.1); build/testes do front se possível. Confirmar endpoints dedicados devolvendo DTO tipado e telas sem mock. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 18.8_

- [ ] 10. Capacidade OCR Upload — backend multimodal (Req 17)
  - [x] 10.1 Estender o `AiGatewayPort` com `runMultimodal` + `StorageRef`
    - Arquivo: `domain/port/out/AiGatewayPort.java`.
    - Adicionar `runMultimodal(model, request, policy, prompt, StorageRef)` e o record `StorageRef(uri, mediaType)`.
    - _Requirements: 17.3_

  - [x] 10.2 Implementar `runMultimodal` no `MockAiGatewayAdapter` (demo-safe)
    - Arquivo: `adapter/out/ai/MockAiGatewayAdapter.java` (`@Profile("!cloud")`).
    - Devolver extração determinística + telemetria coerente (`ocrPages > 0`).
    - _Requirements: 17.3_

  - [x] 10.3 Implementar `runMultimodal` no `VertexAiGatewayAdapter` (Gemini multimodal via Vertex)
    - Arquivo: `adapter/out/ai/VertexAiGatewayAdapter.java` (`@Profile("cloud")`).
    - Montar `contents` com `part` de `fileData` (`fileUri=gs://bucket/key` + `mimeType`) + `text`, usando o mesmo `responseSchema`; **sem** habilitar nova API GCP. NÃO implementar `DocumentAiGatewayAdapter` (extensão futura).
    - _Requirements: 17.3_

  - [x] 10.4 Adicionar a `AiTask.OCR_DOCUMENT` e o prompt/schema de extração
    - Arquivos: `domain/model/AiTask.java` (novo valor) e `DefaultAiPromptRegistry` (schema de extração + `promptVersion`).
    - _Requirements: 17.3, 17.4_

  - [x] 10.5 Implementar o `OcrExtractionUseCase` + `OcrService` (aplicação)
    - Arquivos: `domain/port/in/OcrExtractionUseCase.java` (+ `OcrCommand`/`OcrExtractionView`) e `application/OcrService.java`.
    - Resolver modelo (`router.resolve(OCR_DOCUMENT)`), checar quota, montar `AiPromptSpec` com schema, chamar `gateway.runMultimodal`, validar com o validador de extração, calcular `Score_Completude` (razão de campos obrigatórios presentes) e `needsReview`, detectar discrepâncias (ex.: peso de packing list), registrar no ledger (`ocr_pages`).
    - _Requirements: 17.3, 17.4, 17.6, 17.7, 17.9_

  - [x] 10.6 Criar o `OcrBffController` (`POST /bff/ai/ocr`)
    - Arquivo: `adapter/in/bff/OcrBffController.java` + `OcrRequest {storageKey, mediaType, docKind}` (todos obrigatórios/validados) + view `OcrExtractionView`.
    - RBAC `ai-operations/painel` (create); validar `mediaType` suportado (formato inválido → erro antes do provedor).
    - _Requirements: 17.2, 17.4, 17.5, 17.8, 18.3, 18.5_

  - [ ]* 10.7 Teste de propriedade — round-trip de saída estruturada (extração OCR) (Property 1)
    - **Property 1: Round-trip de saída estruturada** — *para toda* extração de OCR válida, `parse(serialize(x)) ≡ x`; JSON inválido → erro.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 1`.
    - **Validates: Requirements 17.4**

  - [ ]* 10.8 Teste de propriedade — invariante do score de completude (Property 5)
    - **Property 5: Invariante do score de completude** — *para todo* resultado de extração, `0 <= score <= 100`, `score==100 ⟺ todos obrigatórios presentes`, `needsReview ⟺ score < limiar`.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 5`.
    - **Validates: Requirements 17.4, 17.6**

  - [ ]* 10.9 Teste de propriedade — invariante de registro no ledger (OCR) (Property 4)
    - **Property 4: Invariante de registro no ledger** — sucesso → 1 registro `SUCCESS` com `operation=OCR_DOCUMENT` e `ocr_pages > 0`; falha → 1 `FAILURE`.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 4`.
    - **Validates: Requirements 17.9**

- [ ] 11. Capacidade OCR Upload — frontend (Req 17)
  - [x] 11.1 Implementar `ocr` no `AiHttpService` e no `AiMockAdapter`
    - `AiHttpService`: `POST /bff/ai/ocr` → `OcrExtractionResult` tipado. `AiMockAdapter`: determinístico (inclui discrepância e `needsReview`).
    - _Requirements: 17.2, 17.5, 17.11_

  - [x] 11.2 Implementar o fluxo "OCR Upload" em `/exportacoes/gerenciar`
    - Arquivos: fluxo/diálogo de OCR Upload + serviço de documentos (`StoragePort`) existente.
    - Validar formato suportado no front antes do upload; obter URL assinada e fazer `PUT` do binário ao storage; chamar `AI_SERVICE.ocr` referenciando a `storageKey`; exibir extração + `Score_Completude`; sinalizar revisão abaixo do limiar; destacar discrepância (peso); humano no circuito; sem mock; mapear erros de IA.
    - _Requirements: 17.1, 17.2, 17.5, 17.6, 17.7, 17.8, 17.10, 17.11, 17.12_

  - [ ]* 11.3 Teste de propriedade — score de completude no front (Property 5)
    - **Property 5: Invariante do score de completude** — *para todo* `OcrExtractionResult`, `needsReview` segue o limiar e o score respeita `0..100` na renderização.
    - fast-check, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 5`.
    - **Validates: Requirements 17.4, 17.6**

  - [ ]* 11.4 Testes de exemplo do fluxo OCR Upload
    - Upload por URL assinada (storage mockado), chamada ao `/bff/ai/ocr`, exibição de extração/score/discrepância, formato inválido bloqueado, ausência de mock com flag real.
    - _Requirements: 17.1, 17.5, 17.7, 17.8_

- [ ] 12. Capacidade Observabilidade (AI Operations) — backend (Req 13)
  - [x] 12.1 Criar a porta de leitura `AiUsageAnalyticsPort` + adapter JPA de agregação
    - Arquivos: `domain/port/out/AiUsageAnalyticsPort.java` + `adapter/out/persistence/AiUsageAnalyticsAdapter.java`.
    - Agregar sobre `ai_usage_event` por `(organization_id, operation)` e janela (`LAST_24H`/`LAST_7D`): `requests` (COUNT), `avgResponseTimeMs` (AVG `latency_ms`), `cost` (SUM `provider_cost`), última `failure_category`/horário; `accuracy` só para `NCM_CLASSIFICATION`/`OCR_DOCUMENT` (confiança média), senão `null`.
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.7_

  - [x] 12.2 Implementar a derivação determinística de `Status_Capacidade`
    - Função pura em `application/`: `OFFLINE` (sem `SUCCESS` e ≥1 `FAILURE`), `DEGRADED` (proporção de `FAILURE` ou latência média acima do limiar), `MAINTENANCE` (task desabilitada no `ai_model_config`), `ACTIVE` caso contrário.
    - _Requirements: 13.6_

  - [x] 12.3 Implementar o `AiOperationsQueryUseCase` + `AiOperationsBffController`
    - Arquivos: `domain/port/in/AiOperationsQueryUseCase.java` (+ `CapabilityMetricView`/`AiErrorView`/`MetricsWindow`) e `adapter/in/bff/AiOperationsBffController.java` (`GET /bff/ai/operations/metrics`, `GET /bff/ai/operations/errors`), RBAC `ai-operations/painel` (view).
    - Mapear capacidades exibidas às `AiTask`/reconciliação reais (sem agentes fantasma); `accuracy=null` → UI "n/a".
    - _Requirements: 13.1, 13.2, 13.8, 13.9, 13.10_

  - [ ]* 12.4 Teste de propriedade — invariância da agregação de métricas (Property 2)
    - **Property 2: Invariância da agregação de métricas** — *para todo* conjunto de eventos, `requests`/`cost`/`avgResponseTimeMs` conferem com cálculo de referência; `accuracy` não-`null` só para `NCM_CLASSIFICATION`/`OCR_DOCUMENT`.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 2`.
    - **Validates: Requirements 13.2, 13.3, 13.4, 13.5**

  - [ ]* 12.5 Teste de propriedade — derivação determinística do status (Property 3)
    - **Property 3: Derivação determinística do status da capacidade** — *para todo* conjunto de desfechos, o status derivado segue a regra `OFFLINE`/`DEGRADED`/`MAINTENANCE`/`ACTIVE`.
    - jqwik, ≥100 iterações. Tag: `Feature: assistente-ia-integracao, Property 3`.
    - **Validates: Requirements 13.6**

- [ ] 13. Capacidade Observabilidade (AI Operations) — frontend (Req 13)
  - [x] 13.1 Criar o token `AI_OPERATIONS_SERVICE` com interface e provider
    - Arquivo: `src/app/services/ai/ai-operations-service.token.ts`.
    - Definir `IAiOperationsService` (`getCapabilities`/`getMetrics`/`getErrors`) e `AI_OPERATIONS_SERVICE` resolvendo para `AiOperationsHttpService` quando `realApis.ai === true` e `AiOperationsMockAdapter` caso contrário.
    - _Requirements: 13.1, 13.10, 13.11_

  - [x] 13.2 Implementar `AiOperationsHttpService` e renomear o mock para `AiOperationsMockAdapter`
    - Arquivos: `src/app/services/ai/ai-operations-http.service.ts` e renomear/adaptar `aiOperationsMockService.ts` → `AiOperationsMockAdapter` (fallback mock apenas).
    - `AiOperationsHttpService` chama `GET /bff/ai/operations/metrics` e `/errors` e adapta ao shape `CapabilityMetric`/`AiErrorEntry` da tela; `accuracy: null` preservado.
    - _Requirements: 13.1, 13.2, 13.3, 13.7, 13.8_

  - [x] 13.3 Reconectar `AiOperationsDashboardComponent` ao token e renderizar "n/a"
    - Arquivo: `src/app/.../ai-operations/dashboard/*`.
    - Injetar `AI_OPERATIONS_SERVICE` (remover injeção direta de `AiOperationsMockService`); exibir requests/tempo/custo/status/últimos erros por capacidade; renderizar **"n/a"** quando `accuracy` é `null`; indicação de indisponibilidade sem substituir por mock.
    - _Requirements: 13.1, 13.3, 13.5, 13.8, 13.9, 13.10, 13.11, 13.12_

  - [ ]* 13.4 Testes de exemplo da tela de observabilidade
    - Exibição de métricas/erros, "n/a" para `accuracy` null, indisponibilidade sem mock e não-injeção do mock com `realApis.ai === true`.
    - _Requirements: 13.3, 13.5, 13.11, 13.12_

- [ ] 14. Migrations Flyway do Escopo B (roteamento das novas tasks)
  - [x] 14.1 Criar `V24__ai_scope_b_router.sql` (seed aditivo de roteamento)
    - Arquivo: `backend/src/main/resources/db/migration/V24__ai_scope_b_router.sql`.
    - Inserir rotas de `TRANSPORT_SIMULATION`, `EXPORT_NL_CREATION`, `OCR_DOCUMENT` em `ai_model_config` (`provider`, `model`, `priority`, `cost_class`, `thinking_level`, `max_output_tokens`, `thinking_supported`), seguindo `unique(task, priority)` e `ON CONFLICT (task, priority) DO NOTHING`; definir `thinking_budget_tokens` quando `thinking_supported=true`. Editar via ferramenta de arquivo (nunca PowerShell).
    - _Requirements: 15.2, 16.2, 17.3, 18.7_

- [ ] 15. Consistência transversal e testes arquiteturais (Req 18)
  - [x] 15.1 Mapear erros do `StructuredOutputParser`/OCR no `AiExceptionHandler`
    - Garantir que parse/schema inválido vira `AI_RESPONSE_INVALID` (422) e que RBAC negado vira 403 genérico para todas as capacidades novas, sem fallback mock.
    - _Requirements: 18.5, 6.6, 14.11, 15.9, 16.9, 17.12, 13.12_

  - [ ]* 15.2 Teste ArchUnit — nenhuma capacidade chama Vertex fora do `AiGatewayPort`
    - Regra: nenhuma classe fora de `adapter.out.ai` depende de `VertexAiGatewayAdapter`/caller Vertex; todas as capacidades passam pela porta.
    - _Requirements: 18.1, 17.3_

  - [ ]* 15.3 Teste de verificação de roteamento configurável das novas tasks
    - Verificar que `TRANSPORT_SIMULATION`, `EXPORT_NL_CREATION`, `OCR_DOCUMENT` resolvem via `ai_model_config` (sem literais de código).
    - _Requirements: 18.7_

- [x] 16. Checkpoint — ecossistema completo em build verde
  - Build verde do backend (tarefa 0.1); build/testes do front se possível. Confirmar as 6 telas consumindo serviços reais via token DI e nenhum mock no caminho real. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 18.6, 18.8_

- [ ] 17. Deploy e validação (exige credenciais/ambiente cloud)
  - [x] 17.1 Build da nova imagem do backend
    - Executar `docker compose -f backend/docker-compose.yml build --no-cache app` para gerar a imagem contendo as novas capacidades.
    - _Requirements: 18.8_

  - [ ] 17.2 Publicar nova revisão no Cloud Run via o CD existente
    - **Exige ambiente/credenciais cloud (não executável pelo agente sem credenciais).** Disparar o fluxo normal de release de `.github/workflows/cd.yml` (nova imagem → nova revisão Cloud Run). As migrations `V24+` são aplicadas no startup pelo Flyway (aditivas/idempotentes).
    - _Requirements: 18.8_

  - [ ] 17.3 Confirmar flags `realApis.ai === true` e validação E2E das telas sem mock
    - **Exige ambiente cloud + ADC.** Garantir `realApis.ai === true` no ambiente alvo; validar E2E (automatizada quando possível) das 6 telas (Assistente, AI Operations, NCM, Transporte, Criar com IA, OCR Upload) consumindo o backend real, sem nenhum dado mockado, com os erros de IA reais subindo às telas.
    - _Requirements: 18.6, 18.8_

- [ ] 18. Checkpoint final
  - Confirmar deploy, migrations aplicadas e validação E2E das telas sem mock. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 18.8_

## Notes

- Tarefas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido; o agente NÃO as implementa automaticamente.
- **Mock-default / demo-safety:** adapters mock permanecem `@Profile("!cloud")` (backend) e injetados quando `realApis.ai === false` (front) em todas as fases (Req 18.6).
- **Zero chamada Vertex paralela:** verificado por ArchUnit (tarefa 15.2); toda capacidade passa pelo `AiGatewayPort` (Req 18.1).
- **Contrato dedicado:** NCM/transporte/NL usam endpoints BFF próprios com DTO tipado; o front nunca faz `JSON.parse` de string. OCR usa Gemini multimodal via Vertex (sem nova API GCP); Document AI é extensão futura (não implementada).
- **Acurácia:** derivada só de `NCM_CLASSIFICATION`/`OCR_DOCUMENT`; demais `null` → UI "n/a".
- **Edição segura:** arquivos Java/SQL/TS são editados apenas por ferramentas de edição / subagente; nunca via PowerShell (corrupção UTF-8).
- **Toolchain:** sem Maven local — build verde do backend via `docker compose -f backend/docker-compose.yml build --no-cache app`. Testes `*` (jqwik/fast-check) são ESCRITOS mas podem não rodar localmente; rodam em ambiente com JDK 21/Maven ou no runner do front.
- **Etapas que exigem credenciais/ambiente cloud:** 17.2 (deploy Cloud Run via CD), 17.3 (flags + validação E2E com ADC). O agente NÃO as executa sem credenciais.
- **Testes de propriedade (5):** Property 1 (round-trip estruturado, tarefas 3.4/5.4/7.4/10.7 — back; e 11.3 toca score no front), Property 2 (agregação de métricas, 12.4), Property 3 (derivação de status, 12.5), Property 4 (invariante de ledger, 3.5/5.5/7.5/10.9), Property 5 (score de completude, 10.8 back / 11.3 front). jqwik no backend e fast-check no front, ≥100 iterações.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["0.1"] },
    { "id": 1, "tasks": ["1.1"] },
    { "id": 2, "tasks": ["1.2"] },
    { "id": 3, "tasks": ["1.3"] },
    { "id": 4, "tasks": ["1.4"] },
    { "id": 5, "tasks": ["1.5"] },
    { "id": 6, "tasks": ["1.6"] },
    { "id": 7, "tasks": ["1.7"] },
    { "id": 8, "tasks": ["1.8"] },
    { "id": 9, "tasks": ["1.9", "3.1", "12.1"] },
    { "id": 10, "tasks": ["5.1", "12.2"] },
    { "id": 11, "tasks": ["7.1"] },
    { "id": 12, "tasks": ["10.1"] },
    { "id": 13, "tasks": ["3.2"] },
    { "id": 14, "tasks": ["5.2"] },
    { "id": 15, "tasks": ["7.2"] },
    { "id": 16, "tasks": ["10.4", "10.2", "10.3", "12.3"] },
    { "id": 17, "tasks": ["3.3", "5.3", "7.3", "10.5", "13.1"] },
    { "id": 18, "tasks": ["3.4", "3.5", "5.4", "5.5", "7.4", "7.5", "10.6", "12.4", "12.5", "13.2"] },
    { "id": 19, "tasks": ["4.1", "10.7", "10.8", "10.9", "13.3"] },
    { "id": 20, "tasks": ["6.1", "4.2", "13.4", "14.1"] },
    { "id": 21, "tasks": ["8.1", "4.3", "6.2", "6.3"] },
    { "id": 22, "tasks": ["11.1", "4.4", "8.2", "8.3"] },
    { "id": 23, "tasks": ["11.2", "15.1"] },
    { "id": 24, "tasks": ["11.3", "11.4", "15.2", "15.3"] },
    { "id": 25, "tasks": ["17.1"] },
    { "id": 26, "tasks": ["17.2"] },
    { "id": 27, "tasks": ["17.3"] }
  ]
}
```
