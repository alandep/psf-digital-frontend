import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthProfileService } from '../../services/authProfileService';

/**
 * Functional guard that blocks navigation to screens the current profile is
 * not allowed to access. The full-access admin is never blocked. When the
 * profile has not been loaded yet, it loads it first and then decides.
 */
export const profileAccessGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const auth = inject(AuthProfileService);
  const router = inject(Router);

  // Build the full path from the matched URL segments of this route.
  const fullPath = route.pathFromRoot
    .map((r) => r.url.map((seg) => seg.path).join('/'))
    .filter((p) => p.length > 0)
    .join('/');

  const decide = (): boolean | UrlTree => {
    if (auth.canAccessRoute(fullPath)) {
      return true;
    }
    return router.createUrlTree(['/home-logged/acesso-negado']);
  };

  if (auth.currentProfile) {
    return decide();
  }

  // Profile not loaded yet: load, then decide. Never hard-block on error.
  return auth.loadProfile().pipe(
    map(() => decide()),
    catchError(() => of(true))
  );
};
