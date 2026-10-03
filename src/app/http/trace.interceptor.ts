import { HttpInterceptorFn } from '@angular/common/http';

// Propaga observabilidade ponta-a-ponta nas chamadas de IA do BFF.
// Gera um 'X-Trace-Id' novo por requisição e o anexa apenas em rotas
// '/bff/ai/**' (escopo restrito para não poluir requests nao relacionadas).
// O backend 'AiTraceContextFilter' le esse header para o MDC. Preferimos
// 'crypto.randomUUID()' quando disponivel, com fallback simples caso contrario.
function newTraceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const traceInterceptor: HttpInterceptorFn = (req, next) => {
  const isAi = req.url.includes('/bff/ai/');
  if (!isAi) {
    return next(req);
  }

  const traceId = newTraceId();
  return next(req.clone({ setHeaders: { 'X-Trace-Id': traceId } }));
};
