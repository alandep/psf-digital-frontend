# Requirements Document

## Introduction

Esta spec cobre o **ecossistema de IA completo do EIP (Export Intelligence Platform)** (Escopo B): **TODAS** as telas de IA do produto devem funcionar **SEM MOCK**, consumindo um backend real plugado no Vertex AI. Isso exige **estender o backend de IA existente** (Spring Boot, módulo `ai` hexagonal, implantado no GCP via Cloud Run + Vertex AI no profile `cloud`) com novas capacidades e **publicar um novo deploy no Cloud Run**, além de reconectar as telas do frontend (Angular 20) ao backend real.

O backend de IA já existe e funciona para um subconjunto de capacidades (chat, classificação NCM textual, resumo, tradução, análise de risco, extração/reconciliação por texto), expostas via BFF sob a base `/bff/ai`. O Escopo B **reusa** essa arquitetura hexagonal — porta de saída `AiGatewayPort`, `DefaultAiPromptRegistry`, enum `AiTask`, `AiHubService`, worker assíncrono, roteador de modelos (`ModelRouterPort`/`ai_model_config`), pricing (`AiPriceCatalogPort`), quota (`QuotaPort`) e ledger de uso (`AiUsageLedgerPort`/`ai_usage_event`) — para adicionar as capacidades que hoje são mock, **sem** criar chamadas Vertex paralelas.

### Mudança de escopo (A → B)

O Escopo A anterior limitava a feature à tela do Assistente de IA (`/home-logged/assistente-ia`, `AiCopilotSimpleComponent`), tratando as demais telas de IA como "fora de escopo (roadmap)". O Escopo B remove essa limitação: **todas** as telas de IA que hoje usam mock passam a consumir o backend real.

Os 12 requisitos originais (Requirement 1 a Requirement 12) continuam **válidos** e descrevem a integração da tela do Assistente. Os requisitos novos (Requirement 13 a Requirement 18) cobrem as telas e capacidades que no Escopo A eram roadmap e agora exigem backend real.

Esta feature tem os seguintes objetivos:

1. **Remover todo o mock/resposta hardcoded** de **todas** as telas de IA do EIP (Assistente, AI Operations Center, Classificação NCM, Simulação de Transporte, Criação Inteligente, OCR Upload) e dos serviços que elas usam.
2. **Estender o backend de IA** com novas capacidades reais plugadas no Vertex: observabilidade real de agentes a partir do ledger; classificação NCM estruturada (código + score + justificativa); simulação de transporte apoiada por IA; criação de exportação por comando em linguagem natural; e OCR real de arquivo binário (PDF/imagem) com extração estruturada e score de completude.
3. **Expandir a camada de serviço do front** para cobrir os endpoints novos e existentes do BFF, mantendo o padrão de adapters por token de injeção (interface + adapter HTTP + adapter mock + token DI).
4. **Garantir observabilidade e custo** de cada capacidade via o ledger de uso (`ai_usage_event`), com tratamento explícito dos erros de IA e trilha de "humano no circuito" (a IA sugere, a pessoa decide).

**Princípio norteador:** cada tela deve consumir IA **exclusivamente** através do seu token de injeção de serviço (ex.: `AI_SERVICE`), que resolve para o adapter HTTP real quando a flag `realApis` correspondente é `true`. Nenhuma credencial ou segredo deve existir no front; sessão e CSRF já são anexados automaticamente pelos interceptors. Nenhum valor hardcoded ou mock pode permanecer nas telas de IA quando a flag real está ativa.

### Base factual (backend de IA já existente)

- Controller `AiHubBffController`, base `/bff/ai`, protegido por RBAC `ai-operations/painel` (view/create) e `ai-operations/router` (view):
  - `POST /bff/ai/analisar` → síncrono → `AnalysisView` `{task, output, provider, model, inputUnits, outputUnits, ocrPages}`
  - `POST /bff/ai/analisar/async` → `202` → `JobView` (job assíncrono)
  - `GET /bff/ai/jobs/{id}` → status/resultado do job
  - `GET /bff/ai/uso` → consumo/quota de IA do tenant
  - `GET /bff/ai/router` → configuração de roteamento de modelos
- Controller `ReconciliationBffController`, base `/bff/ai`:
  - `POST /bff/ai/reconciliar` → `ReconciliationResponse` `{pedido, packing, invoice (DocumentExtractionResult), allExtracted, reconciliation (divergences[], explanation, ok), review (needsReview, reasons[], signalSource)}`
- Agentes/tasks suportadas (`AiTask` / `DefaultAiPromptRegistry`): `NCM_CLASSIFICATION`, `DOCUMENT_SUMMARY`, `TRANSLATION`, `RISK_ANALYSIS`, `DOCUMENT_EXTRACTION`, `CHAT`.
- Erros de IA mapeados por `AiExceptionHandler`: `AI_QUOTA_EXCEEDED` (HTTP 402), `AI_RATE_LIMITED` (429, com `Retry-After`), `AI_TIMEOUT` (504), `AI_UNAVAILABLE` (503, circuit breaker aberto), `AI_PROVIDER_ERROR` (502/503), `AI_RESPONSE_INVALID` (422).
- Contrato de entrada do backend (estado atual, a evoluir no Escopo B): `POST /bff/ai/analisar` recebe **texto** (string de entrada) e devolve apenas `AnalysisView` `{task, output, provider, model, inputUnits, outputUnits, ocrPages}` — para `NCM_CLASSIFICATION`, a saída é hoje a string `output`, **sem** campos dedicados de score de confiança ou justificativa. `POST /bff/ai/reconciliar` recebe **texto** dos três documentos (pedido, packing, invoice como strings), não arquivos binários.
- Padrão de saída estruturada já existente: a task `DOCUMENT_EXTRACTION` já configura `responseSchemaJson` no `DefaultAiPromptRegistry`, de modo que o `VertexAiGatewayAdapter` envia `responseMimeType=application/json` + `responseSchema` e o Vertex devolve JSON estruturado validado. Esse é o mecanismo que o Escopo B reusa para NCM estruturado, simulação de transporte e criação por linguagem natural.
- Storage já existente para arquivos binários: o módulo `document` expõe `StoragePort` (`signedUpload`/`signedDownload`/`buildKey`) com `MockStorageAdapter` (`@Profile("!cloud")`) e um adapter GCS (`@Profile("cloud")`), permitindo upload direto ao object storage por URL assinada. O Escopo B reusa esse mecanismo para o OCR_Upload (bucket de documentos de IA), evitando trafegar binário pelo corpo do BFF.
- Capacidades do Escopo B que exigem backend novo: observabilidade a partir do ledger (Requirement 13); NCM estruturado (Requirement 14); novas `AiTask` de simulação de transporte (Requirement 15) e criação por linguagem natural (Requirement 16); e OCR real de binário (Requirement 17). Essas adições demandam novo deploy do backend no Cloud Run e, possivelmente, novas migrations Flyway e novas APIs GCP (ex.: Document AI).

### Escopo B — capacidades a implementar (backend real + telas sem mock)

As capacidades a seguir aparecem em telas ou mocks do EIP e **no Escopo A estavam marcadas como roadmap** por não possuírem backend de IA real. No Escopo B elas passam a ser **parte da spec**: exigem **estender o backend de IA** (novas `AiTask`, novos prompts, possivelmente novas migrations Flyway e novas APIs GCP) e **reconectar as telas** ao backend real, eliminando todo mock. Nenhuma dessas capacidades pode criar chamadas Vertex paralelas: todas passam pelo mesmo `AiGatewayPort`, prompt registry, roteador de modelos, pricing e ledger.

- **Observabilidade real de agentes no AI Operations Center** (`/ai-operations/dashboard`) — hoje 100% de `aiOperationsMockService.ts`. Passa a derivar métricas (requests, tempo médio, custo, acurácia quando aplicável, status, últimos erros) do ledger de uso real (`ai_usage_event`), mapeando "agentes" para as capacidades/tasks reais do módulo `ai`. Ver Requirement 13.
- **Classificação NCM com score e justificativa** (`/produtos/ncm`, modal "IA e Automação") — hoje `ncm-classification-mock.service.ts`. O backend passa a devolver código NCM sugerido + score de confiança + justificativa, evoluindo o contrato de classificação. Ver Requirement 14.
- **Simulação de Transporte com IA** (`/logistica/transportadoras`) — nova capacidade de IA que recebe origem, destino, produto, quantidade, modal preferido, incoterm e data desejada e devolve a melhor opção com justificativa. Ver Requirement 15.
- **Criação Inteligente por comando em linguagem natural** (`/exportacoes/gerenciar`, "Criar com IA") — nova capacidade que recebe um comando em linguagem natural e devolve a estrutura de exportação proposta para confirmação humana. Ver Requirement 16.
- **OCR Upload real** (`/exportacoes/gerenciar` "OCR Upload"; Packing List com discrepância de peso/score de completude) — maior adição de backend: suportar upload de documento binário (PDF/imagem), executar OCR/extração via Vertex (Gemini multimodal ou Document AI) e devolver extração estruturada + score de completude. Ver Requirement 17.

A observabilidade, custo, segurança (sessão + CSRF, RBAC), humano no circuito e tratamento de erros de IA definidos para a tela do Assistente (Requirements 5, 6, 10, 12) aplicam-se igualmente a todas as capacidades do Escopo B, conforme consolidado no Requirement 18.

## Glossary

- **Assistente_IA_Tela**: A tela/componente Angular na rota `/home-logged/assistente-ia` (hoje `AiCopilotSimpleComponent`), ponto único de interação do usuário com os agentes de IA do EIP.
- **AI_Service**: A dependência de IA injetada via token `AI_SERVICE` (`src/app/services/ai/ai-service.token.ts`), que resolve para `AiHttpService` quando `realApis.ai === true` e para `AiMockAdapter` caso contrário.
- **AI_Http_Service**: `AiHttpService` (`src/app/services/ai/ai-http.service.ts`), adapter que chama o BFF real sob `${environment.bffBaseUrl}/bff/ai`.
- **AI_Mock_Adapter**: `AiMockAdapter` (`src/app/services/ai/ai-mock.service.ts`), adapter determinístico usado apenas quando `realApis.ai === false`.
- **IAiService**: Interface `IAiService` (`src/app/services/ai/ai-service.interface.ts`) que ambos os adapters implementam.
- **Agente_IA**: Uma das tasks de IA suportadas pelo backend: `NCM_CLASSIFICATION`, `DOCUMENT_SUMMARY`, `TRANSLATION`, `RISK_ANALYSIS`, `DOCUMENT_EXTRACTION`, `CHAT`.
- **AnalysisView**: Resultado síncrono de `POST /bff/ai/analisar` (`AiAnalysisResult` no front): `{task, output, provider, model, inputUnits, outputUnits, ocrPages}`.
- **JobView**: Resultado de `POST /bff/ai/analisar/async`: representação de um job assíncrono com identificador e estado.
- **Reconciliacao_Resultado**: `AiReconciliationResult` no front (`ReconciliationResponse` no BFF): extração dos três documentos, flag `allExtracted`, `reconciliation` (`divergences[]`, `explanation`, `ok`) e `review` (`needsReview`, `reasons[]`, `signalSource`).
- **Uso_IA**: Payload de `GET /bff/ai/uso` com consumo/quota de IA do tenant.
- **Router_Config**: Payload de `GET /bff/ai/router` com a configuração de roteamento de modelos.
- **Erro_IA**: Qualquer erro de IA mapeado pelo backend: `AI_QUOTA_EXCEEDED` (402), `AI_RATE_LIMITED` (429), `AI_TIMEOUT` (504), `AI_UNAVAILABLE` (503), `AI_PROVIDER_ERROR` (502/503), `AI_RESPONSE_INVALID` (422).
- **Humano_No_Circuito**: Princípio de que a IA produz sugestões e a pessoa decide; nenhuma ação de negócio é confirmada automaticamente a partir de uma saída de IA.
- **Capacidade_Real**: Uma capacidade de IA efetivamente suportada pelo backend existente, ou seja, um dos seis Agentes_IA (`NCM_CLASSIFICATION`, `DOCUMENT_SUMMARY`, `TRANSLATION`, `RISK_ANALYSIS`, `DOCUMENT_EXTRACTION`, `CHAT`) ou a reconciliação de documentos (`POST /bff/ai/reconciliar`).
- **Agente_Nomeado**: Um dos agentes rotulados exibidos no AI Operations Center (`/ai-operations/dashboard`) a partir de `aiOperationsMockService.ts`: Export, Compliance, Logistics, Finance, Document, OCR, Classification, Analytics, Forecast e Chat. Um Agente_Nomeado pode ou não corresponder a uma Capacidade_Real.
- **Agente_Roadmap**: Um Agente_Nomeado que não corresponde a nenhuma Capacidade_Real (Export, Compliance, Logistics, Finance, Analytics, Forecast); indisponível para acionamento nesta feature.
- **Entrada_NCM**: A entrada de texto fornecida pelo usuário ao acionar o Agente_IA `NCM_CLASSIFICATION`: a descrição do produto (obrigatória) e, opcionalmente, nome do produto, nome científico e tipo de commodity, consolidados em texto para o campo de entrada de `POST /bff/ai/analisar`.

### Glossário do Escopo B (capacidades e telas sem mock)

- **AI_Operations_Tela**: A tela/componente Angular na rota `/ai-operations/dashboard` (`AiOperationsDashboardComponent`), que exibe observabilidade de agentes/capacidades de IA. Hoje consome `aiOperationsMockService.ts`; no Escopo B passa a consumir o backend real.
- **AI_Operations_Service**: A dependência de observabilidade de IA injetada via token DI (ex.: `AI_OPERATIONS_SERVICE`), que resolve para um adapter HTTP real quando `realApis.ai === true` e para um adapter mock caso contrário. Substitui a injeção direta de `AiOperationsMockService`.
- **Capacidade_Observavel**: Uma capacidade/task real de IA do módulo `ai` (as seis `AiTask` mais a reconciliação, a simulação de transporte, a criação por linguagem natural e o OCR) para a qual o AI Operations Center exibe métricas derivadas do ledger. Substitui o conceito de "agente nomeado" fixo do mock.
- **Metrica_Agente**: O conjunto de métricas por Capacidade_Observavel exibido no AI Operations Center (`requests24h`, `avgResponseTime`, `cost`, `accuracy` quando aplicável, `status` e `lastError`), derivado de agregações do ledger `ai_usage_event`, não de valores fixos.
- **Status_Capacidade**: O estado operacional derivado de uma Capacidade_Observavel (`ACTIVE`, `DEGRADED`, `OFFLINE`, `MAINTENANCE`), calculado a partir dos desfechos recentes do ledger (ex.: proporção de FAILURE, latência, ausência de execuções), não atribuído manualmente.
- **Ledger_Uso**: A tabela `ai_usage_event` (porta `AiUsageLedgerPort`), registro autoritativo por tenant de cada execução de IA, com `operation` (= nome da `AiTask`), `provider`, `model`, `input_units`, `output_units`, `ocr_pages`, `provider_cost`, `latency_ms`, `outcome` (`SUCCESS`/`FAILURE`/...), `failure_category`, `created_at`. É a fonte de verdade da observabilidade do Escopo B.
- **Classificacao_NCM_Estruturada**: O resultado estruturado da classificação NCM contendo, no mínimo, `ncm` (código sugerido), `confidence` (score de confiança) e `rationale` (justificativa), além de alternativas quando aplicável; devolvido pelo backend real a partir do Vertex com saída JSON estruturada (padrão já usado em `DOCUMENT_EXTRACTION`).
- **NCM_Tela**: A tela/componente Angular na rota `/produtos/ncm` (`NCMClassificacaoComponent`) e seus diálogos (ex.: `classificacao-form-dialog`), que no Escopo B consomem a Classificacao_NCM_Estruturada do backend real em vez de `ncm-classification-mock.service.ts`.
- **Simulacao_Transporte**: A capacidade de IA que, a partir de uma Entrada_Transporte, devolve a melhor transportadora/modal/rota com justificativa; implementada como nova `AiTask` (ex.: `TRANSPORT_SIMULATION`) com prompt próprio no registry e saída estruturada.
- **Entrada_Transporte**: Os dados de entrada da Simulacao_Transporte fornecidos na tela `/logistica/transportadoras`: origem, destino, produto, quantidade (toneladas), modal preferido, incoterm e data desejada.
- **Transporte_Tela**: A tela/componente Angular na rota `/logistica/transportadoras` (`transportadoras.component.ts` e diálogos) que aciona a Simulacao_Transporte via backend real.
- **Criacao_Inteligente**: A capacidade de IA que recebe um Comando_Linguagem_Natural e devolve uma Estrutura_Exportacao_Proposta para confirmação humana; implementada como nova `AiTask` (ex.: `EXPORT_NL_CREATION`) com saída JSON estruturada.
- **Comando_Linguagem_Natural**: O texto livre que o usuário digita em "Criar com IA" (`ai-create-dialog`) descrevendo a exportação desejada.
- **Estrutura_Exportacao_Proposta**: O objeto estruturado proposto pela Criacao_Inteligente (campos da exportação preenchidos/sugeridos), que a pessoa revisa, ajusta e confirma — nenhuma exportação é criada automaticamente.
- **Criacao_Inteligente_Tela**: A tela/diálogo Angular de "Criar com IA" (ex.: `AiCreateDialogComponent` no catálogo e o fluxo em `/exportacoes/gerenciar`) que aciona a Criacao_Inteligente via backend real.
- **OCR_Upload**: A capacidade de IA que recebe um Documento_Binario, executa OCR/extração via Vertex (Gemini multimodal ou Document AI) e devolve uma Extracao_Estruturada com Score_Completude.
- **Documento_Binario**: Um arquivo PDF ou imagem enviado pelo usuário (não texto colado), trafegado via upload para object storage por URL assinada (padrão `StoragePort`/GCS já existente, bucket de documentos de IA).
- **Extracao_Estruturada**: O resultado estruturado do OCR_Upload (ex.: campos de invoice/packing list extraídos), validado contra o schema de extração do backend.
- **Score_Completude**: Uma métrica de 0 a 100 (ou fração equivalente) que indica quão completa foi a extração de um Documento_Binario, usada para sinalizar discrepâncias (ex.: divergência de peso em Packing List) e necessidade de revisão humana.
- **OCR_Upload_Tela**: A tela/fluxo Angular de "OCR Upload" em `/exportacoes/gerenciar` que envia o Documento_Binario e exibe a Extracao_Estruturada e o Score_Completude.
- **Flag_RealApis**: A flag de ambiente `environment.realApis.ai` que, quando `true`, roteia os serviços de IA do front para os adapters HTTP reais do BFF; quando `false`, roteia para os adapters mock. No Escopo B, com a flag `true`, nenhuma tela de IA pode exibir dado mockado.

## Requirements

### Requirement 1: Chat conversacional real substituindo o mock hardcoded

**User Story:** Como operador do EIP, quero conversar com o Assistente de IA e receber respostas vindas do backend real de IA, para que a tela reflita a inteligência real do EIP em vez de respostas fixas.

#### Acceptance Criteria

1. WHEN o usuário envia uma mensagem de chat na Assistente_IA_Tela, THE Assistente_IA_Tela SHALL invocar o AI_Service com a task `CHAT` e o texto da mensagem como entrada.
2. WHEN o AI_Service retorna uma AnalysisView para uma mensagem de chat, THE Assistente_IA_Tela SHALL exibir o campo `output` como resposta da IA na conversa.
3. WHILE uma requisição de chat está em andamento, THE Assistente_IA_Tela SHALL exibir um indicador de carregamento associado à resposta pendente.
4. WHEN uma requisição de chat é concluída (com sucesso ou erro), THE Assistente_IA_Tela SHALL remover o indicador de carregamento correspondente.
5. THE Assistente_IA_Tela SHALL NOT gerar nenhuma resposta de IA localmente a partir de texto fixo ou de ramificações por palavra-chave na mensagem do usuário.

### Requirement 2: Acesso a cada agente de IA pela tela

**User Story:** Como operador do EIP, quero acionar cada agente de IA (classificação NCM, resumo de documentos, tradução técnica, análise de risco e extração de dados) pela tela do Assistente, para que eu consiga executar todas as capacidades de IA do EIP em um único lugar.

#### Acceptance Criteria

1. THE Assistente_IA_Tela SHALL oferecer um meio de acionar cada um dos Agentes_IA `NCM_CLASSIFICATION`, `DOCUMENT_SUMMARY`, `TRANSLATION`, `RISK_ANALYSIS` e `DOCUMENT_EXTRACTION`.
2. WHEN o usuário aciona um Agente_IA, THE Assistente_IA_Tela SHALL invocar o AI_Service passando a task correspondente ao Agente_IA selecionado e a entrada de texto fornecida pelo usuário.
3. WHEN o AI_Service retorna uma AnalysisView para um Agente_IA, THE Assistente_IA_Tela SHALL exibir o campo `output` do resultado.
4. WHEN o AI_Service retorna uma AnalysisView, THE Assistente_IA_Tela SHALL exibir os campos `provider`, `model`, `inputUnits` e `outputUnits` associados ao resultado.
5. WHERE a task retornada é `DOCUMENT_EXTRACTION` e o resultado inclui `ocrPages` maior que zero, THE Assistente_IA_Tela SHALL exibir o valor de `ocrPages`.
6. IF o usuário aciona um Agente_IA sem fornecer a entrada obrigatória, THEN THE Assistente_IA_Tela SHALL impedir o envio e sinalizar que a entrada é obrigatória.
7. WHERE o Agente_IA acionado é `NCM_CLASSIFICATION`, THE Assistente_IA_Tela SHALL permitir que o usuário informe a Entrada_NCM com a descrição do produto como campo obrigatório.
8. WHEN o AI_Service retorna uma AnalysisView para a task `NCM_CLASSIFICATION`, THE Assistente_IA_Tela SHALL exibir o campo `output` retornado como classificação NCM sugerida.
9. WHERE o campo `output` da AnalysisView para `NCM_CLASSIFICATION` inclui score de confiança ou justificativa, THE Assistente_IA_Tela SHALL exibir esses dados conforme retornados pelo backend.
10. THE Assistente_IA_Tela SHALL NOT exibir score de confiança nem justificativa que não estejam presentes no contrato AnalysisView retornado pelo backend.
11. THE Assistente_IA_Tela SHALL fornecer a entrada de `DOCUMENT_EXTRACTION` por texto colado, enquanto o upload de arquivo binário (PDF ou imagem) é tratado pela capacidade dedicada OCR_Upload descrita no Requirement 17.

### Requirement 3: Reconciliação de documentos com divergências e sinal de revisão

**User Story:** Como analista de comércio exterior, quero reconciliar Pedido, Packing List e Commercial Invoice pela tela do Assistente, para que eu veja as divergências encontradas, a explicação da IA e se a operação precisa de revisão humana.

#### Acceptance Criteria

1. WHEN o usuário fornece os conteúdos de pedido, packing e invoice e solicita a reconciliação, THE Assistente_IA_Tela SHALL invocar o AI_Service com uma requisição de reconciliação contendo os três documentos.
2. WHEN o AI_Service retorna um Reconciliacao_Resultado, THE Assistente_IA_Tela SHALL exibir a lista `reconciliation.divergences` e o texto `reconciliation.explanation`.
3. WHEN o AI_Service retorna um Reconciliacao_Resultado, THE Assistente_IA_Tela SHALL exibir o estado `reconciliation.ok`.
4. WHEN `review.needsReview` é verdadeiro no Reconciliacao_Resultado, THE Assistente_IA_Tela SHALL exibir a lista `review.reasons` e o `review.signalSource`.
5. IF algum dos três documentos tem `status` igual a `FAILED` no Reconciliacao_Resultado, THEN THE Assistente_IA_Tela SHALL exibir o `failureKind` e o `failureDetail` do documento que falhou.
6. WHILE `allExtracted` é falso, THE Assistente_IA_Tela SHALL indicar que a reconciliação não pôde ser concluída para todos os documentos.
7. THE Assistente_IA_Tela SHALL receber o conteúdo de pedido, packing e invoice como texto colado, enquanto o upload de arquivo binário (PDF ou imagem) com OCR é tratado pela capacidade dedicada OCR_Upload descrita no Requirement 17.

### Requirement 4: Execução assíncrona de análises longas com acompanhamento de job

**User Story:** Como operador do EIP, quero executar análises longas de forma assíncrona e acompanhar o progresso do job, para que a tela não fique bloqueada e eu veja quando o resultado está pronto.

#### Acceptance Criteria

1. WHERE o usuário opta por execução assíncrona, THE Assistente_IA_Tela SHALL invocar o AI_Service na operação de análise assíncrona (`POST /bff/ai/analisar/async`) em vez da análise síncrona.
2. WHEN o AI_Service retorna uma JobView para uma análise assíncrona, THE Assistente_IA_Tela SHALL consultar o estado do job via AI_Service (`GET /bff/ai/jobs/{id}`) usando o identificador do job retornado.
3. WHILE o job consultado está em um estado não terminal, THE Assistente_IA_Tela SHALL continuar consultando o estado do job em intervalos definidos (polling) e exibir o estado atual.
4. WHEN o job atinge um estado terminal de sucesso, THE Assistente_IA_Tela SHALL encerrar o polling e exibir o resultado do job.
5. WHEN o job atinge um estado terminal de falha, THE Assistente_IA_Tela SHALL encerrar o polling e exibir a condição de falha do job.

### Requirement 5: Visibilidade de uso/quota de IA

**User Story:** Como operador do EIP, quero ver o consumo e a quota de IA do meu tenant na tela do Assistente, para que eu saiba quanto da minha capacidade de IA já foi utilizada.

#### Acceptance Criteria

1. WHEN a Assistente_IA_Tela é inicializada, THE Assistente_IA_Tela SHALL solicitar o Uso_IA ao AI_Service (`GET /bff/ai/uso`).
2. WHEN o AI_Service retorna o Uso_IA, THE Assistente_IA_Tela SHALL exibir o consumo e a quota de IA do tenant.
3. WHEN uma operação de IA é concluída com sucesso na Assistente_IA_Tela, THE Assistente_IA_Tela SHALL atualizar a exibição do Uso_IA.
4. IF a solicitação do Uso_IA falha, THEN THE Assistente_IA_Tela SHALL exibir uma indicação de que o consumo de IA está indisponível, sem bloquear as demais funcionalidades da tela.

### Requirement 6: Tratamento e exibição explícita dos erros de IA

**User Story:** Como operador do EIP, quero que os erros de IA sejam exibidos de forma clara na tela do Assistente, para que eu entenda o que aconteceu e saiba qual ação tomar em vez de ver respostas silenciosas ou enganosas.

#### Acceptance Criteria

1. IF o AI_Service retorna um Erro_IA, THEN THE Assistente_IA_Tela SHALL exibir uma mensagem de erro específica correspondente ao tipo de Erro_IA recebido.
2. IF o Erro_IA é `AI_QUOTA_EXCEEDED` (HTTP 402), THEN THE Assistente_IA_Tela SHALL exibir uma ação de "Comprar créditos de IA".
3. IF o Erro_IA é `AI_RATE_LIMITED` (HTTP 429) e a resposta inclui o cabeçalho `Retry-After`, THEN THE Assistente_IA_Tela SHALL informar ao usuário o tempo de espera indicado por `Retry-After` antes de permitir nova tentativa.
4. IF o Erro_IA é `AI_TIMEOUT` (HTTP 504), `AI_UNAVAILABLE` (HTTP 503) ou `AI_PROVIDER_ERROR` (HTTP 502/503), THEN THE Assistente_IA_Tela SHALL exibir uma mensagem de indisponibilidade temporária e oferecer a opção de tentar novamente.
5. IF o Erro_IA é `AI_RESPONSE_INVALID` (HTTP 422), THEN THE Assistente_IA_Tela SHALL exibir uma mensagem de que a resposta da IA foi inválida para a solicitação enviada.
6. THE Assistente_IA_Tela SHALL NOT substituir um Erro_IA por uma resposta simulada ou por conteúdo de fallback local.

### Requirement 7: Remoção total de mock da tela e consumo exclusivo do AI_Service

**User Story:** Como mantenedor do EIP, quero que a tela do Assistente de IA não contenha nenhum mock ou resposta hardcoded e use apenas o AI_Service, para que o comportamento da tela corresponda ao backend real sempre que `realApis.ai === true`.

#### Acceptance Criteria

1. THE Assistente_IA_Tela SHALL obter todas as respostas de IA exclusivamente através do AI_Service injetado pelo token `AI_SERVICE`.
2. THE Assistente_IA_Tela SHALL NOT conter texto de resposta de IA hardcoded nem lógica de geração de resposta baseada em `setTimeout` simulando latência.
3. WHERE `realApis.ai === true`, THE AI_Service injetado SHALL ser o AI_Http_Service que chama o BFF real.
4. WHERE `realApis.ai === false`, THE AI_Service injetado SHALL ser o AI_Mock_Adapter, sem que a Assistente_IA_Tela contenha qualquer mock próprio.
5. THE Assistente_IA_Tela SHALL depender da interface IAiService expandida para cobrir chat/análise, análise assíncrona, estado de job, uso e configuração de router.

### Requirement 8: Expansão da camada de serviço do frontend (IAiService)

**User Story:** Como desenvolvedor do frontend, quero que a interface `IAiService` e seus adapters cubram os endpoints de IA que ainda faltam, para que a tela possa consumir análise assíncrona, estado de job, uso e configuração de router de forma uniforme.

#### Acceptance Criteria

1. THE IAiService SHALL expor uma operação de análise assíncrona que mapeia para `POST /bff/ai/analisar/async` e retorna uma JobView.
2. THE IAiService SHALL expor uma operação de consulta de estado de job que mapeia para `GET /bff/ai/jobs/{id}` e retorna o estado/resultado do job.
3. THE IAiService SHALL expor uma operação de consulta de Uso_IA que mapeia para `GET /bff/ai/uso`.
4. THE IAiService SHALL expor uma operação de consulta de Router_Config que mapeia para `GET /bff/ai/router`.
5. THE AI_Http_Service SHALL implementar as novas operações chamando os endpoints correspondentes sob `${environment.bffBaseUrl}/bff/ai`.
6. THE AI_Mock_Adapter SHALL implementar as novas operações da IAiService com respostas determinísticas, para que o build e a demo em mock permaneçam funcionais quando `realApis.ai === false`.

### Requirement 9: Quick actions acionando agentes reais

**User Story:** Como operador do EIP, quero que as ações rápidas (quick actions) da tela disparem agentes de IA reais, para que elas sejam úteis em vez de decorativas.

#### Acceptance Criteria

1. WHERE uma quick action da Assistente_IA_Tela é mantida, THE Assistente_IA_Tela SHALL mapear a quick action para uma invocação de um Agente_IA real através do AI_Service.
2. WHEN o usuário aciona uma quick action mantida, THE Assistente_IA_Tela SHALL executar a invocação de IA correspondente e exibir o resultado pelo mesmo caminho de exibição das demais operações de IA.
3. WHERE uma quick action existente não mapeia para nenhum Agente_IA real, THE Assistente_IA_Tela SHALL remover essa quick action.
4. THE Assistente_IA_Tela SHALL NOT manter nenhuma quick action que produza resposta hardcoded.

### Requirement 10: Segurança (não-funcional)

**User Story:** Como responsável por segurança, quero que o acesso de IA pela tela use sessão autenticada, CSRF e RBAC já existentes e que nenhum segredo seja exposto no front, para que a integração não introduza vazamento de credenciais nem acesso indevido.

#### Acceptance Criteria

1. WHEN a Assistente_IA_Tela realiza uma chamada de IA via AI_Http_Service, THE AI_Http_Service SHALL enviar a requisição com o cookie de sessão e o cabeçalho CSRF `X-XSRF-TOKEN` anexados pelos interceptors existentes.
2. THE Assistente_IA_Tela SHALL NOT conter nenhuma credencial, chave de API ou segredo no código do frontend.
3. IF o backend recusa uma chamada de IA por falta de autorização RBAC (`ai-operations/painel`), THEN THE Assistente_IA_Tela SHALL exibir uma mensagem de acesso negado sem expor detalhes internos do backend.
4. THE Assistente_IA_Tela SHALL preservar o princípio Humano_No_Circuito, não confirmando automaticamente nenhuma ação de negócio a partir de uma saída de IA.

### Requirement 11: Acessibilidade do chat (não-funcional)

**User Story:** Como usuário que depende de tecnologias assistivas, quero que a tela do Assistente de IA seja acessível por teclado e anunciada por leitores de tela, para que eu consiga usar o chat sem mouse e perceber novas mensagens.

#### Acceptance Criteria

1. WHEN uma nova mensagem de IA é adicionada à conversa, THE Assistente_IA_Tela SHALL anunciar a nova mensagem através de uma região `aria-live`.
2. THE Assistente_IA_Tela SHALL permitir enviar mensagens e acionar agentes usando apenas o teclado.
3. WHEN a Assistente_IA_Tela conclui o envio de uma mensagem, THE Assistente_IA_Tela SHALL mover o foco de volta para o campo de entrada de mensagem.
4. THE Assistente_IA_Tela SHALL associar rótulos acessíveis (`aria-label` ou equivalente) aos controles de entrada e aos botões de acionamento de agentes.

### Requirement 12: Escopo e mapeamento de agentes reais versus roadmap

**User Story:** Como mantenedor do EIP, quero que a tela do Assistente apresente apenas agentes que correspondem a capacidades de IA reais e marque claramente os demais como roadmap, para que o usuário não seja induzido a acionar agentes sem backend e nunca receba respostas mockadas.

#### Acceptance Criteria

1. THE Assistente_IA_Tela SHALL apresentar como acionáveis apenas os agentes que correspondem a uma Capacidade_Real (os seis Agentes_IA e a reconciliação de documentos).
2. THE Assistente_IA_Tela SHALL mapear o Agente_Nomeado `Classification` para a Capacidade_Real `NCM_CLASSIFICATION`.
3. THE Assistente_IA_Tela SHALL mapear os Agentes_Nomeados `Document` e `OCR` para a Capacidade_Real `DOCUMENT_EXTRACTION` e/ou para a reconciliação de documentos.
4. THE Assistente_IA_Tela SHALL mapear o Agente_Nomeado `Chat` para a Capacidade_Real `CHAT`.
5. THE Assistente_IA_Tela SHALL disponibilizar as Capacidades_Reais `DOCUMENT_SUMMARY`, `TRANSLATION` e `RISK_ANALYSIS` como agentes acionáveis de resumo de documento, tradução técnica e análise de risco.
6. WHERE um Agente_Nomeado é um Agente_Roadmap (`Export`, `Compliance`, `Logistics`, `Finance`, `Analytics`, `Forecast`), THE Assistente_IA_Tela SHALL NOT apresentá-lo como acionável.
7. IF um Agente_Roadmap é exibido na Assistente_IA_Tela para fins informativos, THEN THE Assistente_IA_Tela SHALL marcá-lo claramente como "roadmap/indisponível".
8. THE Assistente_IA_Tela SHALL NOT produzir resposta mockada ou hardcoded para qualquer Agente_Roadmap.
9. THE Assistente_IA_Tela SHALL NOT exibir métricas de agentes provenientes de `aiOperationsMockService.ts`; a observabilidade real de capacidades de IA é tratada pelo AI Operations Center conforme o Requirement 13.

### Requirement 13: Observabilidade real de capacidades de IA no AI Operations Center

**User Story:** Como operador de IA do EIP, quero que o AI Operations Center exiba métricas reais de execução de IA (volume, tempo médio, custo, acurácia quando aplicável, status e últimos erros) derivadas do uso real, para que eu monitore a saúde das capacidades de IA em vez de ver números fixos de mock.

#### Acceptance Criteria

1. WHEN a AI_Operations_Tela é inicializada, THE AI_Operations_Tela SHALL solicitar as Metricas_Agente ao AI_Operations_Service, que mapeia para um endpoint real do BFF sob `/bff/ai`.
2. THE AI_Operations_Service SHALL derivar cada Metrica_Agente a partir de agregações do Ledger_Uso (`ai_usage_event`) por Capacidade_Observavel, sem usar valores fixos.
3. WHEN o AI_Operations_Service retorna as Metricas_Agente, THE AI_Operations_Tela SHALL exibir, para cada Capacidade_Observavel, o volume de requisições do período, o tempo médio de resposta e o custo acumulado.
4. WHERE uma Capacidade_Observavel registra acurácia aplicável no Ledger_Uso, THE AI_Operations_Service SHALL incluir o valor de acurácia na Metrica_Agente correspondente.
5. WHERE uma Capacidade_Observavel não registra acurácia aplicável, THE AI_Operations_Service SHALL omitir a acurácia em vez de retornar um valor fixo.
6. THE AI_Operations_Service SHALL derivar o Status_Capacidade de cada Capacidade_Observavel a partir dos desfechos recentes do Ledger_Uso (proporção de `outcome` igual a `FAILURE`, latência e presença de execuções).
7. WHEN um erro de IA é registrado no Ledger_Uso para uma Capacidade_Observavel, THE AI_Operations_Service SHALL incluir o último erro (categoria e horário) na Metrica_Agente correspondente.
8. WHEN o AI_Operations_Service retorna a lista de erros recentes, THE AI_Operations_Tela SHALL exibir cada erro com a Capacidade_Observavel associada, o horário e a categoria de falha provenientes do Ledger_Uso.
9. THE AI_Operations_Tela SHALL mapear as Capacidades_Observaveis exibidas para as capacidades/tasks reais do módulo `ai`, sem apresentar agentes que não correspondam a uma capacidade real.
10. WHERE `realApis.ai === true`, THE AI_Operations_Tela SHALL obter todas as métricas exclusivamente do AI_Operations_Service HTTP real.
11. THE AI_Operations_Tela SHALL NOT importar nem instanciar `AiOperationsMockService` quando `realApis.ai === true`.
12. IF a solicitação de métricas falha, THEN THE AI_Operations_Tela SHALL exibir uma indicação de indisponibilidade das métricas sem substituir os valores por dados mockados.

### Requirement 14: Classificação NCM estruturada com score de confiança e justificativa

**User Story:** Como analista de produtos do EIP, quero que a classificação NCM retorne o código sugerido junto com um score de confiança e uma justificativa reais da IA, para que eu decida com segurança se aceito a sugestão em vez de ver um código isolado ou dados simulados.

#### Acceptance Criteria

1. WHEN o usuário solicita a classificação NCM na NCM_Tela, THE NCM_Tela SHALL invocar o serviço de IA real para a capacidade de classificação NCM, enviando a descrição do produto como entrada obrigatória.
2. THE backend de classificação NCM SHALL retornar uma Classificacao_NCM_Estruturada contendo, no mínimo, o código NCM sugerido (`ncm`), o score de confiança (`confidence`) e a justificativa (`rationale`).
3. THE backend de classificação NCM SHALL produzir a Classificacao_NCM_Estruturada a partir do Vertex usando saída JSON estruturada, reusando o mecanismo de `responseSchema` já aplicado em `DOCUMENT_EXTRACTION`.
4. WHEN o serviço de IA retorna uma Classificacao_NCM_Estruturada, THE NCM_Tela SHALL exibir o código NCM sugerido, o score de confiança e a justificativa.
5. WHERE a Classificacao_NCM_Estruturada inclui códigos NCM alternativos, THE NCM_Tela SHALL exibir as alternativas com seus respectivos scores.
6. IF o usuário solicita a classificação sem fornecer a descrição do produto, THEN THE NCM_Tela SHALL impedir o envio e sinalizar que a descrição é obrigatória.
7. WHERE o score de confiança retornado está abaixo de um limiar configurado, THE NCM_Tela SHALL sinalizar que a classificação requer revisão humana.
8. THE NCM_Tela SHALL preservar o princípio Humano_No_Circuito, não aplicando automaticamente a classificação NCM sugerida sem confirmação do usuário.
9. WHERE `realApis.ai === true`, THE NCM_Tela SHALL obter a Classificacao_NCM_Estruturada exclusivamente do serviço de IA HTTP real.
10. THE NCM_Tela SHALL NOT importar nem instanciar `NCMClassificationMockService` quando `realApis.ai === true`.
11. IF o serviço de IA retorna um Erro_IA durante a classificação, THEN THE NCM_Tela SHALL exibir a mensagem de erro correspondente sem substituir a resposta por conteúdo mockado.

### Requirement 15: Simulação de transporte apoiada por IA

**User Story:** Como analista de logística do EIP, quero simular opções de transporte informando origem, destino, produto, quantidade, modal, incoterm e data, para que a IA recomende a melhor transportadora/modal/rota com justificativa em vez de eu ver dados simulados.

#### Acceptance Criteria

1. WHEN o usuário submete uma Entrada_Transporte na Transporte_Tela, THE Transporte_Tela SHALL invocar o serviço de IA real para a Simulacao_Transporte com os campos origem, destino, produto, quantidade, modal preferido, incoterm e data desejada.
2. THE backend SHALL implementar a Simulacao_Transporte como uma nova `AiTask` com prompt próprio no `DefaultAiPromptRegistry`, roteada pelo mesmo `ModelRouterPort` e executada pelo mesmo `AiGatewayPort`.
3. THE backend SHALL produzir a saída da Simulacao_Transporte como JSON estruturado via `responseSchema`, contendo a melhor opção (transportadora/modal/rota) e a justificativa.
4. WHEN o serviço de IA retorna o resultado da Simulacao_Transporte, THE Transporte_Tela SHALL exibir a melhor transportadora/modal/rota recomendada e a justificativa da IA.
5. IF o usuário submete a Entrada_Transporte com campos obrigatórios ausentes, THEN THE Transporte_Tela SHALL impedir o envio e sinalizar os campos obrigatórios faltantes.
6. THE backend SHALL registrar a execução da Simulacao_Transporte no Ledger_Uso com `operation` correspondente à nova `AiTask`, incluindo provider, model, unidades e custo.
7. THE Transporte_Tela SHALL preservar o princípio Humano_No_Circuito, não contratando automaticamente nenhuma transportadora a partir da recomendação da IA.
8. WHERE `realApis.ai === true`, THE Transporte_Tela SHALL obter o resultado da Simulacao_Transporte exclusivamente do serviço de IA HTTP real, sem dados mockados.
9. IF o serviço de IA retorna um Erro_IA durante a Simulacao_Transporte, THEN THE Transporte_Tela SHALL exibir a mensagem de erro correspondente sem substituir a resposta por conteúdo mockado.

### Requirement 16: Criação inteligente de exportação por comando em linguagem natural

**User Story:** Como operador de exportação do EIP, quero descrever uma exportação em linguagem natural e receber uma estrutura proposta pela IA, para que eu confirme ou ajuste os dados em vez de preencher tudo manualmente ou ver um fluxo mockado.

#### Acceptance Criteria

1. WHEN o usuário submete um Comando_Linguagem_Natural na Criacao_Inteligente_Tela, THE Criacao_Inteligente_Tela SHALL invocar o serviço de IA real para a Criacao_Inteligente com o texto do comando como entrada.
2. THE backend SHALL implementar a Criacao_Inteligente como uma nova `AiTask` com prompt próprio no `DefaultAiPromptRegistry`, roteada pelo `ModelRouterPort` e executada pelo `AiGatewayPort`.
3. THE backend SHALL produzir a Estrutura_Exportacao_Proposta como JSON estruturado via `responseSchema`.
4. WHEN o serviço de IA retorna uma Estrutura_Exportacao_Proposta, THE Criacao_Inteligente_Tela SHALL exibir os campos propostos para revisão do usuário antes de qualquer persistência.
5. THE Criacao_Inteligente_Tela SHALL preservar o princípio Humano_No_Circuito, criando a exportação somente após confirmação explícita do usuário sobre a Estrutura_Exportacao_Proposta.
6. IF o usuário submete um Comando_Linguagem_Natural vazio, THEN THE Criacao_Inteligente_Tela SHALL impedir o envio e sinalizar que o comando é obrigatório.
7. THE backend SHALL registrar a execução da Criacao_Inteligente no Ledger_Uso com `operation` correspondente à nova `AiTask`, incluindo provider, model, unidades e custo.
8. WHERE `realApis.ai === true`, THE Criacao_Inteligente_Tela SHALL obter a Estrutura_Exportacao_Proposta exclusivamente do serviço de IA HTTP real, sem dados mockados.
9. IF o serviço de IA retorna um Erro_IA durante a Criacao_Inteligente, THEN THE Criacao_Inteligente_Tela SHALL exibir a mensagem de erro correspondente sem substituir a resposta por conteúdo mockado.

### Requirement 17: OCR real de documento binário com extração estruturada e score de completude

**User Story:** Como analista de documentos do EIP, quero enviar um arquivo PDF ou imagem e receber a extração estruturada dos dados com um score de completude, para que o OCR real substitua a colagem manual de texto e me alerte sobre discrepâncias (como peso divergente em Packing List).

#### Acceptance Criteria

1. WHEN o usuário envia um Documento_Binario no OCR_Upload_Tela, THE OCR_Upload_Tela SHALL carregar o arquivo para o object storage usando o mecanismo de URL assinada existente (`StoragePort`), sem trafegar o binário pelo corpo do endpoint de análise.
2. WHEN o upload do Documento_Binario é confirmado, THE OCR_Upload_Tela SHALL invocar o serviço de IA real para o OCR_Upload referenciando o arquivo armazenado.
3. THE backend SHALL executar o OCR_Upload via Vertex (Gemini multimodal ou Document AI) através do `AiGatewayPort` estendido, sem criar chamadas Vertex paralelas ao gateway existente.
4. WHEN o OCR_Upload é concluído, THE backend SHALL retornar uma Extracao_Estruturada validada contra o schema de extração e um Score_Completude.
5. WHEN o serviço de IA retorna a Extracao_Estruturada e o Score_Completude, THE OCR_Upload_Tela SHALL exibir os dados extraídos e o Score_Completude.
6. WHERE o Score_Completude está abaixo de um limiar configurado, THE OCR_Upload_Tela SHALL sinalizar que a extração requer revisão humana.
7. WHERE a extração de um Packing List indica discrepância de peso, THE OCR_Upload_Tela SHALL destacar a discrepância ao usuário.
8. IF o Documento_Binario tem um formato não suportado, THEN THE OCR_Upload_Tela SHALL impedir o envio e sinalizar o formato inválido.
9. THE backend SHALL registrar a execução do OCR_Upload no Ledger_Uso com `operation` correspondente, incluindo `ocr_pages`, provider, model, unidades e custo.
10. THE OCR_Upload_Tela SHALL preservar o princípio Humano_No_Circuito, não confirmando automaticamente nenhuma operação de negócio a partir da Extracao_Estruturada.
11. WHERE `realApis.ai === true`, THE OCR_Upload_Tela SHALL obter a Extracao_Estruturada exclusivamente do serviço de IA HTTP real, sem dados mockados.
12. IF o serviço de IA retorna um Erro_IA durante o OCR_Upload, THEN THE OCR_Upload_Tela SHALL exibir a mensagem de erro correspondente sem substituir a resposta por conteúdo mockado.

### Requirement 18: Consistência transversal do ecossistema de IA (sem mock, seguro, observável)

**User Story:** Como mantenedor do EIP, quero que todas as capacidades do Escopo B compartilhem o mesmo padrão de segurança, observabilidade, humano no circuito e ausência de mock, para que o ecossistema de IA seja coeso e confiável.

#### Acceptance Criteria

1. THE backend SHALL executar todas as capacidades do Escopo B (observabilidade, NCM estruturado, Simulacao_Transporte, Criacao_Inteligente e OCR_Upload) através do mesmo `AiGatewayPort`, `DefaultAiPromptRegistry`, `ModelRouterPort`, `AiPriceCatalogPort` e Ledger_Uso, sem criar chamadas Vertex paralelas.
2. WHEN qualquer capacidade do Escopo B é executada, THE backend SHALL registrar a execução no Ledger_Uso com o desfecho (`outcome` `SUCCESS` ou `FAILURE`), provider, model, unidades, custo e, quando aplicável, `ocr_pages`.
3. WHEN uma tela do Escopo B realiza uma chamada de IA, THE serviço HTTP correspondente SHALL enviar a requisição com o cookie de sessão e o cabeçalho CSRF `X-XSRF-TOKEN` anexados pelos interceptors existentes.
4. THE telas do Escopo B SHALL NOT conter nenhuma credencial, chave de API ou segredo no código do frontend.
5. IF o backend recusa uma chamada por falta de autorização RBAC, THEN a tela do Escopo B correspondente SHALL exibir uma mensagem de acesso negado sem expor detalhes internos do backend.
6. WHERE `realApis.ai === true`, THE telas do Escopo B SHALL obter todas as respostas de IA exclusivamente dos serviços HTTP reais injetados por token DI, sem instanciar nenhum serviço mock.
7. THE roteamento de modelos para cada nova `AiTask` do Escopo B SHALL ser configurável via `ai_model_config`, sem exigir alteração de código para trocar provider/model.
8. THE adição das novas capacidades do Escopo B SHALL requerer um novo deploy do backend no Cloud Run e, quando necessário, novas migrations Flyway e habilitação de novas APIs GCP (ex.: Document AI).
