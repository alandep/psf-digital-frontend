import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { IPaisService } from './pais-service.interface';
import { environment } from '../../../environments/environment';
import { Pais } from '../../../types/pais';

// HTTP gateway for the Pais (country reference) data. Hits the REAL BFF
// (GET /bff/paises). Session cookies and the X-XSRF-TOKEN CSRF header are
// attached automatically by the credentialsInterceptor and csrfInterceptor,
// so no extra wiring is needed. Any authenticated user can read this list.
// Countries are static reference data, so the response is cached in-memory via
// shareReplay(1): repeated opens of the combo reuse the first fetch instead of
// re-hitting the backend. The backend PaisView fields match Pais exactly, so
// no mapping is needed.
@Injectable({
  providedIn: 'root'
})
export class PaisHttpService implements IPaisService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/paises`;

  private cache$?: Observable<Pais[]>;

  listar(): Observable<Pais[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Pais[]>(this.api).pipe(shareReplay(1));
    }
    return this.cache$;
  }
}
