import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
  userId: string;
  organizationId: string;
}

// Resolve o usuário/organização da sessão atual via GET /bff/auth/me.
// Usado para preencher campos de auditoria como "Criado por".
@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/auth/me`;
  private cache$?: Observable<CurrentUser | null>;

  // Retorna o usuário atual (cacheado) ou null quando não autenticado/erro.
  me(): Observable<CurrentUser | null> {
    if (!this.cache$) {
      this.cache$ = this.http.get<{ user: string; org: string }>(this.api).pipe(
        map(r => ({ userId: r.user, organizationId: r.org }) as CurrentUser),
        catchError(() => of(null)),
        shareReplay(1)
      );
    }
    return this.cache$;
  }
}
