import { HttpErrorResponse } from '@angular/common/http';

const FALLBACK = 'Não foi possível concluir a operação. Tente novamente em instantes.';

/**
 * Extrai a mensagem pt-BR de um erro do BFF. O `errorInterceptor` global normaliza
 * HttpErrorResponse em `Error(message)`; tratamos também o HttpErrorResponse cru
 * (`err.error.message`) para quando o interceptor não estiver no caminho.
 */
export function extractErrorMessage(err: unknown, fallback: string = FALLBACK): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: unknown } | null;
    if (body && typeof body.message === 'string' && body.message) {
      return body.message;
    }
    return err.status === 0 ? 'Sem conexão com o servidor. Verifique sua internet.' : fallback;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
