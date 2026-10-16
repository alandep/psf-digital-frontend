import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ILocalidadeService } from './localidade-service.interface';
import { environment } from '../../../environments/environment';
import { Estado, Cidade } from '../../../types/localidade';

/**
 * HTTP gateway for Brazilian state/city reference data. Hits the real BFF
 * (GET /bff/estados and GET /bff/cidades?uf=XX). Session cookie + CSRF header are
 * attached by the global interceptors. States are static, so cached in-memory
 * via shareReplay(1); cities are cached per-UF.
 */
@Injectable({ providedIn: 'root' })
export class LocalidadeHttpService implements ILocalidadeService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.bffBaseUrl;

  private estados$?: Observable<Estado[]>;
  private cidadesCache = new Map<string, Observable<Cidade[]>>();

  listarEstados(): Observable<Estado[]> {
    if (!this.estados$) {
      this.estados$ = this.http.get<Estado[]>(`${this.base}/bff/estados`).pipe(shareReplay(1));
    }
    return this.estados$;
  }

  listarCidades(uf: string): Observable<Cidade[]> {
    const key = (uf ?? '').trim().toUpperCase();
    if (!key) { return of([]); }
    let cached = this.cidadesCache.get(key);
    if (!cached) {
      cached = this.http.get<Cidade[]>(`${this.base}/bff/cidades`, { params: { uf: key } }).pipe(shareReplay(1));
      this.cidadesCache.set(key, cached);
    }
    return cached;
  }
}