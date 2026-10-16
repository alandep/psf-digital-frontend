import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProdutoService } from './produto-service.interface';
import { environment } from '../../../environments/environment';
import { Produto, NovoProduto } from '../../../types/produto';

// HTTP gateway for the Produto (catálogo) cadastro. Only used when
// environment.realApis.export === true; otherwise the ProdutoMockAdapter
// is provided. This adapter hits the REAL BFF
// (GET /bff/produtos and POST /bff/produtos). Session cookies and the
// X-XSRF-TOKEN CSRF header are attached automatically by the
// credentialsInterceptor and csrfInterceptor, so no extra wiring is needed.
// There is intentionally NO fallback to the mock here: real backend errors are
// surfaced to the screen so the operator sees genuine failures. The backend
// ProdutoView fields match Produto exactly, so no mapping is needed.
@Injectable({
  providedIn: 'root'
})
export class ProdutoHttpService implements IProdutoService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/produtos`;

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.api);
  }

  criar(payload: NovoProduto): Observable<Produto> {
    return this.http.post<Produto>(this.api, payload);
  }
}
