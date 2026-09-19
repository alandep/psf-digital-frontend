import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// Backend error envelope emitted by the BFF's global exception handler.
interface ApiError {
  code?: string;
  message?: string;
  correlationId?: string;
  errors?: unknown;
}

// Normalizes backend errors into a plain Error carrying the pt-BR message and
// the backend code, so callers/snackbars can display it. Does not swallow.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const body = (err.error ?? {}) as ApiError;
        const message =
          body.message || err.message || 'Ocorreu um erro inesperado.';
        const normalized = new Error(message) as Error & {
          code?: string;
          correlationId?: string;
          status?: number;
        };
        normalized.code = body.code;
        normalized.correlationId = body.correlationId;
        normalized.status = err.status;
        return throwError(() => normalized);
      }
      return throwError(() => err);
    })
  );
};
