import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Ensures the httpOnly session cookie established by POST /bff/auth/** flows on
// every subsequent BFF request (cross-origin in dev). Only touches BFF calls.
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const base = environment.bffBaseUrl;
  const isBff =
    req.url.startsWith('/bff') ||
    (!!base && req.url.startsWith(base + '/bff')) ||
    req.url.includes('/bff/');

  if (!isBff) {
    return next(req);
  }
  return next(req.clone({ withCredentials: true }));
};
