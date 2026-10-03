# Requirements Document

## Introduction

Esta spec endurece a integração de IA do EIP (Vertex AI / Gemini) para produção. O objetivo não é adicionar funcionalidades, e sim fazer o caminho de IA falhar de forma segura e recuperável: toda falha real do provedor é tratada e exposta como falha (nunca mascarada por mock nem persistida silenciosamente), com um status HTTP específico, uma mensagem pt-BR compreensível no front, observabilidade ponta a ponta e, quando o resultado for ambíguo, um encaminhamento determinístico para revisão humana.

O backend é Java 21 / Spring Boot 3.5.6 (arquitetura hexagonal com Spring Modulith, Resilience4j); o front é Angular 20. Os requisitos abaixo derivam diretamente do design aprovado (`design.md`): as 10 preocupações de resiliência, as Hard Constraints (NFR) e a Testing Strategy. Cada requisito segue um dos seis padrões EARS.

## Glossary

- **Sistema_IA**: o conjunto backend (BFF, use cases, adaptadores de gateway de IA e handlers de exceção) que medeia as chamadas ao provedor de IA.
- **VertexAiGatewayAdapter**: adaptador de saída (profile `cloud`) que chama o provedor Vertex AI / Gemini através do `VertexAiCaller`.
- **AiProviderExceptionTranslator**: componente que traduz exceções cruas de infraestrutura (Resilience4j / RestClient) na taxonomia de erro de domínio.
- **AiResponseValidator**: componente que verifica a completude da resposta do provedor antes do mapeamento de negócio.
- **AiExceptionHandler**: `@RestControllerAdvice` que mapeia a taxonomia de erro de domínio para status HTTP e `ApiError`.
- **ReconciliationUseCaseService**: serviço de aplicação que extrai pedido/packing/invoice e executa a reconciliação determinística.
- **AiUsageLedger**: porta de persistência de desfechos de chamada de IA (`outcome` + `failureCategory`).
- **AiHubComponent**: componente Angular responsável pela UX do fluxo de IA (envio, erro, retry).
- **transient**: flag que marca uma falha como passível de retry/espera (vs. definitiva).
- **ApiError**: contrato de erro padronizado `{ code, message, correlationId, errors }`.
- **ReviewOutcome**: resultado determinístico de encaminhamento para revisão humana (`needsReview`, `reasons[]`, `signalSource`).
- **DocumentExtractionResult**: resultado por documento (`status = OK | FAILED`) de uma extração.
- **ReconciliationResponse**: resposta agregada explícita contendo os três resultados por documento, `allExtracted`, a reconciliação (quando aplicável) e o `ReviewOutcome`.
- **profile `cloud`**: modo real de produção, no qual o provedor Vertex é efetivamente chamado.
- **mock**: adaptador falso de IA, habilitado apenas em modo explícito (profile `!cloud` / flag).

## Requirements

### Requirement 1: Tratamento de timeout

**User Story:** Como operador do EIP, quero que um timeout de chamada ao provedor de IA termine rapidamente com um erro claro, para que a requisição nunca fique pendurada nem seja confundida com uma falha interna genérica.

#### Acceptance Criteria

1. THE Sistema_IA SHALL ler os timeouts de conexão e de leitura das chamadas ao provedor a partir de configuração por ambiente (`eip.ai.vertex.timeout.connect` e `eip.ai.vertex.timeout.read`).
2. WHEN a chamada ao provedor estoura o read-timeout configurado, THE Sistema_IA SHALL lançar `AiTimeoutException` com flag `transient = true`.
3. WHEN uma `AiTimeoutException` é tratada pelo AiExceptionHandler, THE Sistema_IA SHALL responder com HTTP 504 e `code = AI_TIMEOUT`.
4. IF uma chamada ao provedor estoura o timeout, THEN THE Sistema_IA SHALL encerrar a requisição sem mantê-la pendurada.
5. IF uma chamada ao provedor estoura o timeout, THEN THE Sistema_IA SHALL responder com o status 504 dedicado em vez de HTTP 500 genérico.

### Requirement 2: Rejeição de respostas de IA inválidas

**User Story:** Como responsável pela integridade dos dados, quero que respostas de IA incompletas ou inválidas sejam rejeitadas, para que nenhum resultado inválido seja persistido.

#### Acceptance Criteria

1. WHEN a resposta do provedor não contém candidates ou contém candidates vazio, THE AiResponseValidator SHALL lançar `AiResponseException` do tipo `EMPTY_OUTPUT`.
2. WHEN a resposta do provedor tem `finishReason = MAX_TOKENS`, THE AiResponseValidator SHALL lançar `AiResponseException` do tipo `TRUNCATED`.
3. WHEN a resposta do provedor tem `finishReason = SAFETY` ou `finishReason = RECITATION`, THE AiResponseValidator SHALL lançar `AiResponseException` do tipo `BLOCKED_SAFETY`.
4. WHEN a resposta do provedor tem `finishReason` diferente de `STOP` e distinto de `MAX_TOKENS`, `SAFETY` e `RECITATION`, THE AiResponseValidator SHALL lançar `AiResponseException` do tipo `TRUNCATED`.
5. WHEN o `output` concatenado da resposta do provedor é vazio, THE AiResponseValidator SHALL lançar `AiResponseException` do tipo `EMPTY_OUTPUT`.
6. IF a resposta do provedor é JSON malformado, schema inválido, com campos ausentes ou tipos errados, THEN THE Sistema_IA SHALL responder com HTTP 422 e `code = AI_RESPONSE_INVALID`.
7. WHEN qualquer `AiResponseException` é tratada pelo AiExceptionHandler, THE Sistema_IA SHALL responder com HTTP 422 e `code = AI_RESPONSE_INVALID`.
8. IF a resposta do provedor é inválida por qualquer motivo de conteúdo, THEN THE Sistema_IA SHALL rejeitar a resposta sem persistir DTO de negócio nem resultado de reconciliação.

### Requirement 3: Retry apenas de falhas transientes

**User Story:** Como operador do EIP, quero que apenas falhas transientes sejam retentadas com backoff controlado, para que o provedor não seja martelado e erros funcionais não sejam repetidos inutilmente.

#### Acceptance Criteria

1. THE Sistema_IA SHALL retentar somente exceções transientes de transporte (`IOException`, `ResourceAccessException`, `HttpServerErrorException`).
2. THE Sistema_IA SHALL limitar as tentativas de chamada ao provedor a `max-attempts = 2` (no máximo 1 retry).
3. WHEN uma falha transiente ocorre e um retry é agendado, THE Sistema_IA SHALL aplicar backoff exponencial com jitter configurável por ambiente.
4. THE Sistema_IA SHALL ler os parâmetros de retry (max-attempts, wait-duration, multiplicador de backoff) a partir de configuração por ambiente.
5. IF o provedor retorna uma resposta 4xx (incluindo 429), THEN THE Sistema_IA SHALL executar exatamente 1 chamada ao provedor, sem retry.
6. WHEN uma chamada sofre no máximo 1 retry transiente antes de sucesso, THE AiUsageLedger SHALL gravar exatamente um evento de desfecho `SUCCESS`.

### Requirement 4: Circuit breaker

**User Story:** Como operador do EIP, quero um circuit breaker que falhe rápido quando o provedor estiver degradado, para que o sistema não acumule chamadas custosas e eu possa observar o estado do circuito.

#### Acceptance Criteria

1. THE Sistema_IA SHALL manter um circuit breaker com os estados CLOSED, OPEN e HALF_OPEN para as chamadas ao provedor.
2. WHILE o circuit breaker está OPEN, THE Sistema_IA SHALL falhar rápido sem enviar requisição ao provedor.
3. WHILE o circuit breaker está OPEN, THE Sistema_IA SHALL lançar `AiProviderUnavailableException` com flag `transient = true`.
4. WHEN uma `AiProviderUnavailableException` é tratada pelo AiExceptionHandler, THE Sistema_IA SHALL responder com HTTP 503 e `code = AI_UNAVAILABLE`.
5. THE Sistema_IA SHALL expor o estado do circuit breaker via actuator health e metrics.
6. THE Sistema_IA SHALL ler os parâmetros do circuit breaker a partir de configuração por ambiente.

### Requirement 5: Rate limit / HTTP 429

**User Story:** Como usuário do fluxo de IA, quero uma mensagem clara quando o provedor limita a taxa de chamadas, para que eu saiba quando tentar novamente.

#### Acceptance Criteria

1. WHEN o provedor retorna HTTP 429, THE Sistema_IA SHALL lançar `AiRateLimitedException`.
2. WHEN uma `AiRateLimitedException` é tratada pelo AiExceptionHandler, THE Sistema_IA SHALL responder com HTTP 429 e `code = AI_RATE_LIMITED`.
3. WHERE a opção `honor-retry-after` está habilitada e o provedor envia o header `Retry-After`, THE Sistema_IA SHALL propagar o valor de `Retry-After` no header da resposta do BFF.
4. WHEN o front recebe a resposta 429, THE AiHubComponent SHALL exibir uma mensagem pt-BR adequada orientando o usuário a aguardar.

### Requirement 6: Falhas 5xx do provedor

**User Story:** Como operador do EIP, quero distinguir claramente uma falha do provedor de IA de uma falha interna nossa, para que o diagnóstico e a recuperação sejam corretos.

#### Acceptance Criteria

1. THE Sistema_IA SHALL representar falhas do provedor por uma hierarquia `AiProviderException` que carrega uma flag `transient`.
2. WHEN o provedor retorna um 5xx transiente após o retry esgotado, THE Sistema_IA SHALL responder com HTTP 503 e `code = AI_PROVIDER_ERROR`.
3. WHEN uma falha definitiva do provedor é tratada, THE Sistema_IA SHALL responder com HTTP 502 e `code = AI_PROVIDER_ERROR`.
4. IF uma falha é do provedor de IA, THEN THE Sistema_IA SHALL responder com um status de provedor (502/503) distinto do HTTP 500 reservado para falhas internas do Sistema_IA.

### Requirement 7: Revisão humana por sinais determinísticos

**User Story:** Como revisor de documentos, quero que o encaminhamento para revisão humana seja guiado apenas por sinais determinísticos, para que eu confie nos motivos e não dependa de um score de confiança fabricado.

#### Acceptance Criteria

1. THE Sistema_IA SHALL produzir um `ReviewOutcome` com os campos `needsReview`, `reasons[]` e `signalSource`.
2. WHEN `finishReason` é diferente de `STOP`, THE Sistema_IA SHALL adicionar o motivo `FINISH_REASON_NOT_STOP` ao `ReviewOutcome`.
3. WHEN um DTO passa no schema mas falha em uma regra de negócio determinística, THE Sistema_IA SHALL adicionar o motivo `REVALIDATION_FAILED` ao `ReviewOutcome`.
4. WHEN a reconciliação determinística diverge (`ReconciliationResult.ok() == false`), THE Sistema_IA SHALL adicionar o motivo `RECONCILIATION_DIVERGENCE` ao `ReviewOutcome`.
5. WHEN ao menos um documento tem status `FAILED`, THE Sistema_IA SHALL adicionar o motivo `PARTIAL_EXTRACTION` ao `ReviewOutcome`.
6. THE Sistema_IA SHALL definir `needsReview = true` se e somente se a lista `reasons` for não-vazia.
7. THE Sistema_IA SHALL produzir o `ReviewOutcome` sem gerar nem armazenar qualquer campo numérico de confiança.

### Requirement 8: Falha parcial de reconciliação

**User Story:** Como usuário do fluxo de reconciliação, quero saber exatamente qual documento falhou e manter os que deram certo, para que eu possa retentar apenas o documento que falta sem reprocessar tudo.

#### Acceptance Criteria

1. THE Sistema_IA SHALL produzir, para cada um dos documentos pedido, packing e invoice, um `DocumentExtractionResult` com `status = OK` ou `status = FAILED`.
2. THE Sistema_IA SHALL executar a reconciliação determinística somente quando os três documentos tiverem `status = OK`.
3. THE Sistema_IA SHALL definir `allExtracted = true` se e somente se os três documentos tiverem `status = OK`.
4. WHEN a reconciliação é preenchida na resposta (`reconciliation != null`), THE Sistema_IA SHALL garantir que `allExtracted == true`.
5. IF ao menos um documento tem `status = FAILED`, THEN THE Sistema_IA SHALL retornar `allExtracted = false`, `reconciliation = null` e identificar qual documento falhou e o motivo da falha.
6. WHEN ao menos um documento falha, THE Sistema_IA SHALL preservar na resposta as extrações bem-sucedidas para permitir retry controlado apenas do(s) documento(s) FAILED.
7. THE Sistema_IA SHALL preservar, no round-trip de serialização/desserialização da `ReconciliationResponse`, os status por documento e os campos de review.

### Requirement 9: Observabilidade ponta a ponta

**User Story:** Como operador do EIP, quero rastreabilidade e desfechos registrados do fluxo de IA sem vazar dados sensíveis, para que eu consiga diagnosticar incidentes com segurança.

#### Acceptance Criteria

1. THE Sistema_IA SHALL propagar o `X-Trace-Id` recebido da UI através do BFF, da chamada de IA e até o AiUsageLedger.
2. WHEN uma chamada de IA é registrada, THE AiUsageLedger SHALL gravar o desfecho (`outcome` em ATTEMPT, SUCCESS, FAILURE ou RETRY) e a `failureCategory`.
3. WHEN uma chamada de IA ocorre, THE Sistema_IA SHALL emitir um log estruturado contendo operação, modelo, tokens, latência, resultado e categoria de falha.
4. THE Sistema_IA SHALL omitir o bearer token de todo log e de todo registro de ledger.
5. THE Sistema_IA SHALL omitir o conteúdo integral do documento de todo log e de todo registro de ledger.
6. THE AiUsageLedger SHALL registrar apenas telemetria agregada e NÃO persistir o campo `AiResult.output`.

### Requirement 10: Endurecimento do frontend

**User Story:** Como usuário do fluxo de IA, quero mensagens claras em pt-BR e retry seguro quando ocorre um erro, para que eu entenda o que houve e não perca o que digitei.

#### Acceptance Criteria

1. WHEN o front recebe um erro de IA com status 504, 503, 429, 401 ou 422, THE AiHubComponent SHALL exibir a mensagem pt-BR correspondente ao status.
2. WHILE um envio está em andamento, THE AiHubComponent SHALL desabilitar o envio para impedir double-submit.
3. WHERE o erro é retentável (status 503, 504 ou 429), THE AiHubComponent SHALL oferecer uma afordância de retry manual.
4. WHERE o erro retentável traz `Retry-After`, THE AiHubComponent SHALL honrar o valor de `Retry-After` ao oferecer o retry manual.
5. WHEN um erro de IA ocorre, THE AiHubComponent SHALL preservar o input do usuário.
6. WHEN um erro de IA é exibido, THE AiHubComponent SHALL mostrar o `correlationId` para suporte.

### Requirement 11: Hard constraints (NFR)

**User Story:** Como responsável pela operação em produção, quero que nenhuma falha real seja mascarada e que todos os parâmetros de resiliência sejam configuráveis, para que o comportamento em produção seja seguro e auditável.

#### Acceptance Criteria

1. IF uma falha real ocorre no profile `cloud`, THEN THE Sistema_IA SHALL responder com um erro (4xx/5xx apropriado) e NÃO retornar um resultado produzido pelo mock.
2. THE Sistema_IA SHALL habilitar o mock apenas como modo explícito e selecionável (profile `!cloud` / flag), nunca como default do caminho real.
3. THE Sistema_IA SHALL ler todos os parâmetros de resiliência (timeouts, retry, circuit breaker e rate-limit) a partir de configuração por ambiente, sem valores hardcoded.
4. THE Sistema_IA SHALL aplicar a política de redação de dados sensíveis em todo o caminho de IA.

### Requirement 12: Estratégia de teste (NFR)

**User Story:** Como engenheiro de qualidade, quero disparar falhas de forma determinística com um provedor fake e validar invariantes por propriedade, para que a resiliência seja verificada sem custo nem outage reais do provedor.

#### Acceptance Criteria

1. THE Sistema_IA SHALL fornecer um provedor FAKE/STUB (`AiGatewayPort`), em profile de teste, capaz de disparar deterministicamente timeout, 429, 5xx, JSON malformado, schema inválido e variações de `finishReason` (incluindo `MAX_TOKENS` e candidates vazio).
2. THE Sistema_IA SHALL incluir testes baseados em propriedade (property-based) para os invariantes de resiliência definidos no design.
3. WHERE o ambiente não possui Maven local, THE Sistema_IA SHALL ter os testes com stub escritos para execução em CI / ambiente com Maven.
4. THE Sistema_IA SHALL limitar o único teste com provedor Vertex real ao smoke do caminho feliz.
