/**
 * Erro de IA normalizado para a UX do AiHubComponent.
 *
 * Modela o erro ja traduzido pelo errorInterceptor (que carrega
 * status/code/correlationId/retryAfterSeconds) somado a uma mensagem pt-BR
 * computada no componente (via `mensagemErro`). O campo `retryable` indica se a
 * UI deve oferecer a afordancia de "Tentar novamente".
 */
export interface AiFriendlyError {
  /** Status HTTP real da resposta (quando disponivel). */
  status?: number;
  /** Codigo de negocio do envelope ApiError do backend (ex.: AI_RATE_LIMITED). */
  code?: string;
  /** Mensagem amigavel em pt-BR, ja computada pelo componente. */
  message: string;
  /** Identificador de correlacao para suporte (surfado pela tarefa 5.3). */
  correlationId?: string;
  /** Segundos de espera do header Retry-After, quando presente (ex.: 429). */
  retryAfterSeconds?: number;
  /** true para erros retentaveis (status 503, 504 ou 429). */
  retryable: boolean;
}

/** Statuses considerados retentaveis para a afordancia de retry manual. */
const RETRYABLE_STATUSES: ReadonlySet<number> = new Set([429, 503, 504]);

/**
 * Converte um erro normalizado (pelo errorInterceptor) num `AiFriendlyError`.
 *
 * Funcao pura: le `status`, `code`, `correlationId` e `retryAfterSeconds` do erro
 * e calcula `retryable` a partir do status (429/503/504). A `message` pt-BR e
 * passada pelo chamador (o componente ja possui o mapa via `mensagemErro`).
 *
 * @param err Erro desconhecido lancado pela cadeia HTTP (normalizado ou nao).
 * @param message Mensagem pt-BR a exibir ao usuario.
 */
export function toAiFriendlyError(err: unknown, message: string): AiFriendlyError {
  const e = (err ?? {}) as {
    status?: number;
    code?: string;
    correlationId?: string;
    retryAfterSeconds?: number;
  };
  const status = typeof e.status === 'number' ? e.status : undefined;
  return {
    status,
    code: e.code,
    message,
    correlationId: e.correlationId,
    retryAfterSeconds:
      typeof e.retryAfterSeconds === 'number' ? e.retryAfterSeconds : undefined,
    retryable: status != null && RETRYABLE_STATUSES.has(status)
  };
}
