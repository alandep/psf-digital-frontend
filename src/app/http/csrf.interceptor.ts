import { HttpInterceptorFn } from '@angular/common/http';

// Cookie-based CSRF for mutating /bff/** writes (except CSRF-exempt
// /bff/auth/**). Reads the 'XSRF-TOKEN' cookie and mirrors it into the
// 'X-XSRF-TOKEN' header. Guards against SSR where document is unavailable.
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const isBff = req.url.startsWith('/bff') || req.url.includes('/bff/');
  const isAuth = req.url.includes('/bff/auth/');

  if (!isBff || isAuth || !MUTATING.has(req.method.toUpperCase())) {
    return next(req);
  }

  const token = readCookie('XSRF-TOKEN');
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'X-XSRF-TOKEN': token } }));
};
