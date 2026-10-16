import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IImportadorService } from './importador-service.interface';
import { environment } from '../../../environments/environment';
import { Importador, NovoImportador } from '../../../types/importador';

// HTTP gateway for the Importador (cliente) cadastro. Only used when
// environment.realApis.export === true; otherwise the ImportadorMockAdapter
// is provided. This adapter hits the REAL BFF
// (GET /bff/importadores and POST /bff/importadores). Session cookies and the
// X-XSRF-TOKEN CSRF header are attached automatically by the
// credentialsInterceptor and csrfInterceptor, so no extra wiring is needed.
// There is intentionally NO fallback to the mock here: real backend errors are
// surfaced to the screen so the operator sees genuine failures. The backend
// ClienteView fields match Importador exactly, so no mapping is needed.
@Injectable({
  providedIn: 'root'
})
export class ImportadorHttpService implements IImportadorService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/importadores`;

  listar(): Observable<Importador[]> {
    return this.http.get<Importador[]>(this.api);
  }

  criar(payload: NovoImportador): Observable<Importador> {
    return this.http.post<Importador>(this.api, payload);
  }
}
