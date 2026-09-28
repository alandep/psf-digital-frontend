import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
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
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const body = (err.error ?? {}) as ApiError;
        const message =
          body.message || err.message || 'Ocorreu um erro inesperado.';
        // Session expired/absent on a protected BFF call: route to the app login.
        // Skip the auth endpoints (a 401 there is a normal credential failure) and
        // avoid looping if we're already on the login page.
        const isBff = req.url.startsWith('/bff') || req.url.includes('/bff/');
        const isAuth = req.url.includes('/bff/auth/');
        if (err.status === 401 && isBff && !isAuth && !router.url.startsWith('/login')) {
          router.navigate(['/login']);
        }
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
